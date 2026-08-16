from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReportCreate(BaseModel):
    assessment_id: str
    title: str | None = None


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    assessment_id: str
    target_url: str
    risk_score: float
    risk_level: str
    created_at: datetime
