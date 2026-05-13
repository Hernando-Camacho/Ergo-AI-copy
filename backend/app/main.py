from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router as api_router
from app.core.database import engine, Base # <--- Importamos esto

# Esta línea crea las tablas en el archivo ergoai.db si no existen
Base.metadata.create_all(bind=engine)

from app.core.config import settings

app = FastAPI(title="ErgoAI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router) # <--- Asegúrate de tener esta línea para que funcionen las rutas

@app.get("/")
def read_root():
    return {"status": "ErgoAI Online", "message": "Sistema de monitoreo ergonómico activo"}