from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.domain import Standard, StandardVersion, StandardAmendment, StandardRelationship
from app.schemas.domain import StandardSchema, CompareVersionsResponse
from app.services.versions.version_engine import compare_standard_versions

router = APIRouter()

@router.get("", response_model=List[StandardSchema])
def list_standards(
    domain: Optional[str] = None,
    category: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Standard)
    if domain:
        q = q.filter(Standard.domain == domain)
    if category:
        q = q.filter(Standard.category == category)
    if query:
        q = q.filter(
            (Standard.standard_number.ilike(f"%{query}%")) |
            (Standard.title.ilike(f"%{query}%")) |
            (Standard.scope_summary.ilike(f"%{query}%"))
        )
    return q.all()

@router.get("/{standard_id}", response_model=StandardSchema)
def get_standard_detail(standard_id: str, db: Session = Depends(get_db)):
    std = db.query(Standard).filter(Standard.id == standard_id).first()
    if not std:
        raise HTTPException(status_code=404, detail="Standard not found")
    return std

@router.get("/{standard_id}/versions")
def get_standard_versions(standard_id: str, db: Session = Depends(get_db)):
    versions = db.query(StandardVersion).filter(StandardVersion.standard_id == standard_id).all()
    amendments = db.query(StandardAmendment).filter(StandardAmendment.standard_id == standard_id).all()
    return {
        "versions": versions,
        "amendments": amendments
    }

@router.get("/{standard_id}/compare", response_model=CompareVersionsResponse)
def compare_versions(standard_id: str, db: Session = Depends(get_db)):
    std = db.query(Standard).filter(Standard.id == standard_id).first()
    if not std:
        raise HTTPException(status_code=404, detail="Standard not found")
    return compare_standard_versions(db, standard_id)
