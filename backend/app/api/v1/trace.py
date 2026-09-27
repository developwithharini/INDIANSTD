from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, get_db
from app.models.domain import Standard
from app.core.config import settings
from app.services.matching.trace_service import trace_collector

router = APIRouter()

@router.get("/analyses/{analysis_id}/trace")
async def get_analysis_trace(analysis_id: str, debug: bool = Query(default=False)):
    """
    Development-only endpoint returning complete DiagnosticTrace for specified analysis.
    Inaccessible in production mode unless debug=true query parameter or DEBUG_RETRIEVAL_TRACE env flag is active.
    """
    if not settings.DEBUG_RETRIEVAL_TRACE and not debug:
        raise HTTPException(
            status_code=403,
            detail="Diagnostic tracing is disabled in production mode. Set DEBUG_RETRIEVAL_TRACE=true or pass ?debug=true."
        )

    trace_data = trace_collector.get_trace_by_id(analysis_id)
    if not trace_data:
        raise HTTPException(status_code=404, detail=f"Diagnostic trace for analysis '{analysis_id}' not found.")

    return trace_data

@router.get("/diagnostics/status")
async def get_diagnostics_status(db: Session = Depends(get_db)):
    """
    Returns system diagnostic status, dataset counts, active models, and debug flag state.
    """
    standards_count = db.query(Standard).count()
    return {
        "status": "operational",
        "dataset_version": settings.DATASET_VERSION,
        "standards_count": standards_count,
        "embedding_model": settings.EMBEDDING_MODEL,
        "reranker_model": settings.RERANKER_MODEL,
        "bm25_ready": True,
        "faiss_ready": True,
        "debug_retrieval_trace_enabled": settings.DEBUG_RETRIEVAL_TRACE,
        "execution_mode": "LOCAL_FALLBACK"
    }
