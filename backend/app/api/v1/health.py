from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.domain import Standard

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    std_count = db.query(Standard).count()
    return {
        "status": "healthy",
        "database": "connected",
        "standards_count": std_count,
        "version": settings.VERSION,
        "dataset_version": settings.DATASET_VERSION
    }

@router.get("/metrics")
def metrics(db: Session = Depends(get_db)):
    std_count = db.query(Standard).count()
    return {
        "status": "ok",
        "metrics": {
            "total_standards": std_count,
            "system_uptime": "active",
            "retrieval_mode": "hybrid_bm25_dense"
        }
    }
