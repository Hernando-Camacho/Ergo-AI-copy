from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.prescription import Prescription
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

class PrescriptionCreate(BaseModel):
    specialist_id: int
    user_id: int
    title: str
    content: str
    type: str = "exercise"

class PrescriptionResponse(BaseModel):
    id: int
    specialist_id: int
    user_id: int
    title: str
    content: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=PrescriptionResponse)
def create_prescription(data: PrescriptionCreate, db: Session = Depends(get_db)):
    db_p = Prescription(**data.model_dump())
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p

@router.get("/user/{user_id}", response_model=List[PrescriptionResponse])
def get_user_prescriptions(user_id: int, db: Session = Depends(get_db)):
    return db.query(Prescription).filter(Prescription.user_id == user_id).all()
