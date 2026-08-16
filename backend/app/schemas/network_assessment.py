from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, field_validator


class NetworkAssessmentCreate(BaseModel):
    target_host: str
    authorized: bool

    @field_validator("target_host")
    @classmethod
    def clean_host(cls, v: str) -> str:
        return v.strip().replace("http://", "").replace("https://", "").split("/")[0]

    @field_validator("authorized")
    @classmethod
    def must_confirm_authorization(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must confirm you are authorized to test this host.")
        return v


class NetworkAssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    target_host: str
    resolved_ip: Optional[str] = None
    host_up: str
    response_time_ms: Optional[float] = None
    open_ports: Optional[list[dict[str, Any]]] = None
    os_guess: Optional[dict[str, Any]] = None
    risk_score: float
    risk_level: str
    recommendations: Optional[list[str]] = None
    created_at: datetime
