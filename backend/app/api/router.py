from fastapi import APIRouter
from app.api import auth, breaks, prescriptions, config, stats

router = APIRouter()

router.include_router(auth.router)
router.include_router(breaks.router)
router.include_router(prescriptions.router)
router.include_router(config.router)
router.include_router(stats.router)

@router.get("/health")
def health_check():
    return {"status": "ok", "detail": "API Router con Auth operativo"}