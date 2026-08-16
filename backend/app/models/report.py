import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database.session import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(String, ForeignKey("website_assessments.id"), nullable=False)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="reports")
    assessment = relationship("WebsiteAssessment")

    @property
    def target_url(self) -> str:
        return self.assessment.target_url if self.assessment else ""

    @property
    def risk_score(self) -> float:
        return self.assessment.risk_score if self.assessment else 0.0

    @property
    def risk_level(self) -> str:
        return self.assessment.risk_level if self.assessment else "unknown"
