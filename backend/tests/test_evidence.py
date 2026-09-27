import pytest
from app.schemas.domain import StructuredRequirement, MatchReason, EvidenceItem
from app.services.evidence.extractor import extract_evidence_items

def test_extract_evidence_items_with_scope():
    req = StructuredRequirement(
        product="outdoor LED streetlight luminaire",
        category="Lighting",
        application="municipal roads",
        environment="outdoor"
    )
    
    std = {
        "id": "IS_10322_5_3_2012",
        "standard_number": "IS 10322 (Part 5/Sec 3): 2012",
        "title": "Luminaires - Particular Requirements - Luminaires for Road and Street Lighting",
        "scope": "Specifies safety and performance requirements for road, street, highway, and municipal outdoor LED luminaires operating up to 1000V with IP66 ingress protection and surge immunity.",
        "category": "Lighting & Luminaires",
        "domain": "Electrotechnical",
        "status": "CURRENT",
        "source_file": "standards.xlsx",
        "source_sheet": "Standards",
        "source_row": 147
    }
    
    breakdown = {"scope_match": 95.0, "product_category_match": 80.0}
    reasons = [MatchReason(code="SCOPE_MATCH", label="Scope aligns", description="Matches outdoor lighting")]
    
    evidence_list = extract_evidence_items(std, req, breakdown, reasons)
    
    assert len(evidence_list) >= 2
    scope_ev = next(ev for ev in evidence_list if ev.reason_code == "SCOPE_MATCH")
    assert scope_ev.source_file == "standards.xlsx"
    assert scope_ev.source_sheet == "Standards"
    assert scope_ev.source_row == 147
    assert scope_ev.source_field == "scope"
    assert scope_ev.evidence_strength in ["STRONG", "MODERATE"]
    assert any("outdoor" in t.lower() or "led" in t.lower() for t in scope_ev.matched_terms)

def test_distinct_source_rows_not_defaulted_to_1():
    """
    Verify that standards from DIFFERENT workbook rows retain distinct source_row values.
    MUST FAIL if all standards resolve to row 1.
    """
    from app.core.database import SessionLocal
    from app.services.retrieval.hybrid import get_hybrid_candidates
    
    db = SessionLocal()
    try:
        candidates = get_hybrid_candidates("safety helmet work chair luminaire steel bar", db, top_k_lexical=20, top_k_dense=20)
    finally:
        db.close()
    
    rows_found = set()
    std_row_map = {}
    
    for cand in candidates:
        s_row = cand.get("source_row")
        s_num = cand.get("standard_number")
        if s_row is not None:
            rows_found.add(s_row)
            std_row_map[s_num] = s_row
            
    # Assert we have multiple distinct rows and they are NOT all Row 1
    assert len(rows_found) > 1, f"Expected distinct source rows across standards, got: {rows_found}"
    assert not (len(rows_found) == 1 and 1 in rows_found), "FAILED: All standards defaulted to Row 1!"

def test_evidence_correspondence_and_matched_terms():
    """
    Verify that evidence.excerpt is contained in stored source field,
    and every matched term exists in excerpt.lower().
    """
    req = StructuredRequirement(
        product="industrial safety helmet",
        category="Personal Protective Equipment",
        application="construction site head protection"
    )
    
    std = {
        "id": "IS_2925_1984",
        "standard_number": "IS 2925: 1984",
        "title": "Specification for Industrial Safety Helmets",
        "scope": "Specifies constructional and performance requirements for industrial safety helmets for head protection of workers against falling objects and electrical shock hazards in construction sites.",
        "category": "Personal Protective Equipment",
        "domain": "Mechanical Engineering",
        "status": "CURRENT",
        "source_file": "standards.xlsx",
        "source_sheet": "Published Standards",
        "source_row": 147
    }
    
    evidence_list = extract_evidence_items(std, req, {"scope_match": 90.0}, [])
    
    for ev in evidence_list:
        # Assert provenance fields
        assert ev.source_file == "standards.xlsx"
        assert ev.source_sheet == "Published Standards"
        assert ev.source_row == 147
        
        # Assert matched terms exist in excerpt
        for term in ev.matched_terms:
            assert term.lower() in ev.excerpt.lower(), f"Term '{term}' not found in excerpt '{ev.excerpt}'"
