from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.domain import StandardResponse
from app.models.domain import Standard
from app.services.graph.engine import graph_engine

router = APIRouter()

@router.get("/standards", response_model=List[StandardResponse])
def list_standards(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Standard)
    if category:
        query = query.filter(Standard.category.ilike(f"%{category}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/standards/{standard_id}", response_model=StandardResponse)
def get_standard_detail(standard_id: str, db: Session = Depends(get_db)):
    std = db.query(Standard).filter(Standard.id == standard_id).first()
    if not std:
        raise HTTPException(status_code=404, detail="Standard not found")
    return std

@router.get("/standards/{standard_id}/relationships")
def get_standard_relationships(standard_id: str, db: Session = Depends(get_db)):
    std = db.query(Standard).filter(Standard.id == standard_id).first()
    if not std:
        raise HTTPException(status_code=404, detail="Standard not found")
    return graph_engine.get_related_standards(standard_id, db)
