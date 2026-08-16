import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.core.config import get_settings
from app.models.assessment import WebsiteAssessment

settings = get_settings()

RISK_COLORS = {
    "low": colors.HexColor("#16A34A"),
    "medium": colors.HexColor("#F97316"),
    "high": colors.HexColor("#DC2626"),
}


def generate_assessment_pdf(assessment: WebsiteAssessment) -> str:
    os.makedirs(settings.reports_dir, exist_ok=True)
    filename = f"report_{assessment.id}.pdf"
    filepath = os.path.join(settings.reports_dir, filename)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleStyle", parent=styles["Title"], textColor=colors.HexColor("#0F172A"))
    heading_style = ParagraphStyle("HeadingStyle", parent=styles["Heading2"], textColor=colors.HexColor("#0F172A"))
    body_style = styles["BodyText"]

    doc = SimpleDocTemplate(filepath, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    story = []

    story.append(Paragraph("SentinelX — Website Security Assessment Report", title_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Target: {assessment.target_url}", body_style))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", body_style))
    story.append(Spacer(1, 20))

    story.append(Paragraph("Executive Summary", heading_style))
    risk_color = RISK_COLORS.get(assessment.risk_level, colors.black)
    summary_table = Table(
        [["Risk Score", "Risk Level"], [f"{assessment.risk_score} / 100", assessment.risk_level.upper()]],
        colWidths=[8 * cm, 8 * cm],
    )
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("TEXTCOLOR", (1, 1), (1, 1), risk_color),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 20))

    story.append(Paragraph("TLS / SSL", heading_style))
    ssl_info = assessment.ssl_info or {}
    if ssl_info.get("valid"):
        story.append(
            Paragraph(
                f"Valid certificate issued by {ssl_info.get('issuer', 'Unknown')}, "
                f"expiring {ssl_info.get('expires', 'Unknown')} "
                f"({ssl_info.get('days_remaining', '?')} days remaining).",
                body_style,
            )
        )
    else:
        story.append(Paragraph(f"Issue detected: {ssl_info.get('error', 'HTTPS not in use')}", body_style))
    story.append(Spacer(1, 16))

    story.append(Paragraph("Security Headers", heading_style))
    headers_info = assessment.security_headers or {}
    header_rows = [["Header", "Status"]]
    for header in ["Strict-Transport-Security", "Content-Security-Policy", "X-Content-Type-Options",
                   "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]:
        present = header in (headers_info.get("present") or {})
        header_rows.append([header, "Present" if present else "Missing"])
    header_table = Table(header_rows, colWidths=[10 * cm, 6 * cm])
    header_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ]
        )
    )
    story.append(header_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Recommendations", heading_style))
    for rec in assessment.recommendations or []:
        story.append(Paragraph(f"• {rec}", body_style))

    doc.build(story)
    return filepath
