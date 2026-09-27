import time
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.domain import AnalysisResponse, AnalysisRequest, StructuredRequirement, RecommendationItem
from app.services.ai.provider import get_ai_provider
from app.services.ai.document import extract_text_from_file
from app.services.retrieval.hybrid import get_hybrid_candidates
from app.services.ranking.reranker import reranker_service
from app.services.matching.applicability import applicability_engine
from app.services.versions.engine import version_engine
from app.services.graph.engine import graph_engine
from app.models.domain import Standard, ProcurementAnalysis, Recommendation
from app.services.evidence.extractor import extract_evidence_items
from app.services.evidence.mapper import requirement_mapper

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_procurement(
    text: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    input_type = "DESCRIBE"
    raw_text = text or ""

    # Handle document upload if provided
    if file:
        file_bytes = await file.read()
        extracted_text, detected_type = extract_text_from_file(file_bytes, file.filename)
        raw_text = extracted_text
        input_type = detected_type

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Please describe your procurement requirement or upload a document.")

    # 1. Requirement Extraction
    ai_provider = get_ai_provider()
    structured_req, execution_mode = ai_provider.extract_requirements(raw_text)

    # 2. Hybrid Candidate Retrieval (Lexical + Dense)
    search_query = f"{structured_req.product} {structured_req.category or ''} {structured_req.application or ''} {' '.join(structured_req.mentioned_standards)}"
    candidates = get_hybrid_candidates(search_query, db)

    # 3. Candidate Reranking
    reranked = reranker_service.rerank(search_query, candidates, top_k=10)

    # 4. Applicability Scoring & Recommendation
    recommendations, why_not = applicability_engine.generate_recommendations(structured_req, reranked)

    # 4b. Evidence Extraction for Recommended Standards
    for rec in recommendations:
        std_record = db.query(Standard).filter(Standard.id == rec.standard_id).first()
        std_dict = {
            "id": rec.standard_id,
            "standard_number": rec.standard_number,
            "title": rec.title,
            "scope": std_record.scope if std_record else rec.scope_preview,
            "category": std_record.category if std_record else None,
            "domain": std_record.domain if std_record else None,
            "status": rec.status,
            "publication_year": std_record.publication_year if std_record else None,
            "source_file": std_record.source_file if std_record else "standards.xlsx",
            "source_sheet": std_record.source_sheet if std_record else "Standards",
            "source_row": std_record.source_row if std_record else None
        }
        rec.evidence = extract_evidence_items(std_dict, structured_req, rec.score_breakdown, rec.reasons)

    # 4c. Priority 2: Requirement -> Evidence Mapping
    extracted_reqs, req_coverage, req_links, cov_summary = requirement_mapper.map_requirements_to_evidence(
        structured_req, recommendations
    )

    # 5. Version Signals & Warnings
    version_signals = version_engine.check_version_signals(structured_req.mentioned_standards, db)

    # 6. Graph Relationships for Primary Standard
    related_standards = []
    if recommendations:
        primary_id = recommendations[0].standard_id
        related_standards = graph_engine.get_related_standards(primary_id, db)

    elapsed_ms = round((time.time() - start_time) * 1000.0, 2)
    analysis_id = f"anl_{uuid.uuid4().hex[:10]}"

    # Save Analysis to SQLite
    analysis_rec = ProcurementAnalysis(
        id=analysis_id,
        input_type=input_type,
        raw_text=raw_text[:2000],
        requirement_json=structured_req.model_dump(),
        execution_mode=execution_mode,
        score_version="applicability_v1"
    )
    db.add(analysis_rec)

    for rec in recommendations:
        db_rec = Recommendation(
            analysis_id=analysis_id,
            standard_id=rec.standard_id,
            applicability_score=rec.applicability_score,
            rank=rec.rank,
            rec_relationship=rec.relationship,
            status_signal=rec.status,
            score_breakdown_json=rec.score_breakdown,
            reasons_json=[r.model_dump() for r in rec.reasons]
        )
        db.add(db_rec)

    db.commit()

    return AnalysisResponse(
        analysis_id=analysis_id,
        input_type=input_type,
        requirement=structured_req,
        extracted_requirements=extracted_reqs,
        requirement_coverage=req_coverage,
        requirement_links=req_links,
        coverage_summary=cov_summary,
        recommendations=recommendations,
        why_not=why_not,
        related_standards=related_standards,
        version_signals=version_signals,
        regulatory_signals=[],
        processing_time_ms=elapsed_ms,
        score_version="applicability_v1",
        execution_mode=execution_mode
    )

@router.get("/analyses/{analysis_id}/coverage")
async def get_analysis_coverage(analysis_id: str, db: Session = Depends(get_db)):
    """
    Returns standalone requirement coverage mapping for historical analysis.
    """
    analysis_rec = db.query(ProcurementAnalysis).filter(ProcurementAnalysis.id == analysis_id).first()
    if not analysis_rec:
        raise HTTPException(status_code=404, detail="Analysis not found")

    req_dict = analysis_rec.requirement_json if isinstance(analysis_rec.requirement_json, dict) else {}
    structured_req = StructuredRequirement(**req_dict)
    recs = db.query(Recommendation).filter(Recommendation.analysis_id == analysis_id).all()
    rec_items = []
    for r in recs:
        std_record = db.query(Standard).filter(Standard.id == r.standard_id).first()
        rec_items.append(RecommendationItem(
            standard_id=r.standard_id,
            standard_number=std_record.standard_number if std_record else "UNKNOWN",
            title=std_record.title if std_record else "UNKNOWN",
            applicability_score=r.applicability_score,
            rank=r.rank,
            status=r.status_signal or "CURRENT",
            relationship=r.rec_relationship or "PRIMARY",
            reasons=[],
            score_breakdown=r.score_breakdown_json or {},
            evidence=[]
        ))

    extracted_reqs, req_coverage, req_links, cov_summary = requirement_mapper.map_requirements_to_evidence(
        structured_req, rec_items
    )

    return {
        "analysis_id": analysis_id,
        "extracted_requirements": [r.model_dump() for r in extracted_reqs],
        "requirement_coverage": [c.model_dump() for c in req_coverage],
        "requirement_links": [l.model_dump() for l in req_links],
        "coverage_summary": cov_summary
    }
