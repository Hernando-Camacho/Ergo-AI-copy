from sqlalchemy import Column, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class ActiveBreak(Base):
    __tablename__ = "active_breaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    # Duración en segundos (puede ser calculado, pero útil guardarlo)
    duration_seconds = Column(Integer, default=0)
    
    # Puntaje de ergonomía evaluado por la IA (0-100)
    score = Column(Integer, default=100)
    
    # Métricas detalladas guardadas como JSON para escalabilidad
    # Ejemplo: {"correct_postures": 15, "incorrect_postures": 3, "fatigue_alerts": 0}
    metrics = Column(JSON, default=dict)
