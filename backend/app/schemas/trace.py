from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ExtractionTrace(BaseModel):
    original_query: str
    normalized_query: str
    language: str = "English"
    product: str
    category: Optional[str] = None
    domain: Optional[str] = None
    application: Optional[str] = None
    environment: Optional[str] = None
    materials: List[str] = Field(default_factory=list)
    attributes: List[str] = Field(default_factory=list)
    safety_requirements: List[str] = Field(default_factory=list)
    testing_requirements: List[str] = Field(default_factory=list)
    mentioned_standards: List[str] = Field(default_factory=list)
    inferred_flags: Dict[str, bool] = Field(default_factory=dict)

class BM25CandidateTrace(BaseModel):
    standard_id: str
    standard_number: str
    title: str
    rank: int
    score: float
    matched_fields: List[str] = Field(default_factory=list)
    exact_standard_match: bool = False

class BM25Trace(BaseModel):
    candidate_count: int
    results: List[BM25CandidateTrace] = Field(default_factory=list)

class DenseCandidateTrace(BaseModel):
    standard_id: str
    standard_number: str
    title: str
    rank: int
    similarity: float

class DenseTrace(BaseModel):
    model: str = "BAAI/bge-m3"
    embedding_mode: str = "LOCAL"
    candidate_count: int
    results: List[DenseCandidateTrace] = Field(default_factory=list)

class FusionCandidateTrace(BaseModel):
    standard_id: str
    standard_number: str
    title: str
    bm25_rank: Optional[int] = None
    dense_rank: Optional[int] = None
    fusion_rank: int
    retrieved_by: List[str] = Field(default_factory=list)

class FusionTrace(BaseModel):
    method: str = "Reciprocal Rank Fusion (RRF)"
    union_count: int
    candidate_count: int
    results: List[FusionCandidateTrace] = Field(default_factory=list)

class RerankerCandidateTrace(BaseModel):
    standard_id: str
    standard_number: str
    title: str
    pre_rerank_rank: int
    reranker_rank: int
    reranker_score: float
    rank_change: int = Field(description="positive if promoted, negative if demoted")

class RerankerTrace(BaseModel):
    model: str = "BAAI/bge-reranker-v2-m3"
    mode: str = "BASE"
    fine_tuned: bool = False
    candidate_count: int
    results: List[RerankerCandidateTrace] = Field(default_factory=list)

class ApplicabilityCandidateTrace(BaseModel):
    standard_id: str
    standard_number: str
    title: str
    semantic_similarity: float
    lexical_relevance: float
    product_match: float
    application_match: float
    domain_match: float
    scope_match: float
    attribute_match: float
    evidence_quality: float
    version_validity: float
    raw_score: float
    calibrated_score: float
    match_tier: str

class ApplicabilityTrace(BaseModel):
    score_version: str = "applicability_v1"
    results: List[ApplicabilityCandidateTrace] = Field(default_factory=list)

class DecisionTrace(BaseModel):
    decision_state: str
    match_level: str
    is_abstained: bool
    abstention_reason: Optional[str] = None
    top_score: float
    second_best_score: float
    score_margin: float
    exact_standard_match: bool = False
    primary_suspected_failure_stage: str = "NO_FAILURE_OBSERVED"
    diagnostic_flags: List[str] = Field(default_factory=list)

class TimingTrace(BaseModel):
    extraction_ms: float
    bm25_ms: float
    dense_ms: float
    fusion_ms: float
    reranker_ms: float
    applicability_ms: float
    decision_ms: float
    total_ms: float

class DiagnosticTrace(BaseModel):
    analysis_id: str
    query: str
    normalized_query: str
    dataset_version: str = "2026-09-27-PGD"
    execution_mode: str = "LOCAL_FALLBACK"
    debug_enabled: bool = True
    timestamp: str
    requirement_extraction: ExtractionTrace
    bm25: BM25Trace
    dense: DenseTrace
    fusion: FusionTrace
    reranker: RerankerTrace
    applicability: ApplicabilityTrace
    decision: DecisionTrace
    timing: TimingTrace
