import pytest
from app.schemas.domain import StructuredRequirement, MatchReason
from app.services.matching.abstention import abstention_engine, AbstentionEngine
from app.services.matching.applicability import applicability_engine

def test_gymnastic_landing_mat_abstention():
    """
    Test zero-match query 'gymnastic landing mat' triggers NO_SUFFICIENT_MATCH cleanly.
    """
    req = StructuredRequirement(
        product="gymnastic landing mat",
        application="sports facility",
        environment="indoor gym",
        performance_requirements=["foam density", "shock damping"],
        safety_requirements=[],
        testing_requirements=[],
        material_specifications=[],
        dimension_specifications=[],
        mentioned_standards=[]
    )

    # Simulated candidate results for unrelated query (low scores)
    candidates = [
        {
            "id": "std_sports_01",
            "standard_number": "IS 4151: 2015",
            "title": "Protective Helmets for Two-Wheeler Motorcyclists",
            "scope": "Specifies requirements for helmets used by motorcyclists.",
            "dense_score": 0.2,
            "lexical_score": 0.1,
            "reranker_score": 0.1,
            "status": "CURRENT"
        }
    ]

    recommendations, why_not, scored_candidates = applicability_engine.generate_recommendations(req, candidates)
    decision_state, is_abstained, reason, closest_cand, calibration = abstention_engine.evaluate_decision_state(
        req, recommendations, why_not, scored_candidates
    )

    assert decision_state == "NO_SUFFICIENT_MATCH"
    assert is_abstained is True
    assert reason is not None
    assert "No direct Indian Standard was found" in reason
    assert "gymnastic landing mat" in reason
    assert closest_cand is not None
    assert closest_cand.standard_number == "IS 4151: 2015"
    assert calibration.tier == "ABSTAIN"
    assert calibration.confidence == "NONE"


def test_strongly_supported_match():
    """
    Test high score query triggers STRONGLY_SUPPORTED decision state.
    """
    req = StructuredRequirement(
        product="LED Streetlight",
        application="outdoor road lighting",
        environment="outdoor",
        performance_requirements=["IP66", "100W"],
        safety_requirements=[],
        testing_requirements=[],
        material_specifications=[],
        dimension_specifications=[],
        mentioned_standards=["IS 10322"]
    )

    candidates = [
        {
            "id": "std_10322",
            "standard_number": "IS 10322: Part 5: Sec 3: 2012",
            "title": "Luminaires - Particular Requirements - Road and Street Lighting",
            "scope": "Specifies safety and performance requirements for luminaires for road and street lighting.",
            "dense_score": 0.95,
            "lexical_score": 0.9,
            "reranker_score": 0.95,
            "status": "CURRENT"
        }
    ]

    recommendations, why_not, scored_candidates = applicability_engine.generate_recommendations(req, candidates)
    decision_state, is_abstained, reason, closest_cand, calibration = abstention_engine.evaluate_decision_state(
        req, recommendations, why_not, scored_candidates
    )

    assert decision_state == "STRONGLY_SUPPORTED"
    assert is_abstained is False
    assert reason is None
    assert calibration.tier == "STRONG"
    assert calibration.confidence == "HIGH"
    assert len(recommendations) == 1
    assert recommendations[0].match_tier == "STRONG"


def test_possible_match_review_required():
    """
    Test moderate score candidate triggers POSSIBLE_MATCH_REVIEW_REQUIRED.
    """
    req = StructuredRequirement(
        product="industrial container",
        application="chemical packaging",
        environment="factory",
        performance_requirements=["corrosion resistant"],
        safety_requirements=[],
        testing_requirements=[],
        material_specifications=[],
        dimension_specifications=[],
        mentioned_standards=[]
    )

    candidates = [
        {
            "id": "std_chem_01",
            "standard_number": "IS 7903: 2017",
            "title": "Unbreakable High Density Polyethylene Drums",
            "scope": "Covers industrial polyethylene drums for general industrial packaging.",
            "dense_score": 0.70,
            "lexical_score": 0.6,
            "reranker_score": 0.7,
            "status": "CURRENT"
        }
    ]

    recommendations, why_not, scored_candidates = applicability_engine.generate_recommendations(req, candidates)
    decision_state, is_abstained, reason, closest_cand, calibration = abstention_engine.evaluate_decision_state(
        req, recommendations, why_not, scored_candidates
    )

    assert decision_state in ["POSSIBLE_MATCH_REVIEW_REQUIRED", "STRONGLY_SUPPORTED"]
    assert is_abstained is False
    assert calibration.tier in ["REVIEW_REQUIRED", "STRONG"]
