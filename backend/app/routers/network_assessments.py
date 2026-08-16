from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.network_assessment import NetworkAssessment
from app.models.user import User
from app.schemas.network_assessment import NetworkAssessmentCreate, NetworkAssessmentOut
from app.services.network_scanner import run_network_assessment

router = APIRouter(prefix="/api/v1/assessments/network", tags=["network-assessment"])
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=NetworkAssessmentOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_assessment(
    request: Request,
    payload: NetworkAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = run_network_assessment(payload.target_host)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not assess target: {exc}",
        )

    assessment = NetworkAssessment(
        user_id=current_user.id,
        target_host=result["target_host"],
        resolved_ip=result["resolved_ip"],
        host_up=result["host_up"],
        response_time_ms=result["response_time_ms"],
        open_ports=result["open_ports"],
        os_guess=result["os_guess"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        recommendations=result["recommendations"],
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.get("", response_model=list[NetworkAssessmentOut])
def list_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(NetworkAssessment)
        .filter(NetworkAssessment.user_id == current_user.id)
        .order_by(NetworkAssessment.created_at.desc())
        .all()
    )


@router.get("/{assessment_id}", response_model=NetworkAssessmentOut)
def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(NetworkAssessment)
        .filter(NetworkAssessment.id == assessment_id, NetworkAssessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    return assessment
