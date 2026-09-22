from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RequirementModel(BaseModel):
    product: str
    category: str
    domain: str = "general"
    application: str
    environment: str = "Standard/Unspecified"
    industry: Optional[str] = None

    intended_use: Optional[str] = None
    attributes: List[str] = []
    performance_requirements: List[str] = []
    safety_requirements: List[str] = []
    testing_requirements: List[str] = []
    installation_requirements: List[str] = []
    materials: List[str] = []
    quantities: List[str] = []
    mentioned_standards: List[str] = []
    regulatory_clues: List[str] = []
    language: str = "en"
    source_spans: Optional[Dict[str, Any]] = None

class ProcurementAnalyzeRequest(BaseModel):
    title: Optional[str] = "Procurement Analysis"
    requirement_text: str
    language: Optional[str] = "en"
    project_id: Optional[str] = None

class StandardSchema(BaseModel):
    id: str
    standard_number: str
    title: str
    domain: str
    category: str
    scope_summary: str
    status: str
    publication_year: int
    revision_date: Optional[str] = None
    source_url: Optional[str] = None
    verified: bool = True
    source_type: str = "PUBLIC"

class ScoreBreakdown(BaseModel):
    semantic_similarity: float
    product_category_match: float
    scope_match: float
    attribute_match: float
    graph_support: float
    regulatory_relevance: float
    version_validity: float
    evidence_completeness: float

class RecommendationResponse(BaseModel):
    id: str
    standard_id: str
    standard_number: str
    title: str
    domain: str
    applicability_score: float
    relationship_type: str
    reasons: List[str]
    rejection_reasons: Optional[List[str]] = []
    score_breakdown: ScoreBreakdown
    regulatory_status: str
    status: str
    publication_year: int
    source_url: Optional[str] = None

class TenderFindingResponse(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    description: str
    evidence_text: Optional[str] = None
    suggested_fix: Optional[str] = None
    related_standard_id: Optional[str] = None
    status: str

class SpecificationReadinessScore(BaseModel):
    overall_score: float
    standard_coverage: float
    version_currency: float
    normative_coverage: float
    testing_coverage: float
    safety_coverage: float
    certification_coverage: float
    requirement_completeness: float

class ProcurementAnalysisResponse(BaseModel):
    request_id: str
    title: str
    raw_input_text: str
    language: str
    requirement_model: RequirementModel
    readiness: SpecificationReadinessScore
    recommendations: List[RecommendationResponse]
    findings: List[TenderFindingResponse]
    created_at: datetime
    execution_mode: str = "AI_ASSISTED" # AI_ASSISTED or DETERMINISTIC_FALLBACK

class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    domain: Optional[str] = None
    status: Optional[str] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    evidence: Optional[str] = None

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class CompareVersionsResponse(BaseModel):
    standard_id: str
    standard_number: str
    current_version: str
    previous_version: str
    status_change: str
    scope_differences: List[str]
    amendments_count: int
    summary: str
