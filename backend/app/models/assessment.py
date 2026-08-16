import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database.session import Base


class WebsiteAssessment(Base):
    __tablename__ = "website_assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    target_url = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)

    ssl_info = Column(JSON, nullable=True)
    security_headers = Column(JSON, nullable=True)
    cookie_security = Column(JSON, nullable=True)
    robots_txt = Column(JSON, nullable=True)
    sitemap_xml = Column(JSON, nullable=True)
    tech_stack = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="assessments")
