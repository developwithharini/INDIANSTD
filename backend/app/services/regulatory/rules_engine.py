from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.domain import QCO, Standard
from app.schemas.domain import RequirementModel

def evaluate_regulatory_status(
    db: Session,
    requirement: RequirementModel,
    target_standard_id: str
) -> Dict[str, Any]:
    """Deterministic rule engine evaluating mandatory regulatory requirements for a given standard."""
    qcos = db.query(QCO).all()

    matching_qco = None
    for qco in qcos:
        if target_standard_id in qco.target_standard_ids:
            matching_qco = qco
            break

    if matching_qco:
        return {
            "status": "REQUIRED",
            "qco_title": matching_qco.title,
            "order_number": matching_qco.order_number,
            "ministry": matching_qco.ministry,
            "effective_date": matching_qco.effective_date,
            "certification_scheme": matching_qco.mandatory_certification_type,
            "evidence_url": matching_qco.source_url,
            "verified": matching_qco.verified,
            "rule_explanation": f"Mandatory certification under {matching_qco.mandatory_certification_type} governed by {matching_qco.ministry} ({matching_qco.order_number}) effective since {matching_qco.effective_date}."
        }

    # Check for category/product level clues
    category_lower = requirement.category.lower()
    if any(term in category_lower for term in ["lighting", "led", "helmet", "steel", "cement"]):
        return {
            "status": "POTENTIALLY_APPLICABLE",
            "rule_explanation": f"Product category '{requirement.category}' is within a sector subject to active Quality Control Orders. Verify exact scope.",
            "evidence_url": "https://www.bis.gov.in/qco-list",
            "verified": True
        }

    return {
        "status": "NOT_IDENTIFIED",
        "rule_explanation": "No active mandatory QCO identified in current regulatory dataset for this standard.",
        "verified": True
    }
