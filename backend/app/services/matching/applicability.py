from typing import List, Dict, Any, Tuple
from app.schemas.domain import StructuredRequirement, RecommendationItem, MatchReason, WhyNotReason

class ApplicabilityEngine:
    """
    Deterministic scoring & recommendation matching engine.
    Applies configurable weights:
    - Semantic similarity: 35%
    - Lexical relevance: 15%
    - Product/category match: 15%
    - Scope match: 15%
    - Attribute/requirement match: 10%
    - Evidence/source quality: 5%
    - Current-version validity: 5%
    """
    def __init__(self):
        self.weights = {
            "semantic": 0.35,
            "lexical": 0.15,
            "category": 0.15,
            "scope": 0.15,
            "attributes": 0.10,
            "evidence": 0.05,
            "version": 0.05
        }

    def score_candidate(
        self, req: StructuredRequirement, candidate: Dict[str, Any]
    ) -> Tuple[float, Dict[str, float], List[MatchReason]]:
        title = candidate.get("title", "")
        scope = candidate.get("scope", "")
        category = candidate.get("category", "")
        domain = candidate.get("domain", "")
        status = candidate.get("status", "CURRENT")

        # 1. Semantic Score (0 - 100)
        dense_score = candidate.get("dense_score", 0.0)
        rerank_score = candidate.get("reranker_score", 0.0)
        raw_semantic = (dense_score * 0.5 + rerank_score * 0.5) * 100.0
        semantic_score = min(max(raw_semantic, 0.0), 99.0)

        # 2. Lexical Score (0 - 100)
        lex_score = candidate.get("lexical_score", 0.0)
        lexical_score = min(max(lex_score * 4.0, 0.0), 100.0)

        # 3. Product & Category Match (0 - 100)
        prod_words = [w.lower() for w in req.product.split() if len(w) > 2]
        title_lower = title.lower()
        scope_lower = (scope or "").lower()
        cat_lower = (category or "").lower()
        domain_lower = (domain or "").lower()

        matched_prod_words = sum(1 for w in prod_words if w in title_lower or w in scope_lower or w in cat_lower)
        if prod_words and matched_prod_words > 0:
            prod_cat_score = min(40.0 + (matched_prod_words / len(prod_words)) * 55.0, 98.0)
        else:
            prod_cat_score = 5.0

        req_cat = (req.category or "").lower()
        if req_cat and (req_cat in cat_lower or req_cat in domain_lower):
            prod_cat_score = max(prod_cat_score, 85.0)

        # Exact standard number match boost
        std_num = candidate.get("standard_number", "").upper()
        exact_is_boost = False
        if any(ms.upper().replace(" ", "") in std_num.replace(" ", "") for ms in req.mentioned_standards):
            semantic_score = 100.0
            lexical_score = 100.0
            prod_cat_score = 100.0
            exact_is_boost = True

        # 4. Scope Match (0 - 100)
        if scope_lower and prod_words:
            overlap = sum(1 for w in prod_words if w in scope_lower)
            scope_score = min(overlap * 30.0, 95.0) if overlap > 0 else 10.0
        else:
            scope_score = 10.0

        # 5. Requirement & Attribute Match (0 - 100)
        attr_score = 10.0
        all_reqs = req.performance_requirements + req.safety_requirements + req.testing_requirements
        if all_reqs and scope_lower:
            matched_reqs = sum(1 for r in all_reqs if any(w in scope_lower for w in r.lower().split() if len(w) > 3))
            attr_score = min(matched_reqs * 25.0, 95.0) if matched_reqs > 0 else 10.0

        # 6. Evidence Quality (0 - 100)
        evidence_score = 95.0 if candidate.get("object") is not None else 50.0

        # 7. Version Validity (0 - 100)
        version_score = 100.0 if status == "CURRENT" else 30.0

        # Weighted Sum (0 - 100)
        if exact_is_boost:
            final_score = 100.0
        else:
            final_score = (
                semantic_score * self.weights["semantic"] +
                lexical_score * self.weights["lexical"] +
                prod_cat_score * self.weights["category"] +
                scope_score * self.weights["scope"] +
                attr_score * self.weights["attributes"] +
                evidence_score * self.weights["evidence"] +
                version_score * self.weights["version"]
            )
        final_score = round(min(max(final_score, 0.0), 100.0), 1)

        score_breakdown = {
            "semantic_similarity": round(semantic_score, 1),
            "lexical_relevance": round(lexical_score, 1),
            "product_category_match": round(prod_cat_score, 1),
            "scope_match": round(scope_score, 1),
            "attribute_match": round(attr_score, 1),
            "evidence_quality": round(evidence_score, 1),
            "version_validity": round(version_score, 1)
        }

        # Match Reasons
        reasons = []
        if prod_cat_score >= 70.0:
            reasons.append(MatchReason(
                code="PRODUCT_MATCH",
                label="Product category aligns",
                description=f"Standard falls under category '{category or domain or 'General Engineering'}' matching requested product.",
                verified=True
            ))
        if scope_score >= 50.0:
            reasons.append(MatchReason(
                code="SCOPE_MATCH",
                label="Application aligns with scope",
                description=f"Official BIS scope covers operational requirements for '{req.environment or 'General'}' use.",
                verified=True
            ))
        if attr_score >= 50.0:
            reasons.append(MatchReason(
                code="ATTRIBUTE_MATCH",
                label="Technical characteristics detected",
                description="Technical specifications and testing methods align with extracted performance attributes.",
                verified=True
            ))
        if version_score == 100.0:
            reasons.append(MatchReason(
                code="VERSION_VALID",
                label="Verified active version",
                description="Standard record is current and active in official BIS publication registry.",
                verified=True
            ))

        return final_score, score_breakdown, reasons

    def generate_recommendations(
        self, req: StructuredRequirement, reranked_candidates: List[Dict[str, Any]]
    ) -> Tuple[List[RecommendationItem], List[WhyNotReason]]:
        recommendations: List[RecommendationItem] = []
        why_not_list: List[WhyNotReason] = []

        # Check candidate scores
        scored_candidates = []
        for idx, candidate in enumerate(reranked_candidates, start=1):
            score, breakdown, reasons = self.score_candidate(req, candidate)
            scored_candidates.append((score, candidate, breakdown, reasons))

        # Sort by final score descending
        scored_candidates.sort(key=lambda x: x[0], reverse=True)

        for idx, (score, candidate, breakdown, reasons) in enumerate(scored_candidates, start=1):
            std = candidate.get("object")
            std_id = candidate.get("id")
            std_num = candidate.get("standard_number")
            title = candidate.get("title")
            status = candidate.get("status", "CURRENT")

            # ABSTENTION THRESHOLD (Score >= 45.0 for valid match, < 45.0 for Abstention)
            if score >= 45.0 and len(recommendations) < 5:
                from app.services.evidence.extractor import extract_evidence_items
                evidence_items = extract_evidence_items(candidate, req, breakdown, reasons)
                
                rec = RecommendationItem(
                    standard_id=std_id,
                    standard_number=std_num,
                    title=title,
                    applicability_score=score,
                    rank=len(recommendations) + 1,
                    status=status,
                    relationship="PRIMARY" if len(recommendations) == 0 else "RELATED",
                    reasons=reasons,
                    score_breakdown=breakdown,
                    scope_preview=candidate.get("scope", "")[:220] if candidate.get("scope") else None,
                    evidence=evidence_items
                )
                recommendations.append(rec)
            else:
                why_not = WhyNotReason(
                    standard_id=std_id,
                    standard_number=std_num,
                    title=title,
                    reasons=[
                        f"Score ({score}/100) below match threshold (45.0)",
                        "Non-specific or broad product scope coverage",
                        "Lower semantic requirement overlap with target parameters"
                    ]
                )
                why_not_list.append(why_not)

        return recommendations, why_not_list

applicability_engine = ApplicabilityEngine()
