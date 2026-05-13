from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Solo administradores pueden ver todos los usuarios
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")
    return db.query(User).order_by(User.id.desc()).all()

@router.patch("/{email}")
def update_user_role(email: str, role: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Solo administradores pueden cambiar roles
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.role = role
    db.commit()
    return {"success": True, "message": f"Rol de {email} actualizado a {role}"}
