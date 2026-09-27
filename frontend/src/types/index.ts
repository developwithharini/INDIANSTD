export interface ExtractedRequirement {
  product: string;
  category?: string;
  application?: string;
  environment?: string;
  materials: string[];
  dimensions: string[];
  performance_requirements: string[];
  safety_requirements: string[];
  testing_requirements: string[];
  installation_requirements: string[];
  mentioned_standards: string[];
  regulatory_clues: string[];
  language: string;
}

export interface MatchReason {
  code: string;
  label: string;
  description: string;
  verified: boolean;
}

export interface WhyNotReason {
  standard_id: string;
  standard_number: string;
  title: string;
  reasons: string[];
}

export interface EvidenceItem {
  evidence_id: string;
  standard_id: string;
  reason_code: string;
  source_type: string;
  source_file: string;
  source_sheet?: string;
  source_row?: number;
  source_field: string;
  source_page?: number;
  excerpt: string;
  matched_terms: string[];
  requirement_signal?: string;
  evidence_strength: 'STRONG' | 'MODERATE' | 'LIMITED' | 'UNAVAILABLE';
  explanation?: string;
}

export interface RequirementItem {
  id: string;
  type: string;
  value: string;
  source_span?: string;
  confidence: number;
  inferred: boolean;
  category_label?: string;
}

export interface RequirementEvidenceLink {
  id: string;
  requirement_id: string;
  standard_id: string;
  evidence_id: string;
  relationship_type: 'SUPPORTS' | 'PARTIALLY_SUPPORTS' | 'NO_SUPPORT';
  support_strength: 'STRONG' | 'MODERATE' | 'LIMITED' | 'UNAVAILABLE';
  explanation?: string;
}

export interface RequirementCoverageItem {
  requirement: RequirementItem;
  status: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'NO_EVIDENCE';
  supporting_standards: Array<{
    standard_id: string;
    standard_number: string;
    title: string;
    support_strength: 'STRONG' | 'MODERATE' | 'LIMITED';
    evidence_ids: string[];
  }>;
  primary_evidence_id?: string;
}

export interface ScoreCalibration {
  tier: 'STRONG' | 'REVIEW_REQUIRED' | 'ABSTAIN';
  confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'NONE';
  score_range: string;
  interpretation: string;
}

export interface ClosestCandidate {
  standard_id: string;
  standard_number: string;
  title: string;
  applicability_score: number;
  status: string;
  scope_preview?: string;
  reasons: MatchReason[];
}

export interface RecommendationItem {
  standard_id: string;
  standard_number: string;
  title: string;
  applicability_score: number;
  rank: number;
  status: string;
  relationship: string;
  match_tier?: 'STRONG' | 'REVIEW_REQUIRED' | 'ABSTAIN';
  reasons: MatchReason[];
  score_breakdown: Record<string, number>;
  scope_preview?: string;
  evidence: EvidenceItem[];
  supported_requirement_ids?: string[];
}

export interface AnalysisResponse {
  analysis_id: string;
  input_type: string;
  requirement: ExtractedRequirement;
  extracted_requirements?: RequirementItem[];
  requirement_coverage?: RequirementCoverageItem[];
  coverage_items?: RequirementCoverageItem[];
  requirement_links?: RequirementEvidenceLink[];
  coverage_summary?: {
    total_requirements: number;
    supported_count: number;
    partially_supported_count: number;
    unsupported_count: number;
    coverage_percentage: number;
  };
  recommendations: RecommendationItem[];
  why_not: WhyNotReason[];
  decision_state?: 'STRONGLY_SUPPORTED' | 'POSSIBLE_MATCH_REVIEW_REQUIRED' | 'NO_SUFFICIENT_MATCH';
  is_abstained?: boolean;
  abstention_reason?: string;
  closest_candidate?: ClosestCandidate;
  score_calibration?: ScoreCalibration;
  related_standards: Array<{
    relationship_type: string;
    target_standard_id: string;
    target_standard_number: string;
    target_title: string;
    evidence_text?: string;
    verified: boolean;
  }>;
  version_signals: Array<{
    standard_id: string;
    referenced_standard: string;
    status: string;
    severity: string;
    message: string;
    current_recommendation?: string;
  }>;
  regulatory_signals: any[];
  processing_time_ms: number;
  score_version: string;
  execution_mode: string;
}

