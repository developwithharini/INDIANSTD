import re
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.domain import Standard, QCO, StandardRelationship
from app.schemas.domain import RequirementModel, TenderFindingResponse, SpecificationReadinessScore

AMBIGUOUS_WORDS = ["high quality", "durable", "suitable", "premium", "heavy duty", "best grade", "standard quality", "long lasting"]

def audit_tender_document(
    db: Session,
    raw_text: str,
    req: RequirementModel
) -> Tuple[List[TenderFindingResponse], SpecificationReadinessScore]:
    """Audits tender specifications for missing standards, outdated references, testing gaps, and ambiguities."""
    findings = []
    text_lower = raw_text.lower()

    # 1. Detect Outdated Standard References
    if "10322:1985" in text_lower or "is 10322 (1985)" in text_lower or "is 10322: 1985" in text_lower:
        findings.append(TenderFindingResponse(
            id="find_outdated_10322",
            category="OUTDATED_REF",
            severity="BLOCKING",
            title="Outdated Standard Reference Detected (IS 10322:1985)",
            description="The tender references IS 10322:1985 which has been SUPERSEDED by IS 10322 (Part 5/Sec 1): 2012.",
            evidence_text="Clause text references 'IS 10322:1985'",
            suggested_fix="Update standard reference to IS 10322 (Part 5/Sec 1): 2012.",
            related_standard_id="IS_10322_5_1_2012",
            status="OPEN"
        ))

    # 2. Detect Missing Test-Method Standards
    if ("led" in text_lower or "street light" in text_lower) and "16106" not in text_lower:
        findings.append(TenderFindingResponse(
            id="find_missing_test_16106",
            category="MISSING_TEST",
            severity="HIGH",
            title="Missing Photometric Test Method Standard (IS 16106:2012)",
            description="Lumen output and photometric efficiency are specified, but normative test method IS 16106:2012 is omitted.",
            evidence_text="Tender specifies 120 lm/W efficacy without specifying test method",
            suggested_fix="Insert mandatory requirement: 'Electrical and photometric measurements shall be tested in accordance with IS 16106:2012'.",
            related_standard_id="IS_16106_2012",
            status="OPEN"
        ))

    # 3. Detect Missing Safety Standards
    if ("led" in text_lower or "luminaire" in text_lower) and "16108" not in text_lower:
        findings.append(TenderFindingResponse(
            id="find_missing_safety_16108",
            category="MISSING_SAFETY",
            severity="HIGH",
            title="Missing Photobiological Safety Standard (IS 16108:2012)",
            description="LED light source safety requires optical hazard evaluation under IS 16108:2012.",
            evidence_text="No mention of optical blue light hazard limits",
            suggested_fix="Insert requirement: 'Luminaires shall pass photobiological safety testing per IS 16108:2012'.",
            related_standard_id="IS_16108_2012",
            status="OPEN"
        ))

    # 4. Detect Regulatory / QCO Compliance Gaps
    if ("led" in text_lower or "street light" in text_lower) and ("crs" not in text_lower and "compulsory registration" not in text_lower and "bis" not in text_lower):
        findings.append(TenderFindingResponse(
            id="find_qco_gap_led",
            category="REGULATORY_GAP",
            severity="BLOCKING",
            title="Missing Mandatory BIS QCO Certification Requirement",
            description="LED Luminaires and drivers are subject to mandatory MeitY Quality Control Order CRS registration.",
            evidence_text="Tender schedule omits compulsory registration clause",
            suggested_fix="Mandate: 'Bidders must possess valid BIS CRS registration under Electronics and IT Goods QCO'.",
            related_standard_id="IS_10322_5_3_2012",
            status="OPEN"
        ))

    # 5. Ambiguous Phrasing Detection
    for phrase in AMBIGUOUS_WORDS:
        if phrase in text_lower:
            findings.append(TenderFindingResponse(
                id=f"find_ambiguous_{phrase.replace(' ', '_')}",
                category="AMBIGUOUS_PHRASE",
                severity="MEDIUM",
                title=f"Ambiguous Phrasing: '{phrase.title()}'",
                description=f"Phrasing like '{phrase}' introduces subjective risk during inspection and compliance auditing.",
                evidence_text=f"Found '{phrase}' in document text",
                suggested_fix=f"Replace '{phrase}' with measurable standard-linked parameters (e.g. minimum yield strength, IP rating, or photometric tolerance).",
                related_standard_id=None,
                status="OPEN"
            ))

    # Calculate Specification Readiness Score (0-100)
    outdated_count = sum(1 for f in findings if f.category == "OUTDATED_REF")
    missing_test_count = sum(1 for f in findings if f.category == "MISSING_TEST")
    missing_safety_count = sum(1 for f in findings if f.category == "MISSING_SAFETY")
    reg_gap_count = sum(1 for f in findings if f.category == "REGULATORY_GAP")
    ambiguous_count = sum(1 for f in findings if f.category == "AMBIGUOUS_PHRASE")

    standard_coverage = 90.0 if not outdated_count else 60.0
    version_currency = 100.0 if not outdated_count else 40.0
    normative_coverage = 85.0
    testing_coverage = 100.0 if not missing_test_count else 50.0
    safety_coverage = 100.0 if not missing_safety_count else 60.0
    certification_coverage = 100.0 if not reg_gap_count else 30.0
    req_completeness = max(30.0, 100.0 - (ambiguous_count * 15.0))

    overall = (
        standard_coverage * 0.20 +
        version_currency * 0.20 +
        normative_coverage * 0.15 +
        testing_coverage * 0.15 +
        safety_coverage * 0.10 +
        certification_coverage * 0.10 +
        req_completeness * 0.10
    )

    readiness = SpecificationReadinessScore(
        overall_score=round(overall, 1),
        standard_coverage=round(standard_coverage, 1),
        version_currency=round(version_currency, 1),
        normative_coverage=round(normative_coverage, 1),
        testing_coverage=round(testing_coverage, 1),
        safety_coverage=round(safety_coverage, 1),
        certification_coverage=round(certification_coverage, 1),
        requirement_completeness=round(req_completeness, 1)
    )

    return findings, readiness
