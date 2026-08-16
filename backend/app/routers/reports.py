import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.assessment import WebsiteAssessment
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportOut
from app.services.pdf_report import generate_assessment_pdf

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(WebsiteAssessment)
        .filter(WebsiteAssessment.id == payload.assessment_id, WebsiteAssessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    filepath = generate_assessment_pdf(assessment)

    report = Report(
        user_id=current_user.id,
        assessment_id=assessment.id,
        title=payload.title or f"Website Assessment — {assessment.target_url}",
        file_path=filepath,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=list[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )


@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found")

    return FileResponse(report.file_path, media_type="application/pdf", filename=os.path.basename(report.file_path))
