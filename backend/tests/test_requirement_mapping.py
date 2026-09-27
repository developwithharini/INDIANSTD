from app.schemas.domain import (
    StructuredRequirement,
    RecommendationItem,
    EvidenceItem,
    MatchReason
)
from app.services.evidence.mapper import requirement_mapper

def test_extract_discrete_requirements():
    req = StructuredRequirement(
        product="industrial safety helmet",
        application="construction workers",
        environment="outdoor",
        safety_requirements=["shock absorption", "penetration resistance"],
        performance_requirements=["flame resistance"],
        mentioned_standards=["IS 2925"]
    )
    items = requirement_mapper.extract_discrete_requirements(req)
    assert len(items) == 7
    assert items[0].id == "req_01"
    assert items[0].value == "industrial safety helmet"
    assert items[0].type == "product"
    assert items[1].value == "construction workers"
    assert items[1].type == "application"

def test_requirement_evidence_link_creation_and_integrity():
    req = StructuredRequirement(
        product="industrial safety helmet",
        application="construction workers",
        safety_requirements=["shock absorption"]
    )
    rec = RecommendationItem(
        standard_id="IS_2925_1984",
        standard_number="IS 2925: 1984",
        title="Specification for Industrial Safety Helmets",
        applicability_score=92.0,
        rank=1,
        status="CURRENT",
        reasons=[MatchReason(code="SCOPE_MATCH", label="Scope Match", description="Product match")],
        score_breakdown={"product_match": 100.0},
        evidence=[
            EvidenceItem(
                evidence_id="ev_01",
                standard_id="IS_2925_1984",
                reason_code="SCOPE_MATCH",
                source_file="standards.xlsx",
                source_sheet="Published Standards",
                source_row=147,
                source_field="scope",
                excerpt="Specifies requirements for industrial safety helmets for construction workers featuring shock absorption.",
                matched_terms=["industrial safety helmet", "shock absorption"],
                requirement_signal="industrial safety helmet",
                evidence_strength="STRONG"
            )
        ]
    )

    extracted_reqs, coverage_items, links, summary = requirement_mapper.map_requirements_to_evidence(
        req, [rec]
    )

    assert len(extracted_reqs) == 3
    assert len(links) >= 2
    assert summary["supported_count"] >= 2

    # Integrity Check: every link has valid requirement_id, standard_id, and evidence_id
    for link in links:
        assert link.requirement_id in [r.id for r in extracted_reqs]
        assert link.standard_id == rec.standard_id
        assert link.evidence_id == "ev_01"
        assert link.support_strength in ["STRONG", "MODERATE", "LIMITED"]

def test_no_support_and_partial_support():
    req = StructuredRequirement(
        product="underwater scuba helmet",
        safety_requirements=["deep sea pressure resistance"]
    )
    rec = RecommendationItem(
        standard_id="IS_2925_1984",
        standard_number="IS 2925: 1984",
        title="Specification for Industrial Safety Helmets",
        applicability_score=30.0,
        rank=1,
        status="CURRENT",
        reasons=[],
        score_breakdown={},
        evidence=[]
    )

    extracted_reqs, coverage_items, links, summary = requirement_mapper.map_requirements_to_evidence(
        req, [rec]
    )

    assert summary["unsupported_count"] == len(extracted_reqs)
    for cov in coverage_items:
        assert cov.status == "NO_EVIDENCE"
        assert len(cov.supporting_standards) == 0

def test_multi_standard_support():
    req = StructuredRequirement(
        product="safety helmet",
        safety_requirements=["shock absorption"]
    )
    rec1 = RecommendationItem(
        standard_id="IS_2925_1984",
        standard_number="IS 2925: 1984",
        title="Specification for Industrial Safety Helmets",
        applicability_score=90.0,
        rank=1,
        status="CURRENT",
        reasons=[],
        score_breakdown={},
        evidence=[
            EvidenceItem(
                evidence_id="ev_01",
                standard_id="IS_2925_1984",
                reason_code="SCOPE_MATCH",
                source_file="standards.xlsx",
                source_sheet="Standards",
                source_row=147,
                source_field="scope",
                excerpt="Includes shock absorption test procedures.",
                matched_terms=["shock absorption"]
            )
        ]
    )
    rec2 = RecommendationItem(
        standard_id="IS_4151_2015",
        standard_number="IS 4151: 2015",
        title="Protective Helmets for Two-Wheeler Riders",
        applicability_score=75.0,
        rank=2,
        status="CURRENT",
        reasons=[],
        score_breakdown={},
        evidence=[
            EvidenceItem(
                evidence_id="ev_02",
                standard_id="IS_4151_2015",
                reason_code="SCOPE_MATCH",
                source_file="standards.xlsx",
                source_sheet="Standards",
                source_row=302,
                source_field="scope",
                excerpt="Specifies shock absorption requirements for protective helmets.",
                matched_terms=["shock absorption"]
            )
        ]
    )

    extracted_reqs, coverage_items, links, summary = requirement_mapper.map_requirements_to_evidence(
        req, [rec1, rec2]
    )

    shock_cov = next(c for c in coverage_items if c.requirement.value == "shock absorption")
    assert len(shock_cov.supporting_standards) == 2
    assert {s["standard_id"] for s in shock_cov.supporting_standards} == {"IS_2925_1984", "IS_4151_2015"}
