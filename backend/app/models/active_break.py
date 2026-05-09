from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class ActiveBreak(Base):
    __tablename__ = "active_breaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Campo para analítica histórica
    department = Column(String, nullable=True)
    
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0)
    score = Column(Integer, default=100)
    metrics = Column(JSON, default=dict)
