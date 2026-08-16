import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database.session import Base


class NetworkAssessment(Base):
    __tablename__ = "network_assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    target_host = Column(String, nullable=False)
    resolved_ip = Column(String, nullable=True)

    host_up = Column(String, nullable=False)  # "up" | "down"
    response_time_ms = Column(Float, nullable=True)
    open_ports = Column(JSON, nullable=True)   # list of {port, service, state, response_time_ms, banner}
    os_guess = Column(JSON, nullable=True)     # {guess, confidence, basis}
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    recommendations = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="network_assessments")
