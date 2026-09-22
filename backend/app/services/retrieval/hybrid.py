from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.domain import Standard, QCO, StandardRelationship
from app.schemas.domain import RequirementModel, RecommendationResponse, ScoreBreakdown

def compute_applicability_score(
    std: Standard,
    req: RequirementModel,
    qco_standard_ids: set,
    graph_connected_ids: set
) -> Tuple[float, ScoreBreakdown, List[str], List[str]]:
    """Calculates weighted applicability score (0-100) with detailed metric breakdown and reasons."""
    reasons = []
    rejection_reasons = []

    # 1. Product/Category Match (20%)
    category_match = 0.0
    if req.category.lower() in std.category.lower() or std.category.lower() in req.category.lower():
        category_match = 100.0
        reasons.append(f"Direct match on product category '{std.category}'")
    elif req.domain.lower() == std.domain.lower():
        category_match = 65.0
        reasons.append(f"Domain match on '{std.domain}'")
    else:
        rejection_reasons.append(f"Domain mismatch: requested '{req.domain}', standard belongs to '{std.domain}'")

    # 2. Scope Match (15%)
    scope_match = 0.0
    req_terms = set(req.product.lower().split() + req.category.lower().split())
    scope_words = set(std.scope_summary.lower().split())
    overlap = len(req_terms.intersection(scope_words))
    if overlap > 0:
        scope_match = min(100.0, overlap * 30.0 + 40.0)
        reasons.append(f"Scope alignment with requirement keywords ({overlap} terms matched)")
    else:
        scope_match = 20.0

    # 3. Attribute Match (10%)
    attribute_match = 50.0
    if req.attributes:
        matched_attrs = [a for a in req.attributes if any(w in std.title.lower() or w in std.scope_summary.lower() for w in a.lower().split()[:2])]
        if matched_attrs:
            attribute_match = 100.0
            reasons.append(f"Technical attribute alignment ({', '.join(matched_attrs)})")
        else:
            attribute_match = 30.0

    # 4. Semantic Similarity (30%)
    semantic_similarity = (category_match * 0.5 + scope_match * 0.5)

    # 5. Graph Support (10%)
    graph_support = 0.0
    if std.id in graph_connected_ids:
        graph_support = 100.0
        reasons.append("Supported by normative/test-method relationship graph links")
    else:
        graph_support = 20.0

    # 6. Regulatory Relevance (5%)
    regulatory_relevance = 0.0
    if std.id in qco_standard_ids:
        regulatory_relevance = 100.0
        reasons.append("Covered under mandatory Quality Control Order (QCO)")
    else:
        regulatory_relevance = 10.0

    # 7. Version Validity (5%)
    version_validity = 100.0 if std.status == "CURRENT" else 0.0
    if std.status != "CURRENT":
        rejection_reasons.append(f"Standard status is {std.status} (publication year {std.publication_year})")
    else:
        reasons.append(f"Current verified edition ({std.publication_year})")

    # 8. Evidence Completeness (5%)
    evidence_completeness = 100.0 if std.source_url and std.verified else 50.0

    total_score = (
        semantic_similarity * 0.30 +
        category_match * 0.20 +
        scope_match * 0.15 +
        attribute_match * 0.10 +
        graph_support * 0.10 +
        regulatory_relevance * 0.05 +
        version_validity * 0.05 +
        evidence_completeness * 0.05
    )

    breakdown = ScoreBreakdown(
        semantic_similarity=round(semantic_similarity, 1),
        product_category_match=round(category_match, 1),
        scope_match=round(scope_match, 1),
        attribute_match=round(attribute_match, 1),
        graph_support=round(graph_support, 1),
        regulatory_relevance=round(regulatory_relevance, 1),
        version_validity=round(version_validity, 1),
        evidence_completeness=round(evidence_completeness, 1)
    )

    return round(total_score, 1), breakdown, reasons, rejection_reasons

def retrieve_and_rank_standards(
    db: Session,
    req: RequirementModel,
    qcos: List[QCO]
) -> List[RecommendationResponse]:
    """Retrieves all candidate standards, calculates scores, and returns sorted recommendations."""
    qco_std_ids = set()
    for q in qcos:
        qco_std_ids.update(q.target_standard_ids)

    # Get graph connected standard IDs
    relationships = db.query(StandardRelationship).all()
    graph_connected_ids = set()
    for r in relationships:
        graph_connected_ids.add(r.source_standard_id)
        graph_connected_ids.add(r.target_standard_id)

    standards = db.query(Standard).all()
    recommendations = []

    for std in standards:
        score, breakdown, reasons, rejection_reasons = compute_applicability_score(
            std, req, qco_std_ids, graph_connected_ids
        )

        rel_type = "PRIMARY"
        if "test" in std.domain.lower() or "testing" in std.category.lower():
            rel_type = "TEST"
        elif "safety" in std.domain.lower():
            rel_type = "SAFETY"
        elif "pipe" in std.category.lower() or "cable" in std.category.lower():
            rel_type = "MATERIAL"

        reg_status = "REQUIRED" if std.id in qco_std_ids else "NOT_IDENTIFIED"

        recommendations.append(RecommendationResponse(
            id=f"rec_{std.id}",
            standard_id=std.id,
            standard_number=std.standard_number,
            title=std.title,
            domain=std.domain,
            applicability_score=score,
            relationship_type=rel_type,
            reasons=reasons,
            rejection_reasons=rejection_reasons if score < 60.0 else [],
            score_breakdown=breakdown,
            regulatory_status=reg_status,
            status=std.status,
            publication_year=std.publication_year,
            source_url=std.source_url
        ))

    # Sort descending by score
    recommendations.sort(key=lambda x: x.applicability_score, reverse=True)
    return recommendations
