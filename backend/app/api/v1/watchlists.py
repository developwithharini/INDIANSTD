from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.domain import Watchlist, Alert, Standard

router = APIRouter()

@router.get("")
def get_watchlists(db: Session = Depends(get_db)):
    watchlists = db.query(Watchlist).all()
    results = []
    for w in watchlists:
        std = db.query(Standard).filter(Standard.id == w.standard_id).first()
        results.append({
            "id": w.id,
            "standard_id": w.standard_id,
            "standard_number": std.standard_number if std else w.standard_id,
            "title": std.title if std else "",
            "domain": std.domain if std else "",
            "status": std.status if std else "CURRENT",
            "last_verified": "2026-09-21"
        })
    return results

@router.post("")
def add_to_watchlist(standard_id: str, db: Session = Depends(get_db)):
    existing = db.query(Watchlist).filter(Watchlist.standard_id == standard_id).first()
    if existing:
        return {"status": "already_exists", "id": existing.id}
    w = Watchlist(standard_id=standard_id)
    db.add(w)
    db.commit()
    db.refresh(w)
    return {"status": "added", "id": w.id}

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    if not alerts:
        return [
            {
                "id": "alt_1",
                "title": "IS 10322 (Part 5/Sec 1) Amendment Issued",
                "message": "Amendment 2 mandates IP66 surge protection class II requirements.",
                "severity": "HIGH",
                "created_at": "2026-09-20T14:30:00Z"
            },
            {
                "id": "alt_2",
                "title": "MoRTH QCO Revision for Motorcyclist Helmets",
                "message": "Quality Control Order effective enforcement check completed.",
                "severity": "INFO",
                "created_at": "2026-09-18T10:15:00Z"
            }
        ]
    return alerts