export interface StandardDetail {
  id: string;
  standard_number: string;
  title: string;
  scope?: string;
  category?: string;
  domain?: string;
  publication_year?: number;
  status: string;
  source_url?: string;
  source_file?: string;
  source_sheet?: string;
  source_row?: number;
  verified: boolean;
}

// Priority 4 Diagnostic Trace Interfaces
export interface ExtractionTrace {
  original_query: string;
  normalized_query: string;
  language: string;
  product: string;
  category?: string;
  domain?: string;
  application?: string;
  environment?: string;
  materials: string[];
  attributes: string[];
  safety_requirements: string[];
  testing_requirements: string[];
  mentioned_standards: string[];
  inferred_flags: Record<string, boolean>;
}

export interface BM25CandidateTrace {
  standard_id: string;
  standard_number: string;
  title: string;
  rank: number;
  score: number;
  matched_fields: string[];
  exact_standard_match: boolean;
}

export interface BM25Trace {
  candidate_count: number;
  results: BM25CandidateTrace[];
}

export interface DenseCandidateTrace {
  standard_id: string;
  standard_number: string;
  title: string;
  rank: number;
  similarity: number;
}

export interface DenseTrace {
  model: string;
  embedding_mode: string;
  candidate_count: number;
  results: DenseCandidateTrace[];
}

export interface FusionCandidateTrace {
  standard_id: string;
  standard_number: string;
  title: string;
  bm25_rank?: number;
  dense_rank?: number;
  fusion_rank: number;
  retrieved_by: string[];
}

export interface FusionTrace {
  method: string;
  union_count: number;
  candidate_count: number;
  results: FusionCandidateTrace[];
}

export interface RerankerCandidateTrace {
  standard_id: string;
  standard_number: string;
  title: string;
  pre_rerank_rank: number;
  reranker_rank: number;
  reranker_score: number;
  rank_change: number;
}

export interface RerankerTrace {
  model: string;
  mode: string;
  fine_tuned: boolean;
  candidate_count: number;
  results: RerankerCandidateTrace[];
}

export interface ApplicabilityCandidateTrace {
  standard_id: string;
  standard_number: string;
  title: string;
  semantic_similarity: number;
  lexical_relevance: number;
  product_match: number;
  application_match: number;
  domain_match: number;
  scope_match: number;
  attribute_match: number;
  evidence_quality: number;
  version_validity: number;
  raw_score: number;
  calibrated_score: number;
  match_tier: string;
}

export interface ApplicabilityTrace {
  score_version: string;
  results: ApplicabilityCandidateTrace[];
}

export interface DecisionTrace {
  decision_state: string;
  match_level: string;
  is_abstained: boolean;
  abstention_reason?: string;
  top_score: number;
  second_best_score: number;
  score_margin: number;
  exact_standard_match: boolean;
  primary_suspected_failure_stage: string;
  diagnostic_flags: string[];
}

export interface TimingTrace {
  extraction_ms: number;
  bm25_ms: number;
  dense_ms: number;
  fusion_ms: number;
  reranker_ms: number;
  applicability_ms: number;
  decision_ms: number;
  total_ms: number;
}

export interface DiagnosticTrace {
  analysis_id: string;
  query: string;
  normalized_query: string;
  dataset_version: string;
  execution_mode: string;
  debug_enabled: boolean;
  timestamp: string;
  requirement_extraction: ExtractionTrace;
  bm25: BM25Trace;
  dense: DenseTrace;
  fusion: FusionTrace;
  reranker: RerankerTrace;
  applicability: ApplicabilityTrace;
  decision: DecisionTrace;
  timing: TimingTrace;
}
