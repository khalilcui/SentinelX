"""
Basic, authorized-use network reconnaissance.

This performs standard TCP-connect checks against a curated list of
well-known ports — the same class of check any browser or client makes
when it opens a connection. It does NOT perform SYN/stealth scanning,
does NOT attempt to exploit anything it finds, and does NOT brute-force
credentials. It is meant for scanning hosts you own or are explicitly
authorized to test, exactly like this project's brief specifies.
"""

from __future__ import annotations

import socket
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

CONNECT_TIMEOUT = 0.8
MAX_WORKERS = 20

# A curated set of commonly-referenced ports — enough to give a useful
# defensive picture without turning this into a bulk internet scanner.
COMMON_PORTS: dict[int, str] = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    993: "IMAPS",
    995: "POP3S",
    1433: "MSSQL",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    5900: "VNC",
    6379: "Redis",
    8080: "HTTP-Alt",
    8443: "HTTPS-Alt",
}

RISKY_EXPOSED_SERVICES = {
    21: "FTP transmits credentials in plaintext.",
    23: "Telnet transmits everything, including passwords, in plaintext.",
    3306: "MySQL should not typically be reachable from outside your network.",
    5432: "PostgreSQL should not typically be reachable from outside your network.",
    6379: "Redis has no auth by default and is a common ransomware entry point.",
    3389: "RDP exposed to the internet is a top target for brute-force attacks.",
    5900: "VNC exposed to the internet is a common target for unauthorized access.",
    445: "SMB exposed to the internet was the vector for WannaCry/NotPetya.",
}


def _resolve(host: str) -> str | None:
    try:
        return socket.gethostbyname(host)
    except socket.gaierror:
        return None


def _check_port(ip: str, port: int) -> dict | None:
    start = time.monotonic()
    try:
        with socket.create_connection((ip, port), timeout=CONNECT_TIMEOUT) as sock:
            elapsed_ms = round((time.monotonic() - start) * 1000, 1)
            banner = _grab_banner(sock, port)
            return {
                "port": port,
                "service": COMMON_PORTS.get(port, "Unknown"),
                "state": "open",
                "response_time_ms": elapsed_ms,
                "banner": banner,
            }
    except (socket.timeout, ConnectionRefusedError, OSError):
        return None


def _grab_banner(sock: socket.socket, port: int) -> str | None:
    try:
        sock.settimeout(0.6)
        if port in (80, 8080, 443, 8443):
            sock.sendall(b"HEAD / HTTP/1.0\r\n\r\n")
        data = sock.recv(256)
        text = data.decode(errors="ignore").strip()
        return text[:150] if text else None
    except Exception:  # noqa: BLE001
        return None


def _guess_os(open_ports: list[dict]) -> dict:
    open_port_numbers = {p["port"] for p in open_ports}

    if 3389 in open_port_numbers or 445 in open_port_numbers:
        return {"guess": "Likely Windows", "confidence": "low", "basis": "RDP/SMB port(s) open"}
    if 22 in open_port_numbers and not ({3389, 445} & open_port_numbers):
        return {"guess": "Likely Linux/Unix", "confidence": "low", "basis": "SSH open, no Windows-typical ports"}
    return {
        "guess": "Undetermined",
        "confidence": "none",
        "basis": "No strongly OS-indicative ports observed; accurate fingerprinting needs raw-socket access this passive scan does not use.",
    }


def _risk_level(score: float) -> str:
    if score >= 80:
        return "low"
    if score >= 50:
        return "medium"
    return "high"


def run_network_assessment(target_host: str) -> dict:
    ip = _resolve(target_host)
    if not ip:
        return {
            "target_host": target_host,
            "resolved_ip": None,
            "host_up": "down",
            "response_time_ms": None,
            "open_ports": [],
            "os_guess": {"guess": "Undetermined", "confidence": "none", "basis": "Host could not be resolved"},
            "risk_score": 0,
            "risk_level": "high",
            "recommendations": ["Could not resolve this hostname — double check it's correct and publicly resolvable."],
        }

    open_ports: list[dict] = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(_check_port, ip, port): port for port in COMMON_PORTS}
        for future in as_completed(futures):
            result = future.result()
            if result:
                open_ports.append(result)

    open_ports.sort(key=lambda p: p["port"])
    host_up = "up" if open_ports else "down"
    avg_response = (
        round(sum(p["response_time_ms"] for p in open_ports) / len(open_ports), 1)
        if open_ports
        else None
    )

    os_guess = _guess_os(open_ports)

    recommendations = []
    risky_found = 0
    for p in open_ports:
        note = RISKY_EXPOSED_SERVICES.get(p["port"])
        if note:
            risky_found += 1
            recommendations.append(f"Port {p['port']} ({p['service']}) is open — {note}")

    if not open_ports:
        recommendations.append(
            "No common ports responded — either the host is down, unreachable from here, or well firewalled."
        )
    elif not recommendations:
        recommendations.append("No commonly-risky ports were found open among the checked set. Keep monitoring regularly.")

    # Simple scoring: start at 100, deduct per risky exposed service, small deduction per extra open port.
    score = 100 - (risky_found * 20) - max(0, len(open_ports) - risky_found) * 3
    score = max(0, min(100, score))

    return {
        "target_host": target_host,
        "resolved_ip": ip,
        "host_up": host_up,
        "response_time_ms": avg_response,
        "open_ports": open_ports,
        "os_guess": os_guess,
        "risk_score": score,
        "risk_level": _risk_level(score),
        "recommendations": recommendations,
    }
