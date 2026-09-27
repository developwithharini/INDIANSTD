from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Provenance item schema
class ExtractedSpan(BaseModel):
    value: str
    source_span: Optional[str] = None
    confidence: float = 1.0

# Structured Requirement Schema (Pydantic schema for Gemini + Local fallback)
class StructuredRequirement(BaseModel):
    product: str = Field(description="Core product being procured, e.g. LED streetlight luminaire")
    category: Optional[str] = Field(default=None, description="General product category, e.g. Lighting")
    application: Optional[str] = Field(default=None, description="Intended application, e.g. Municipal road lighting")
    environment: Optional[str] = Field(default=None, description="Operational environment, e.g. Outdoor")
    materials: List[str] = Field(default_factory=list)
    dimensions: List[str] = Field(default_factory=list)
    performance_requirements: List[str] = Field(default_factory=list)
    safety_requirements: List[str] = Field(default_factory=list)
    testing_requirements: List[str] = Field(default_factory=list)
    installation_requirements: List[str] = Field(default_factory=list)
    mentioned_standards: List[str] = Field(default_factory=list, description="Explicit standard numbers found in input, e.g. IS 10322")
    regulatory_clues: List[str] = Field(default_factory=list)
    language: str = Field(default="en")

# Analysis Request
class AnalysisRequest(BaseModel):
    text: Optional[str] = None
    title: Optional[str] = None
    input_type: str = Field(default="DESCRIBE", description="DESCRIBE, PDF, DOCX, TXT")

# Standard Detail Response
class StandardResponse(BaseModel):
    id: str
    standard_number: str
    title: str
    scope: Optional[str] = None
    category: Optional[str] = None
    domain: Optional[str] = None
    publication_year: Optional[int] = None
    status: str
    source_url: Optional[str] = None
    source_file: Optional[str] = None
    source_sheet: Optional[str] = None
    source_row: Optional[int] = None
    verified: bool = True

    class Config:
        from_attributes = True

# Score Reasons & Why Not
class MatchReason(BaseModel):
    code: str
    label: str
    description: str
    verified: bool = True

class WhyNotReason(BaseModel):
    standard_id: str
    standard_number: str
    title: str
    reasons: List[str]

# Evidence Item Schema for Procurement Verification
class EvidenceItem(BaseModel):
    evidence_id: str = Field(description="Unique identifier for evidence item")
    standard_id: str = Field(description="Standard identifier")
    reason_code: str = Field(description="Deterministic reason code e.g. SCOPE_MATCH, PRODUCT_MATCH")
    source_type: str = Field(default="BIS_DATASET", description="Source document or dataset type")
    source_file: str = Field(default="standards.xlsx", description="Filename of supporting evidence")
    source_sheet: Optional[str] = Field(default="Standards", description="Sheet name if XLSX dataset")
    source_row: Optional[int] = Field(default=None, description="Row number in source dataset")
    source_field: str = Field(default="scope", description="Field name containing text excerpt")
    source_page: Optional[int] = Field(default=None, description="Page number if source document")
    excerpt: str = Field(description="Actual stored text snippet from standard record")
    matched_terms: List[str] = Field(default_factory=list, description="Terms matched in requirement")
    requirement_signal: Optional[str] = Field(default=None, description="Procurement requirement term or concept matched")
    evidence_strength: str = Field(default="STRONG", description="STRONG, MODERATE, LIMITED, UNAVAILABLE")
    explanation: Optional[str] = Field(default=None, description="Human readable matching explanation")

# Individual Requirement Item with Stable ID
class RequirementItem(BaseModel):
    id: str = Field(description="Stable identifier e.g. req_01")
    type: str = Field(description="product, application, environment, safety, performance, testing, material, dimension, standard")
    value: str = Field(description="Textual requirement value e.g. shock absorption")
    source_span: Optional[str] = Field(default=None, description="Exact phrase in input text")
    confidence: float = Field(default=1.0)
    inferred: bool = Field(default=False, description="True if inferred rather than explicitly stated")
    category_label: Optional[str] = Field(default=None, description="Human readable label e.g. Safety Requirement")

# Traceable Link between Requirement, Supporting Standard, and Evidence
class RequirementEvidenceLink(BaseModel):
    id: str = Field(description="Unique link identifier e.g. link_01")
    requirement_id: str = Field(description="Target requirement ID")
    standard_id: str = Field(description="Supporting standard ID")
    evidence_id: str = Field(description="Supporting EvidenceItem ID from Priority 1")
    relationship_type: str = Field(default="SUPPORTS", description="SUPPORTS, PARTIALLY_SUPPORTS, NO_SUPPORT")
    support_strength: str = Field(default="STRONG", description="STRONG, MODERATE, LIMITED, UNAVAILABLE")
    explanation: Optional[str] = Field(default=None, description="Concise evidence-backed explanation")

# Requirement Coverage Summary Item
class RequirementCoverageItem(BaseModel):
    requirement: RequirementItem
    status: str = Field(default="SUPPORTED", description="SUPPORTED, PARTIALLY_SUPPORTED, NO_EVIDENCE")
    supporting_standards: List[Dict[str, Any]] = Field(default_factory=list)
    primary_evidence_id: Optional[str] = None

# Recommendation Item Schema
class RecommendationItem(BaseModel):
    standard_id: str
    standard_number: str
    title: str
    applicability_score: float
    rank: int
    status: str
    relationship: str = "PRIMARY"
    reasons: List[MatchReason]
    score_breakdown: Dict[str, float]
    scope_preview: Optional[str] = None
    evidence: List[EvidenceItem] = Field(default_factory=list)
    supported_requirement_ids: List[str] = Field(default_factory=list, description="List of requirement IDs supported by this standard")

# Full Analysis Response
class AnalysisResponse(BaseModel):
    analysis_id: str
    input_type: str
    requirement: StructuredRequirement
    extracted_requirements: List[RequirementItem] = Field(default_factory=list, description="Discrete requirements with stable IDs")
    requirement_coverage: List[RequirementCoverageItem] = Field(default_factory=list, description="Per-requirement coverage breakdown")
    requirement_links: List[RequirementEvidenceLink] = Field(default_factory=list, description="Explicit requirement -> evidence links")
    coverage_summary: Dict[str, Any] = Field(default_factory=dict, description="Summary stats (total, supported, partial, unsupported)")
    recommendations: List[RecommendationItem]
    why_not: List[WhyNotReason] = Field(default_factory=list)
    related_standards: List[Dict[str, Any]] = Field(default_factory=list)
    version_signals: List[Dict[str, Any]] = Field(default_factory=list)
    regulatory_signals: List[Dict[str, Any]] = Field(default_factory=list)
    processing_time_ms: float
    score_version: str = "applicability_v1"
    execution_mode: str = "LOCAL_FALLBACK"

# Ingestion Report Schema
class IngestionReport(BaseModel):
    ingestion_run_id: str
    source_file: str
    sheets_discovered: int
    sheets_used: int
    records_count: int
    valid_count: int
    inserted_count: int
    updated_count: int
    skipped_count: int
    failed_count: int
    dataset_version: str
    created_at: str
