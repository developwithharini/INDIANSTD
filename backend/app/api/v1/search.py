from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.domain import StandardResponse
from app.services.retrieval.hybrid import get_hybrid_candidates

router = APIRouter()

@router.get("/search", response_model=List[StandardResponse])
def search_standards_get(
    q: str = Query(..., description="Query text or exact IS number e.g. IS 10322"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    candidates = get_hybrid_candidates(q, db, top_k_lexical=limit, top_k_dense=limit)
    return [c["object"] for c in candidates if c.get("object") is not None][:limit]

@router.post("/search", response_model=List[StandardResponse])
def search_standards_post(
    payload: dict,
    db: Session = Depends(get_db)
):
    q = payload.get("query", "")
    limit = payload.get("limit", 20)
    candidates = get_hybrid_candidates(q, db, top_k_lexical=limit, top_k_dense=limit)
    return [c["object"] for c in candidates if c.get("object") is not None][:limit]
