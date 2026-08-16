"""
Passive, read-only website security assessment.

Everything here only reads publicly-served information that any browser
visiting the site would also receive (response headers, TLS certificate
metadata, robots.txt/sitemap.xml, Set-Cookie flags). It never attempts
exploitation, brute-forcing, or any active attack against the target.
"""

from __future__ import annotations

import socket
import ssl
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests

REQUEST_TIMEOUT = 8
USER_AGENT = "SentinelX-Assessment-Bot/1.0 (+passive security scan)"

SECURITY_HEADERS = {
    "Strict-Transport-Security": "Enforces HTTPS connections (HSTS)",
    "Content-Security-Policy": "Restricts sources of scripts/styles to prevent XSS",
    "X-Content-Type-Options": "Prevents MIME-type sniffing",
    "X-Frame-Options": "Protects against clickjacking",
    "Referrer-Policy": "Controls how much referrer info is leaked",
    "Permissions-Policy": "Restricts access to browser features/APIs",
}


def _get_ssl_info(hostname: str, port: int = 443) -> dict:
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=REQUEST_TIMEOUT) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()

        not_after = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        days_remaining = (not_after - datetime.now(timezone.utc)).days

        issuer = dict(x[0] for x in cert.get("issuer", []))

        return {
            "valid": True,
            "issuer": issuer.get("organizationName", issuer.get("commonName", "Unknown")),
            "expires": cert["notAfter"],
            "days_remaining": days_remaining,
            "expiring_soon": days_remaining < 30,
        }
    except Exception as exc:  # noqa: BLE001
        return {"valid": False, "error": str(exc)}


def _check_security_headers(headers: requests.structures.CaseInsensitiveDict) -> dict:
    present = {}
    missing = []
    for header, description in SECURITY_HEADERS.items():
        if header in headers:
            present[header] = headers[header]
        else:
            missing.append({"header": header, "description": description})
    return {
        "present": present,
        "missing": missing,
        "score": round(len(present) / len(SECURITY_HEADERS) * 100),
    }


def _check_cookie_security(response: requests.Response) -> dict:
    try:
        cookie_list = response.raw.headers.getlist("Set-Cookie")
    except AttributeError:
        raw_cookies = response.headers.get("Set-Cookie")
        cookie_list = [raw_cookies] if raw_cookies else []

    if not cookie_list:
        return {"cookies_found": 0, "issues": [], "note": "No Set-Cookie header observed"}

    issues = []
    for cookie in cookie_list:
        lower = cookie.lower()
        flags_missing = []
        if "secure" not in lower:
            flags_missing.append("Secure")
        if "httponly" not in lower:
            flags_missing.append("HttpOnly")
        if "samesite" not in lower:
            flags_missing.append("SameSite")
        if flags_missing:
            issues.append({"cookie": cookie.split("=")[0], "missing_flags": flags_missing})

    return {"cookies_found": len(cookie_list), "issues": issues}


def _fetch_text_resource(base_url: str, path: str) -> dict:
    url = base_url.rstrip("/") + path
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": USER_AGENT})
        return {
            "found": resp.status_code == 200,
            "status_code": resp.status_code,
            "url": url,
            "preview": resp.text[:500] if resp.status_code == 200 else None,
        }
    except requests.RequestException as exc:
        return {"found": False, "url": url, "error": str(exc)}


def _fingerprint_tech(headers: requests.structures.CaseInsensitiveDict) -> dict:
    fingerprint = {}
    for key in ("Server", "X-Powered-By", "X-AspNet-Version", "X-Generator"):
        if key in headers:
            fingerprint[key] = headers[key]
    return fingerprint


def _risk_level(score: float) -> str:
    if score >= 80:
        return "low"
    if score >= 50:
        return "medium"
    return "high"


def run_website_assessment(target_url: str) -> dict:
    parsed = urlparse(target_url)
    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Invalid URL — could not determine hostname")

    base_url = f"{parsed.scheme}://{parsed.netloc}"

    response = requests.get(
        target_url,
        timeout=REQUEST_TIMEOUT,
        headers={"User-Agent": USER_AGENT},
        allow_redirects=True,
    )
    headers = response.headers

    ssl_info = _get_ssl_info(hostname) if parsed.scheme == "https" else {
        "valid": False,
        "error": "Site is not served over HTTPS",
    }
    security_headers = _check_security_headers(headers)
    cookie_security = _check_cookie_security(response)
    robots_txt = _fetch_text_resource(base_url, "/robots.txt")
    sitemap_xml = _fetch_text_resource(base_url, "/sitemap.xml")
    tech_stack = _fingerprint_tech(headers)

    recommendations = []
    if not ssl_info.get("valid"):
        recommendations.append("Serve the site over HTTPS with a valid TLS certificate.")
    elif ssl_info.get("expiring_soon"):
        recommendations.append("TLS certificate is expiring soon — renew it before it lapses.")

    for missing in security_headers["missing"]:
        recommendations.append(f"Add the '{missing['header']}' header — {missing['description']}.")

    for issue in cookie_security["issues"]:
        recommendations.append(
            f"Cookie '{issue['cookie']}' is missing flag(s): {', '.join(issue['missing_flags'])}."
        )

    if not robots_txt["found"]:
        recommendations.append("Consider adding a robots.txt file to guide search engine crawling.")

    # Weighted composite score: TLS 30%, headers 50%, cookies 20%
    tls_score = 100 if ssl_info.get("valid") and not ssl_info.get("expiring_soon") else (50 if ssl_info.get("valid") else 0)
    cookie_score = 100 if not cookie_security["issues"] else max(0, 100 - len(cookie_security["issues"]) * 25)

    composite = round(tls_score * 0.3 + security_headers["score"] * 0.5 + cookie_score * 0.2)

    return {
        "target_url": target_url,
        "risk_score": composite,
        "risk_level": _risk_level(composite),
        "ssl_info": ssl_info,
        "security_headers": security_headers,
        "cookie_security": cookie_security,
        "robots_txt": robots_txt,
        "sitemap_xml": sitemap_xml,
        "tech_stack": tech_stack,
        "recommendations": recommendations or ["No major issues found — keep monitoring regularly."],
    }
