export interface RequirementModel {
  product: string;
  category: string;
  domain?: string;
  application: string;
  environment: string;
  industry?: string;
  attributes: string[];
  performance_requirements: string[];
  safety_requirements: string[];
  testing_requirements: string[];
  installation_requirements: string[];
  materials: string[];
  quantities: string[];
  mentioned_standards: string[];
  regulatory_clues: string[];
  language: string;
}

export interface ScoreBreakdown {
  semantic_similarity: number;
  product_category_match: number;
  scope_match: number;
  attribute_match: number;
  graph_support: number;
  regulatory_relevance: number;
  version_validity: number;
  evidence_completeness: number;
}

export interface Recommendation {
  id: string;
  standard_id: string;
  standard_number: string;
  title: string;
  domain: string;
  applicability_score: number;
  relationship_type: string;
  reasons: string[];
  rejection_reasons?: string[];
  score_breakdown: ScoreBreakdown;
  regulatory_status: string;
  status: string;
  publication_year: number;
  source_url?: string;
}

export interface TenderFinding {
  id: string;
  category: string;
  severity: 'BLOCKING' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  title: string;
  description: string;
  evidence_text?: string;
  suggested_fix?: string;
  related_standard_id?: string;
  status: 'OPEN' | 'ACCEPTED' | 'DISMISSED';
}

export interface SpecificationReadiness {
  overall_score: number;
  standard_coverage: number;
  version_currency: number;
  normative_coverage: number;
  testing_coverage: number;
  safety_coverage: number;
  certification_coverage: number;
  requirement_completeness: number;
}

export interface ProcurementAnalysisResponse {
  request_id: string;
  title: string;
  raw_input_text: string;
  language: string;
  requirement_model: RequirementModel;
  readiness: SpecificationReadiness;
  recommendations: Recommendation[];
  findings: TenderFinding[];
  created_at: string;
  execution_mode: string;
}

export interface Standard {
  id: string;
  standard_number: string;
  title: string;
  domain: string;
  category: string;
  scope_summary: string;
  status: string;
  publication_year: number;
  revision_date?: string;
  source_url?: string;
  verified: boolean;
  source_type: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  domain?: string;
  status?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  evidence?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface QCO {
  id: string;
  title: string;
  ministry: string;
  order_number: string;
  effective_date: string;
  mandatory_certification_type: string;
  target_standard_ids?: string[];
  source_url: string;
  verified: boolean;
}


export interface WatchlistItem {
  id: string;
  standard_id: string;
  standard_number: string;
  title: string;
  domain: string;
  status: string;
  last_verified: string;
}
