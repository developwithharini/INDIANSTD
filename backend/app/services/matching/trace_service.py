import os
import json
import time
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
from app.core.config import settings
from app.schemas.domain import StructuredRequirement, RecommendationItem, ScoreCalibration, MatchReason
from app.schemas.trace import (
    DiagnosticTrace,
    ExtractionTrace,
    BM25CandidateTrace,
    BM25Trace,
    DenseCandidateTrace,
    DenseTrace,
    FusionCandidateTrace,
    FusionTrace,
    RerankerCandidateTrace,
    RerankerTrace,
    ApplicabilityCandidateTrace,
    ApplicabilityTrace,
    DecisionTrace,
    TimingTrace
)

class TraceCollectorService:
    """
    In-flight Diagnostic Trace Collector Service.
    Instruments retrieval pipeline without changing ranking, scoring, or execution behavior.
    """

    def __init__(self):
        self.trace_dir = os.path.join(settings.DATA_DIR, "traces")
        os.makedirs(self.trace_dir, exist_ok=True)

    def assemble_trace(
        self,
        analysis_id: str,
        raw_query: str,
        req: StructuredRequirement,
        bm25_candidates: List[Dict[str, Any]],
        dense_candidates: List[Dict[str, Any]],
        fusion_candidates: List[Dict[str, Any]],
        reranked_candidates: List[Dict[str, Any]],
        recommendations: List[RecommendationItem],
        scored_candidates: List[Tuple[float, Dict[str, Any], Dict[str, float], List[MatchReason]]],
        decision_state: str,
        is_abstained: bool,
        abstention_reason: Optional[str],
        score_calibration: ScoreCalibration,
        execution_mode: str,
        timings: Dict[str, float]
    ) -> DiagnosticTrace:
        """
        Assembles typed DiagnosticTrace object, computes diagnostic flags and failure stage,
        and saves trace to local disk if debug mode is active.
        """
        # 1. Extraction Trace
        extraction_trace = ExtractionTrace(
            original_query=raw_query,
            normalized_query=req.product,
            product=req.product,
            category=req.category,
            domain=getattr(req, "domain", None) or req.category,
            application=req.application,
            environment=req.environment,
            materials=getattr(req, "materials", []),
            attributes=getattr(req, "performance_requirements", []),
            safety_requirements=getattr(req, "safety_requirements", []),
            testing_requirements=getattr(req, "testing_requirements", []),
            mentioned_standards=getattr(req, "mentioned_standards", []),
            inferred_flags={"inferred_domain": bool(getattr(req, "domain", None)), "inferred_category": bool(req.category)}
        )

        # 2. BM25 Trace
        bm25_items = []
        for rank, cand in enumerate(bm25_candidates, start=1):
            std_num = cand.get("standard_number", "")
            is_exact = any(ms.upper().replace(" ", "") in std_num.upper().replace(" ", "") for ms in req.mentioned_standards)
            bm25_items.append(BM25CandidateTrace(
                standard_id=cand.get("id", ""),
                standard_number=std_num,
                title=cand.get("title", ""),
                rank=rank,
                score=round(cand.get("lexical_score", 0.0), 4),
                matched_fields=["title", "scope"] if cand.get("lexical_score", 0) > 0.3 else ["scope"],
                exact_standard_match=is_exact
            ))
        bm25_trace = BM25Trace(candidate_count=len(bm25_items), results=bm25_items)

        # 3. Dense Trace
        dense_items = []
        for rank, cand in enumerate(dense_candidates, start=1):
            dense_items.append(DenseCandidateTrace(
                standard_id=cand.get("id", ""),
                standard_number=cand.get("standard_number", ""),
                title=cand.get("title", ""),
                rank=rank,
                similarity=round(cand.get("dense_score", 0.0), 4)
            ))
        dense_trace = DenseTrace(
            model=settings.EMBEDDING_MODEL,
            embedding_mode="LOCAL",
            candidate_count=len(dense_items),
            results=dense_items
        )

        # 4. Fusion Trace
        fusion_items = []
        bm25_ranks = {c.get("id"): idx + 1 for idx, c in enumerate(bm25_candidates)}
        dense_ranks = {c.get("id"): idx + 1 for idx, c in enumerate(dense_candidates)}
        for rank, cand in enumerate(fusion_candidates, start=1):
            cid = cand.get("id")
            b_rank = bm25_ranks.get(cid)
            d_rank = dense_ranks.get(cid)
            sources = []
            if b_rank: sources.append("bm25")
            if d_rank: sources.append("dense")
            fusion_items.append(FusionCandidateTrace(
                standard_id=cid,
                standard_number=cand.get("standard_number", ""),
                title=cand.get("title", ""),
                bm25_rank=b_rank,
                dense_rank=d_rank,
                fusion_rank=rank,
                retrieved_by=sources
            ))
        fusion_trace = FusionTrace(
            method="Reciprocal Rank Fusion (RRF)",
            union_count=len(set(list(bm25_ranks.keys()) + list(dense_ranks.keys()))),
            candidate_count=len(fusion_items),
            results=fusion_items
        )

        # 5. Reranker Trace
        reranker_items = []
        fusion_ranks = {c.get("id"): idx + 1 for idx, c in enumerate(fusion_candidates)}
        for rank, cand in enumerate(reranked_candidates, start=1):
            cid = cand.get("id")
            pre_rank = fusion_ranks.get(cid, rank)
            delta = pre_rank - rank
            reranker_items.append(RerankerCandidateTrace(
                standard_id=cid,
                standard_number=cand.get("standard_number", ""),
                title=cand.get("title", ""),
                pre_rerank_rank=pre_rank,
                reranker_rank=rank,
                reranker_score=round(cand.get("reranker_score", 0.0), 4),
                rank_change=delta
            ))
        reranker_trace = RerankerTrace(
            model=settings.RERANKER_MODEL,
            mode="BASE",
            fine_tuned=False,
            candidate_count=len(reranker_items),
            results=reranker_items
        )

        # 6. Applicability Trace
        app_items = []
        for score, cand, breakdown, reasons in scored_candidates[:10]:
            tier = "STRONG" if score >= 75.0 else ("REVIEW_REQUIRED" if score >= 45.0 else "ABSTAIN")
            app_items.append(ApplicabilityCandidateTrace(
                standard_id=cand.get("id", ""),
                standard_number=cand.get("standard_number", ""),
                title=cand.get("title", ""),
                semantic_similarity=round(breakdown.get("semantic_similarity", 0.0), 2),
                lexical_relevance=round(breakdown.get("lexical_relevance", 0.0), 2),
                product_match=round(breakdown.get("product_category_match", 0.0), 2),
                application_match=round(breakdown.get("application_scope_match", 0.0), 2),
                domain_match=round(breakdown.get("domain_alignment", 0.0), 2),
                scope_match=round(breakdown.get("application_scope_match", 0.0), 2),
                attribute_match=round(breakdown.get("technical_attribute_match", 0.0), 2),
                evidence_quality=round(breakdown.get("evidence_quality", 0.0), 2),
                version_validity=round(breakdown.get("version_validity", 0.0), 2),
                raw_score=round(score, 2),
                calibrated_score=round(score, 2),
                match_tier=tier
            ))
        applicability_trace = ApplicabilityTrace(score_version="applicability_v1", results=app_items)

        # 7. Decision Trace & Diagnostic Heuristics
        sorted_scored = sorted(scored_candidates, key=lambda x: x[0], reverse=True)
        top_score = sorted_scored[0][0] if sorted_scored else 0.0
        second_score = sorted_scored[1][0] if len(sorted_scored) > 1 else 0.0
        margin = round(top_score - second_score, 2)

        diagnostic_flags = []
        primary_suspected_failure = "NO_FAILURE_OBSERVED"

        # Large rerank jump heuristic
        if reranker_items and reranker_items[0].rank_change >= 10:
            diagnostic_flags.append("LARGE_RERANK_JUMP")

        # Generic keyword match heuristic
        if top_score < 45.0:
            primary_suspected_failure = "NO_CORPUS_MATCH"
            diagnostic_flags.append("NO_CORPUS_DIRECT_MATCH")
        elif top_score < 75.0 and margin < 5.0:
            diagnostic_flags.append("SMALL_SCORE_MARGIN")

        has_exact = any(ms.upper().replace(" ", "") in req.product.upper().replace(" ", "") for ms in req.mentioned_standards)

        decision_trace = DecisionTrace(
            decision_state=decision_state,
            match_level=decision_state,
            is_abstained=is_abstained,
            abstention_reason=abstention_reason,
            top_score=round(top_score, 2),
            second_best_score=round(second_score, 2),
            score_margin=margin,
            exact_standard_match=has_exact,
            primary_suspected_failure_stage=primary_suspected_failure,
            diagnostic_flags=diagnostic_flags
        )

        # 8. Timing Trace
        timing_trace = TimingTrace(
            extraction_ms=timings.get("extraction_ms", 0.0),
            bm25_ms=timings.get("bm25_ms", 0.0),
            dense_ms=timings.get("dense_ms", 0.0),
            fusion_ms=timings.get("fusion_ms", 0.0),
            reranker_ms=timings.get("reranker_ms", 0.0),
            applicability_ms=timings.get("applicability_ms", 0.0),
            decision_ms=timings.get("decision_ms", 0.0),
            total_ms=timings.get("total_ms", 0.0)
        )

        trace_obj = DiagnosticTrace(
            analysis_id=analysis_id,
            query=raw_query,
            normalized_query=req.product,
            dataset_version=settings.DATASET_VERSION,
            execution_mode=execution_mode,
            debug_enabled=True,
            timestamp=datetime.now().isoformat(),
            requirement_extraction=extraction_trace,
            bm25=bm25_trace,
            dense=dense_trace,
            fusion=fusion_trace,
            reranker=reranker_trace,
            applicability=applicability_trace,
            decision=decision_trace,
            timing=timing_trace
        )

        # Save trace JSON to disk for development inspection
        trace_file = os.path.join(self.trace_dir, f"{analysis_id}.json")
        try:
            with open(trace_file, "w", encoding="utf-8") as f:
                f.write(trace_obj.model_dump_json(indent=2))
        except Exception:
            pass

        return trace_obj

    def get_trace_by_id(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves saved trace JSON by analysis_id.
        """
        trace_file = os.path.join(self.trace_dir, f"{analysis_id}.json")
        if os.path.exists(trace_file):
            with open(trace_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

trace_collector = TraceCollectorService()
