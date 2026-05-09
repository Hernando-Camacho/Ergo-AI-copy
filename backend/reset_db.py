import sys
import os

# Añadir el directorio actual al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models import User, ActiveBreak, Prescription, SystemConfig

print("⚠️ ADVERTENCIA: Borrando todas las tablas existentes...")
Base.metadata.drop_all(bind=engine)
print("✅ Base de datos limpia.")

print("🚀 Creando tablas nuevas...")
Base.metadata.create_all(bind=engine)
print("✅ Tablas creadas exitosamente.")

# Crear un admin por defecto para que no se queden fuera
from app.core.security import get_password_hash
from sqlalchemy.orm import Session
from app.core.database import SessionLocal

db = SessionLocal()
try:
    admin_email = "admin@ergoai.com"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        admin_user = User(
            email=admin_email,
            full_name="Administrador Global",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print(f"👤 Usuario de respaldo creado: {admin_email} / admin123")
except Exception as e:
    print(f"❌ Error al crear admin: {e}")
finally:
    db.close()
