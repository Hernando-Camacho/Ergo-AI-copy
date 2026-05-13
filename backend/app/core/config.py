import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ErgoAI")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_ergoai_2026_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Base de datos
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://ergoai_user:ergoai_password@localhost:5433/ergoai_db")

    # CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

    class Config:
        case_sensitive = True

settings = Settings()