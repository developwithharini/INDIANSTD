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

export interface RecommendationItem {
  standard_id: string;
  standard_number: string;
  title: string;
  applicability_score: number;
  rank: number;
  status: string;
  relationship: string;
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
