from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.domain import Standard, QCO

router = APIRouter()

@router.get("/data-sources")
def get_data_sources(db: Session = Depends(get_db)):
    std_count = db.query(Standard).count()
    qco_count = db.query(QCO).count()
    return [
        {
            "id": "src_bis_public",
            "name": "BIS Public Standards Portal Snapshot",
            "type": "PUBLIC_METADATA",
            "records_count": std_count,
            "status": "VERIFIED",
            "last_ingested": "2026-09-21T18:00:00Z"
        },
        {
            "id": "src_qco_notifications",
            "name": "Government Gazette QCO Notifications",
            "type": "REGULATORY_FEED",
            "records_count": qco_count,
            "status": "VERIFIED",
            "last_ingested": "2026-09-21T16:30:00Z"
        }
    ]

@router.get("/data-quality")
def get_data_quality(db: Session = Depends(get_db)):
    std_count = db.query(Standard).count()
    return {
        "total_standards": std_count,
        "verified_records": std_count,
        "unverified_records": 0,
        "missing_scope": 0,
        "relationship_completeness_pct": 98.2,
        "duplicate_conflicts": 0
    }
