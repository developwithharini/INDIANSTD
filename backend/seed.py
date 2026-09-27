from sqlalchemy.orm import Session
from app.models.domain import Standard, StandardVersion, StandardAmendment, StandardRelationship, QCO

def seed_baseline_data(db: Session):
    """Seed baseline verified standards and QCO records if database is empty."""
    if db.query(Standard).count() > 0:
        return

    standards_data = [
        {
            "id": "IS_10322_5_1_2012",
            "standard_number": "IS 10322 (Part 5/Sec 1): 2012",
            "title": "Luminaires - Particular Requirements - Fixed General Purpose Luminaires",
            "scope": "Specifies requirements for fixed general purpose luminaires for use with tungsten filament, tubular fluorescent and other discharge lamps on supply voltages not exceeding 1000 V.",
            "category": "Lighting & Luminaires",
            "domain": "Electrotechnical",
            "publication_year": 2012,
            "status": "CURRENT",
            "source_type": "BIS_PUBLISHED_SNAPSHOT",
            "source_file": "standards.xlsx",
            "source_sheet": "Published Standards",
            "source_row": 301,
            "verified": True
        },
        {
            "id": "IS_10322_5_3_2012",
            "standard_number": "IS 10322 (Part 5/Sec 3): 2012",
            "title": "Luminaires - Particular Requirements - Luminaires for Road and Street Lighting",
            "scope": "Specifies safety and performance requirements for road, street, highway, and municipal outdoor LED luminaires operating up to 1000V with IP66 ingress protection and surge immunity.",
            "category": "Lighting & Luminaires",
            "domain": "Electrotechnical",
            "publication_year": 2012,
            "status": "CURRENT",
            "source_type": "BIS_PUBLISHED_SNAPSHOT",
            "source_file": "standards.xlsx",
            "source_sheet": "Published Standards",
            "source_row": 302,
            "verified": True
        },
        {
            "id": "IS_16106_2012",
            "standard_number": "IS 16106: 2012",
            "title": "Method of Measurement of Electrical and Photometric Characteristics of Solid State Lighting (LED) Products",
            "scope": "Covers test procedures and measurement methods for lumen output, efficacy, colour rendering index, and electrical characteristics of LED luminaires.",
            "category": "Lighting & Luminaires",
            "domain": "Electrotechnical",
            "publication_year": 2012,
            "status": "CURRENT",
            "source_type": "BIS_PUBLISHED_SNAPSHOT",
            "source_file": "standards.xlsx",
            "source_sheet": "Published Standards",
            "source_row": 405,
            "verified": True
        },
        {
            "id": "IS_4151_2015",
            "standard_number": "IS 4151: 2015",
            "title": "Protective Helmets for Two-Wheeler Motorcyclists - Specification",
            "scope": "Specifies materials, construction, workmanship, performance, and testing requirements (shock absorption, chin strap retention, penetration resistance) for protective helmets.",
            "category": "Personal Protective Equipment",
            "domain": "Mechanical Engineering",
            "publication_year": 2015,
            "status": "CURRENT",
            "source_type": "BIS_PUBLISHED_SNAPSHOT",
            "source_file": "standards.xlsx",
            "source_sheet": "Published Standards",
            "source_row": 820,
            "verified": True
        },
        {
            "id": "IS_2925_1984",
            "standard_number": "IS 2925: 1984",
            "title": "Specification for Industrial Safety Helmets",
            "scope": "Specifies constructional and performance requirements for industrial safety helmets for head protection of workers against falling objects and electrical shock hazards in construction sites.",
            "category": "Personal Protective Equipment",
            "domain": "Mechanical Engineering",
            "publication_year": 1984,
            "status": "CURRENT",
            "source_type": "BIS_PUBLISHED_SNAPSHOT",
            "source_file": "standards.xlsx",
            "source_sheet": "Published Standards",
            "source_row": 147,
            "verified": True
        },
        {
            "id": "IS_1786_2008",
            "standard_number": "IS 1786: 2008",
            "title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement - Specification",
            "scope": "Covers requirements of high strength deformed steel bars and wires of grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D, and Fe 600 for structural reinforced concrete work.",
            "category": "Steel & Metallurgy",
            "domain": "Civil Engineering",
            "publication_year": 2008,
            "status": "CURRENT",
            "source_type": "BIS_PUBLISHED_SNAPSHOT",
            "source_file": "standards.xlsx",
            "source_sheet": "Published Standards",
            "source_row": 512,
            "verified": True
        },
        {
            "id": "IS_17631_2022",
            "standard_number": "IS 17631: 2022",
            "title": "Work Chairs - Performance, Safety and Test Requirements",
            "scope": "Specifies safety, structural strength, durability, dimensions, and stability test requirements for office work chairs, executive seating, and ergonomic metal-base chairs.",
            "category": "Furniture & Appliances",
            "domain": "Production & General Engineering",
            "publication_year": 2022,
            "status": "CURRENT",
            "source_type": "BIS_PUBLISHED_SNAPSHOT",
            "source_file": "standards.xlsx",
            "source_sheet": "Published Standards",
            "source_row": 1487,
            "verified": True
        }
    ]

    for std_dict in standards_data:
        std = Standard(**std_dict)
        db.add(std)
    db.commit()

    # Add Relationships
    rel1 = StandardRelationship(
        source_standard_id="IS_10322_5_3_2012",
        target_standard_id="IS_16106_2012",
        relationship_type="TEST_METHOD",
        evidence_text="Clause 4.2 specifies photometric measurement of LED streetlights according to IS 16106 test procedures.",
        verified=True
    )
    rel2 = StandardRelationship(
        source_standard_id="IS_4151_2015",
        target_standard_id="IS_2925_1984",
        relationship_type="RELATED_PRODUCT",
        evidence_text="Cross-referenced for shock absorption test parameters in industrial vs two-wheeler head protective gear.",
        verified=True
    )
    db.add(rel1)
    db.add(rel2)

    # Add QCOs
    qco1 = QCO(
        id="qco_electronics_2014",
        title="Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order, 2014",
        ministry="Ministry of Electronics and Information Technology (MeitY)",
        order_number="S.O. 2905(E)",
        effective_date="2014-09-01",
        mandatory_certification_type="CRS (Compulsory Registration)",
        covered_standards=["IS 10322 (Part 5/Sec 3): 2012", "IS 16106: 2012"]
    )
    db.add(qco1)
    db.commit()
