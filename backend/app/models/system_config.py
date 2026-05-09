from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    
    # Clave de configuración, ej: 'neck_angle_threshold'
    key = Column(String, unique=True, index=True, nullable=False)
    
    # Valor guardado como string para flexibilidad
    value = Column(String, nullable=False)
    
    # Descripción para que el admin sepa qué está tocando
    description = Column(String, nullable=True)
    
    # Tipo de dato para conversión en el código: 'int', 'float', 'string'
    data_type = Column(String, default="string")
