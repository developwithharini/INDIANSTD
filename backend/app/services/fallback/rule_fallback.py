import re
from typing import Dict, Any
from app.schemas.domain import RequirementModel

def rule_based_extract(text: str, language: str = "en") -> RequirementModel:
    """Extracts structured requirement attributes using deterministic pattern matching."""
    text_lower = text.lower()
    
    product = "General Procurement Item"
    category = "Uncategorized"
    domain = "general"
    
    if "led" in text_lower or "street light" in text_lower or "luminaire" in text_lower or "தெருவிளக்கு" in text_lower:
        product = "Outdoor LED Streetlight Luminaire"
        category = "Street Lighting"
        domain = "lighting"
    elif "helmet" in text_lower or "protective gear" in text_lower or "தலைக்கவசம்" in text_lower:
        product = "Industrial Safety Helmet"
        category = "Safety Helmets"
        domain = "ppe"
    elif "cement" in text_lower or "portland" in text_lower or "சிமெண்ட்" in text_lower:
        product = "Ordinary Portland Cement (53 Grade)"
        category = "Cement"
        domain = "construction"
    elif "steel" in text_lower or "bar" in text_lower or "rebars" in text_lower:
        product = "High Strength Deformed Steel Reinforcement Bars"
        category = "Steel Reinforcement"
        domain = "construction"
    elif "chair" in text_lower or "furniture" in text_lower or "நாற்காலி" in text_lower:
        product = "Ergonomic Metal Office Work Chair"
        category = "Office Furniture"
        domain = "furniture"
    elif "pipe" in text_lower or "pvc" in text_lower or "water tank" in text_lower:
        product = "Unplasticized PVC Water Pipe / Storage Tank"
        category = "Pipes & Storage"
        domain = "water_storage"
    elif "cable" in text_lower or "wire" in text_lower:
        product = "PVC Insulated Power Cable"
        category = "Electrical Wiring"
        domain = "cables"

    attributes = []
    if "ip66" in text_lower: attributes.append("IP66 Weatherproof Enclosure")
    if "ip65" in text_lower: attributes.append("IP65 Dust and Water Ingress Protection")
    if "surge" in text_lower or "10kv" in text_lower: attributes.append("10kV Surge Protection Device")
    if "isi" in text_lower: attributes.append("Mandatory ISI Mark Certification")
    if "fe 500" in text_lower or "fe500d" in text_lower: attributes.append("Fe 500D Grade Ductility")

    testing_reqs = []
    if "photometric" in text_lower or "lumen" in text_lower: testing_reqs.append("Photometric measurement per IS 16106")
    if "impact" in text_lower: testing_reqs.append("Shock absorption & penetration resistance test")
    if "tensile" in text_lower: testing_reqs.append("High yield tensile strength test")

    safety_reqs = []
    if "blue light" in text_lower or "photobiological" in text_lower: safety_reqs.append("Photobiological optical safety per IS 16108")
    if "electrical" in text_lower or "insulation" in text_lower: safety_reqs.append("High voltage insulation resistance safety test")

    # Extract explicitly mentioned standards (e.g. IS 10322, IS 2925, IS 1786)
    mentioned_standards = re.findall(r'is\s?\d{3,5}(?:\s?\([^\)]+\))?', text, re.IGNORECASE)
    mentioned_standards = [s.upper() for s in set(mentioned_standards)]

    return RequirementModel(
        product=product,
        category=category,
        domain=domain,
        application="Municipal infrastructure / Enterprise procurement",
        environment="Outdoor / Heavy Duty Industrial",

        attributes=attributes,
        performance_requirements=["Durable service life > 50,000 hours", "High energy efficiency"],
        safety_requirements=safety_reqs if safety_reqs else ["Standard BIS Safety Compliance"],
        testing_requirements=testing_reqs if testing_reqs else ["Standard Batch Acceptance Test"],
        installation_requirements=["Pole/Surface Mounting per Installation Manual"],
        materials=["Aluminium Alloy Die Cast / High Density Polymers / Steel"],
        quantities=["As specified in schedule"],
        mentioned_standards=mentioned_standards,
        regulatory_clues=["BIS Mandatory Certification", "QCO Compliance"] if "isi" in text_lower or "bis" in text_lower else [],
        language=language
    )
