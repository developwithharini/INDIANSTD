from typing import Dict, Any, List
from app.schemas.domain import RequirementModel, RecommendationResponse

def generate_procurement_specification(
    req: RequirementModel,
    recommendations: List[RecommendationResponse]
) -> Dict[str, Any]:
    """Generates a structured, evidence-backed procurement specification document."""
    primary_stds = [r for r in recommendations if r.relationship_type == "PRIMARY" or r.applicability_score > 75.0]
    test_stds = [r for r in recommendations if r.relationship_type == "TEST"]
    safety_stds = [r for r in recommendations if r.relationship_type == "SAFETY"]
    
    sections = [
        {
            "section_number": "1.0",
            "title": "Product Overview & Procurement Scope",
            "content": f"This specification governs the technical, safety, testing, and quality requirements for supply of {req.product} ({req.category}) intended for use in {req.application}."
        },
        {
            "section_number": "2.0",
            "title": "Mandatory Indian Standards (BIS Compliance)",
            "content": "The supplied items shall strictly comply with the latest published editions and amendments of the following Indian Standards:",
            "standards": [
                {"number": s.standard_number, "title": s.title, "status": s.status, "year": s.publication_year}
                for s in primary_stds[:5]
            ]
        },
        {
            "section_number": "3.0",
            "title": "Technical & Material Parameters",
            "content": f"Environment: {req.environment}\nKey Attributes: {', '.join(req.attributes)}\nMaterials: {', '.join(req.materials)}"
        },
        {
            "section_number": "4.0",
            "title": "Testing Procedures & Acceptance Norms",
            "content": "Electrical, photometric, mechanical, and safety tests shall be carried out in accordance with:",
            "standards": [
                {"number": s.standard_number, "title": s.title, "status": s.status}
                for s in test_stds + safety_stds
            ]
        },
        {
            "section_number": "5.0",
            "title": "Regulatory & Quality Control Orders (QCO)",
            "content": "Bidders must possess valid BIS Mark / CRS Registration as mandated under applicable Ministry Quality Control Orders."
        },
        {
            "section_number": "6.0",
            "title": "Evidence & Audit Provenance",
            "content": "All technical claims must be supported by NABL-accredited test reports referencing the designated BIS standards."
        }
    ]

    return {
        "title": f"Technical Specification for {req.product}",
        "sections": sections,
        "total_standards_referenced": len(primary_stds) + len(test_stds) + len(safety_stds),
        "generated_at": "2026-09-21"
    }
