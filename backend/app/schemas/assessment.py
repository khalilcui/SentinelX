from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, field_validator


class AssessmentCreate(BaseModel):
    target_url: str

    @field_validator("target_url")
    @classmethod
    def normalize_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            v = f"https://{v}"
        return v


class AssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    target_url: str
    risk_score: float
    risk_level: str
    ssl_info: Optional[dict[str, Any]] = None
    security_headers: Optional[dict[str, Any]] = None
    cookie_security: Optional[dict[str, Any]] = None
    robots_txt: Optional[dict[str, Any]] = None
    sitemap_xml: Optional[dict[str, Any]] = None
    tech_stack: Optional[dict[str, Any]] = None
    recommendations: Optional[list[str]] = None
    created_at: datetime
