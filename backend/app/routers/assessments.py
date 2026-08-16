from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.assessment import WebsiteAssessment
from app.models.report import Report
from app.models.user import User
from app.schemas.assessment import AssessmentCreate, AssessmentOut
from app.services.pdf_report import generate_assessment_pdf
from app.services.website_scanner import run_website_assessment

router = APIRouter(prefix="/api/v1/assessments/website", tags=["website-assessment"])


@router.post("", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
def create_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = run_website_assessment(payload.target_url)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not reach or assess target: {exc}",
        )

    assessment = WebsiteAssessment(
        user_id=current_user.id,
        target_url=result["target_url"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        ssl_info=result["ssl_info"],
        security_headers=result["security_headers"],
        cookie_security=result["cookie_security"],
        robots_txt=result["robots_txt"],
        sitemap_xml=result["sitemap_xml"],
        tech_stack=result["tech_stack"],
        recommendations=result["recommendations"],
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # A report is generated automatically for every assessment so it
    # shows up on the Reports page without an extra step.
    try:
        filepath = generate_assessment_pdf(assessment)
        report = Report(
            user_id=current_user.id,
            assessment_id=assessment.id,
            title=f"Website Assessment — {assessment.target_url}",
            file_path=filepath,
        )
        db.add(report)
        db.commit()
    except Exception:  # noqa: BLE001
        # Report generation failing shouldn't fail the assessment itself.
        db.rollback()

    return assessment


@router.get("", response_model=list[AssessmentOut])
def list_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(WebsiteAssessment)
        .filter(WebsiteAssessment.user_id == current_user.id)
        .order_by(WebsiteAssessment.created_at.desc())
        .all()
    )


@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(WebsiteAssessment)
        .filter(WebsiteAssessment.id == assessment_id, WebsiteAssessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    return assessment
