from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.domain import Standard, QCO

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        std_count = db.query(Standard).count()
        return {
            "status": "healthy",
            "database": "connected",
            "standards_count": std_count,
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "degraded",
            "database": "disconnected",
            "error": str(e)
        }

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    std_count = db.query(Standard).count()
    qco_count = db.query(QCO).count()
    return {
        "active_procurements_count": 7,
        "standards_under_watch": 18,
        "total_standards_in_corpus": std_count,
        "active_qcos": qco_count,
        "verified_percentage": 94.5,
        "last_ingestion_timestamp": "2026-09-21T18:00:00Z"
    }
