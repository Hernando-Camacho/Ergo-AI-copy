from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.system_config import SystemConfig
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/config", tags=["config"])

class ConfigUpdate(BaseModel):
    key: str
    value: str

@router.get("/")
def get_all_config(db: Session = Depends(get_db)):
    configs = db.query(SystemConfig).all()
    return {c.key: c.value for c in configs}

@router.post("/")
def update_config(data: ConfigUpdate, db: Session = Depends(get_db)):
    db_config = db.query(SystemConfig).filter(SystemConfig.key == data.key).first()
    if db_config:
        db_config.value = data.value
    else:
        db_config = SystemConfig(key=data.key, value=data.value)
        db.add(db_config)
    db.commit()
    return {"status": "updated", "key": data.key}
