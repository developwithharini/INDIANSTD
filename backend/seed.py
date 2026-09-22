import sys
import os

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine, SessionLocal
from app.models.domain import (
    Standard, StandardVersion, StandardAmendment,
    StandardRelationship, QCO, ProcurementProject
)

def seed_database():
    print("🌱 Initializing MANAK Standards & Regulatory Database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data to allow clean re-seeding
    db.query(StandardRelationship).delete()
    db.query(StandardAmendment).delete()
    db.query(StandardVersion).delete()
    db.query(QCO).delete()
    db.query(Standard).delete()
    db.commit()

    standards_data = [
        # Domain 1: Lighting & Electrical Equipment
        {
            "id": "IS_10322_5_1_2012",
            "standard_number": "IS 10322 (Part 5/Sec 1): 2012",
            "title": "Luminaires - Part 5: Particular Requirements, Section 1: Fixed General Purpose Luminaires",
            "domain": "lighting",
            "category": "Luminaires",
            "scope_summary": "Specifies requirements for fixed general purpose luminaires for use with electrical light sources on supply voltages not exceeding 1 000 V.",
            "status": "CURRENT",
            "publication_year": 2012,
            "revision_date": "2021-04-15",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS10322-5-1",
            "verified": True
        },
        {
            "id": "IS_16102_1_2012",
            "standard_number": "IS 16102 (Part 1): 2012",
            "title": "Self-Ballasted LED Lamps for General Lighting Services - Part 1: Safety Requirements",
            "domain": "lighting",
            "category": "LED Lighting",
            "scope_summary": "Specifies the safety and interchangeability requirements, together with test methods, for self-ballasted LED lamps.",
            "status": "CURRENT",
            "publication_year": 2012,
            "revision_date": "2020-01-10",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS16102-1",
            "verified": True
        },
        {
            "id": "IS_16102_2_2012",
            "standard_number": "IS 16102 (Part 2): 2012",
            "title": "Self-Ballasted LED Lamps for General Lighting Services - Part 2: Performance Requirements",
            "domain": "lighting",
            "category": "LED Lighting",
            "scope_summary": "Specifies performance requirements for self-ballasted LED lamps for general lighting services.",
            "status": "CURRENT",
            "publication_year": 2012,
            "revision_date": "2019-11-05",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS16102-2",
            "verified": True
        },
        {
            "id": "IS_16103_1_2012",
            "standard_number": "IS 16103 (Part 1): 2012",
            "title": "Led Modules For General Lighting - Part 1 Safety Requirements",
            "domain": "lighting",
            "category": "LED Modules",
            "scope_summary": "Specifies general and safety requirements for light emitting diode (LED) modules operating under constant voltage, constant current or constant power.",
            "status": "CURRENT",
            "publication_year": 2012,
            "revision_date": "2021-08-20",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS16103-1",
            "verified": True
        },
        {
            "id": "IS_15885_2_13_2012",
            "standard_number": "IS 15885 (Part 2/Sec 13): 2012",
            "title": "Safety of Lamp Controlgear - Part 2: Particular Requirements, Section 13: D.C. or A.C. Supplied Electronic Controlgear for LED Modules",
            "domain": "lighting",
            "category": "LED Drivers",
            "scope_summary": "Specifies particular safety requirements for electronic controlgear for use on d.c. supplies up to 250 V and a.c. supplies up to 1000 V at 50 Hz/60 Hz.",
            "status": "CURRENT",
            "publication_year": 2012,
            "revision_date": "2022-03-12",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS15885-2-13",
            "verified": True
        },
        {
            "id": "IS_10322_5_3_2012",
            "standard_number": "IS 10322 (Part 5/Sec 3): 2012",
            "title": "Luminaires - Part 5: Particular Requirements, Section 3: Luminaires for Road and Street Lighting",
            "domain": "lighting",
            "category": "Street Lighting",
            "scope_summary": "Specifies requirements for road and street lighting luminaires for use with electrical light sources on supply voltages not exceeding 1 000 V.",
            "status": "CURRENT",
            "publication_year": 2012,
            "revision_date": "2023-01-15",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS10322-5-3",
            "verified": True
        },

        # Domain 2: Personal Protective Equipment (PPE) & Helmets
        {
            "id": "IS_2925_1984",
            "standard_number": "IS 2925: 1984",
            "title": "Specification for Industrial Safety Helmets",
            "domain": "ppe",
            "category": "Safety Helmets",
            "scope_summary": "Specifies requirements for safety helmets intended for protection of industrial workers against impact hazards and penetration.",
            "status": "CURRENT",
            "publication_year": 1984,
            "revision_date": "2018-09-10",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS2925",
            "verified": True
        },
        {
            "id": "IS_4151_2015",
            "standard_number": "IS 4151: 2015",
            "title": "Protective Helmets for Two-Wheeler Motorcyclists - Specification",
            "domain": "ppe",
            "category": "Helmets",
            "scope_summary": "Specifies requirements for protective helmets for riders of two-wheeled motor vehicles for protective coverage of the head.",
            "status": "CURRENT",
            "publication_year": 2015,
            "revision_date": "2021-06-01",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS4151",
            "verified": True
        },
        {
            "id": "IS_15298_2_2016",
            "standard_number": "IS 15298 (Part 2): 2016",
            "title": "Personal Protective Equipment - Part 2: Safety Footwear",
            "domain": "ppe",
            "category": "Safety Footwear",
            "scope_summary": "Specifies basic and additional (optional) requirements for safety footwear used for commercial purpose.",
            "status": "CURRENT",
            "publication_year": 2016,
            "revision_date": "2022-11-20",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS15298-2",
            "verified": True
        },
        {
            "id": "IS_9473_2002",
            "standard_number": "IS 9473: 2002",
            "title": "Respiratory Protective Devices - Filtering Half Masks to Protect Against Particles - Specification",
            "domain": "ppe",
            "category": "Respiratory Protection",
            "scope_summary": "Specifies requirements for filtering half masks used as respiratory protective devices against solid and liquid aerosols.",
            "status": "CURRENT",
            "publication_year": 2002,
            "revision_date": "2020-04-15",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS9473",
            "verified": True
        },

        # Domain 3: Construction Materials & Cement/Steel
        {
            "id": "IS_1786_2008",
            "standard_number": "IS 1786: 2008",
            "title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement - Specification",
            "domain": "construction",
            "category": "Steel Reinforcement",
            "scope_summary": "Covers requirements for high strength deformed steel bars and wires for use as reinforcement in concrete in grades Fe 415, Fe 500, Fe 550, Fe 600.",
            "status": "CURRENT",
            "publication_year": 2008,
            "revision_date": "2019-08-14",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS1786",
            "verified": True
        },
        {
            "id": "IS_269_2015",
            "standard_number": "IS 269: 2015",
            "title": "Ordinary Portland Cement - Specification",
            "domain": "construction",
            "category": "Cement",
            "scope_summary": "Covers manufacturing and chemical and physical requirements for Ordinary Portland Cement of 33, 43 and 53 grades.",
            "status": "CURRENT",
            "publication_year": 2015,
            "revision_date": "2021-12-01",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS269",
            "verified": True
        },
        {
            "id": "IS_456_2000",
            "standard_number": "IS 456: 2000",
            "title": "Plain and Reinforced Concrete - Code of Practice",
            "domain": "construction",
            "category": "Concrete Practice",
            "scope_summary": "Deals with the general structural use of plain and reinforced concrete in structures.",
            "status": "CURRENT",
            "publication_year": 2000,
            "revision_date": "2021-07-30",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS456",
            "verified": True
        },

        # Domain 4: Furniture & Office Equipment
        {
            "id": "IS_3499_2017",
            "standard_number": "IS 3499: 2017",
            "title": "Metal Chairs, Office and Industrial - Specification",
            "domain": "furniture",
            "category": "Office Furniture",
            "scope_summary": "Specifies requirements for dimensions, material, design, construction and performance testing of metal chairs for office and industrial purposes.",
            "status": "CURRENT",
            "publication_year": 2017,
            "revision_date": "2022-05-18",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS3499",
            "verified": True
        },
        {
            "id": "IS_17631_2022",
            "standard_number": "IS 17631: 2022",
            "title": "Work Chairs - Specification",
            "domain": "furniture",
            "category": "Ergonomic Seating",
            "scope_summary": "Specifies dimensions, safety, strength, durability and ergonomics requirements for work chairs used in offices.",
            "status": "CURRENT",
            "publication_year": 2022,
            "revision_date": "2022-10-01",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS17631",
            "verified": True
        },
        {
            "id": "IS_3312_2021",
            "standard_number": "IS 3312: 2021",
            "title": "Steel Storage Cabinets - Specification",
            "domain": "furniture",
            "category": "Storage Equipment",
            "scope_summary": "Specifies requirements for general purpose steel storage cabinets, wardrobes, and lockers.",
            "status": "CURRENT",
            "publication_year": 2021,
            "revision_date": "2023-02-10",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS3312",
            "verified": True
        },

        # Domain 5: Water Containers & PVC Pipes
        {
            "id": "IS_12701_1996",
            "standard_number": "IS 12701: 1996",
            "title": "Rotational Moulded Polyethylene Water Storage Tanks - Specification",
            "domain": "water_storage",
            "category": "Water Tanks",
            "scope_summary": "Covers requirements for materials, dimensions, construction and test procedures for rotational moulded polyethylene overhead water storage tanks.",
            "status": "CURRENT",
            "publication_year": 1996,
            "revision_date": "2020-11-12",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS12701",
            "verified": True
        },
        {
            "id": "IS_4985_2021",
            "standard_number": "IS 4985: 2021",
            "title": "Unplasticized PVC Pipes for Potable Water Supplies - Specification",
            "domain": "water_storage",
            "category": "Pipes & Fittings",
            "scope_summary": "Specifies requirements for unplasticized polyvinyl chloride (uPVC) pipes intended for potable water supplies and agricultural drainage.",
            "status": "CURRENT",
            "publication_year": 2021,
            "revision_date": "2022-09-01",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS4985",
            "verified": True
        },

        # Domain 6: Cables & Wiring
        {
            "id": "IS_694_2010",
            "standard_number": "IS 694: 2010",
            "title": "Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables for Working Voltages up to and Including 1100 V",
            "domain": "cables",
            "category": "Electrical Wiring",
            "scope_summary": "Specifies requirements for single and multicore PVC insulated cables for domestic and industrial wiring up to 1100 V.",
            "status": "CURRENT",
            "publication_year": 2010,
            "revision_date": "2021-03-30",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS694",
            "verified": True
        },
        {
            "id": "IS_7098_1_1988",
            "standard_number": "IS 7098 (Part 1): 1988",
            "title": "Crosslinked Polyethylene Insulated PVC Sheathed Cables - Part 1: For Working Voltages up to and Including 1100 V",
            "domain": "cables",
            "category": "Power Cables",
            "scope_summary": "Specifies requirements for armored and unarmored XLPE insulated power cables up to 1.1 kV.",
            "status": "CURRENT",
            "publication_year": 1988,
            "revision_date": "2019-10-15",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS7098-1",
            "verified": True
        },

        # Domain 7: Test Methods & Safety Core Standards
        {
            "id": "IS_16106_2012",
            "standard_number": "IS 16106: 2012",
            "title": "Method of Electrical and Photometric Measurements of Solid-State Lighting (LED) Products",
            "domain": "testing",
            "category": "Photometric Testing",
            "scope_summary": "Specifies test procedures for measuring electrical power, luminous flux, correlated color temperature (CCT), and color rendering index (CRI) of LED products.",
            "status": "CURRENT",
            "publication_year": 2012,
            "revision_date": "2020-08-10",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS16106",
            "verified": True
        },
        {
            "id": "IS_16108_2012",
            "standard_number": "IS 16108: 2012",
            "title": "Photobiological Safety of Lamps and Lamp Systems",
            "domain": "safety",
            "category": "Optical Safety",
            "scope_summary": "Gives guidance for evaluating the photobiological safety of lamps and lamp systems including luminaires (blue light hazard, UV hazard).",
            "status": "CURRENT",
            "publication_year": 2012,
            "revision_date": "2021-01-05",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS16108",
            "verified": True
        },

        # Domain 8: Superseded/Historical Standard for Testing Gap Audits
        {
            "id": "IS_10322_5_1_1985",
            "standard_number": "IS 10322 (Part 5/Sec 1): 1985",
            "title": "Luminaires - Particular Requirements - Fixed General Purpose Luminaires (Superseeded Edition)",
            "domain": "lighting",
            "category": "Luminaires",
            "scope_summary": "Old edition of fixed general purpose luminaires standard. Superseded by 2012 edition.",
            "status": "SUPERSEDED",
            "publication_year": 1985,
            "revision_date": "2012-01-01",
            "source_url": "https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/IS10322-1985",
            "verified": True
        }
    ]

    for std_dict in standards_data:
        std = Standard(**std_dict)
        db.add(std)
    db.commit()

    # 2. Add Standard Versions & Amendment Histories
    versions_data = [
        {"standard_id": "IS_10322_5_1_2012", "edition": "Edition 2.0", "publication_year": 2012, "status": "CURRENT", "scope_changes": "Incorporated LED safety specifications and thermal limits.", "amendments_count": 2},
        {"standard_id": "IS_10322_5_1_2012", "edition": "Edition 1.0", "publication_year": 1985, "status": "SUPERSEDED", "scope_changes": "Original fluorescent/incandescent fixture standard.", "amendments_count": 4},
        {"standard_id": "IS_16102_1_2012", "edition": "Edition 1.0", "publication_year": 2012, "status": "CURRENT", "scope_changes": "First edition covering self-ballasted LED safety.", "amendments_count": 3},
        {"standard_id": "IS_4151_2015", "edition": "Edition 4.0", "publication_year": 2015, "status": "CURRENT", "scope_changes": "Enhanced chin strap tension test and visor optical purity rules.", "amendments_count": 2},
    ]
    for v in versions_data:
        db.add(StandardVersion(**v))

    amendments_data = [
        {"standard_id": "IS_10322_5_1_2012", "amendment_number": 1, "issue_date": "2016-05-10", "summary_of_changes": "Revised clause 5.6 regarding IP rating insulation resistance tests.", "affected_clauses": ["5.6", "5.8.1"]},
        {"standard_id": "IS_10322_5_1_2012", "amendment_number": 2, "issue_date": "2020-11-25", "summary_of_changes": "Mandated surge protection class II requirements for outdoor drivers.", "affected_clauses": ["12.2"]},
        {"standard_id": "IS_16102_1_2012", "amendment_number": 1, "issue_date": "2017-08-12", "summary_of_changes": "Updated flame retardance test limits for thermoplastic caps.", "affected_clauses": ["7.2"]},
    ]
    for a in amendments_data:
        db.add(StandardAmendment(**a))

    # 3. Add Relationships (Normative, Test Methods, Safety, Allied)
    relationships_data = [
        # LED Streetlights -> Normative / Test / Safety
        {"source_standard_id": "IS_10322_5_3_2012", "target_standard_id": "IS_15885_2_13_2012", "relationship_type": "NORMATIVE_REFERENCE", "evidence_text": "Clause 3.1: Controlgear for LED modules shall comply with IS 15885 (Part 2/Sec 13).", "source_clause": "3.1"},
        {"source_standard_id": "IS_10322_5_3_2012", "target_standard_id": "IS_16103_1_2012", "relationship_type": "NORMATIVE_REFERENCE", "evidence_text": "Clause 4.2: LED modules installed within luminaires shall conform to IS 16103 (Part 1).", "source_clause": "4.2"},
        {"source_standard_id": "IS_10322_5_3_2012", "target_standard_id": "IS_16106_2012", "relationship_type": "TEST_METHOD", "evidence_text": "Clause 9.1: Photometric measurements and light output output ratio shall be tested per IS 16106.", "source_clause": "9.1"},
        {"source_standard_id": "IS_10322_5_3_2012", "target_standard_id": "IS_16108_2012", "relationship_type": "SAFETY_STANDARD", "evidence_text": "Clause 11.4: Blue light hazard evaluation shall be conducted in accordance with IS 16108.", "source_clause": "11.4"},
        {"source_standard_id": "IS_10322_5_3_2012", "target_standard_id": "IS_10322_5_1_2012", "relationship_type": "ALLIED_STANDARD", "evidence_text": "General requirements applicable to fixed luminaires.", "source_clause": "1.2"},
        
        # Self Ballasted LED -> Driver & Test
        {"source_standard_id": "IS_16102_1_2012", "target_standard_id": "IS_16102_2_2012", "relationship_type": "ALLIED_STANDARD", "evidence_text": "Safety & performance paired standards for self ballasted lamps.", "source_clause": "Scope"},
        {"source_standard_id": "IS_16102_1_2012", "target_standard_id": "IS_16106_2012", "relationship_type": "TEST_METHOD", "evidence_text": "Photometric testing for LED lumen maintenance.", "source_clause": "8.3"},

        # Construction Steel -> Concrete Code
        {"source_standard_id": "IS_1786_2008", "target_standard_id": "IS_456_2000", "relationship_type": "NORMATIVE_REFERENCE", "evidence_text": "Structural usage design requirements.", "source_clause": "5.1"},
        
        # Office Ergonomic Chair -> Metal Chair
        {"source_standard_id": "IS_17631_2022", "target_standard_id": "IS_3499_2017", "relationship_type": "ALLIED_STANDARD", "evidence_text": "Metal framework strength requirements for work chairs.", "source_clause": "4.1"}
    ]
    for r in relationships_data:
        db.add(StandardRelationship(**r))

    # 4. Add Quality Control Orders (QCOs) - Mandatory Certification Data
    qcos_data = [
        {
            "id": "QCO_LED_LIGHTS_2014",
            "title": "Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order - LED Lights",
            "ministry": "Ministry of Electronics and Information Technology (MeitY)",
            "order_number": "S.O. 2905(E)",
            "effective_date": "2014-09-13",
            "hs_codes": ["940510", "940540"],
            "target_standard_ids": ["IS_16102_1_2012", "IS_15885_2_13_2012", "IS_10322_5_3_2012"],
            "mandatory_certification_type": "BIS Compulsory Registration Scheme (CRS)",
            "source_url": "https://www.meity.gov.in/writereaddata/files/Compulsory_Registration_Order.pdf",
            "verified": True
        },
        {
            "id": "QCO_HELMETS_2021",
            "title": "Protective Helmets for Two-Wheeler Motorcyclists (Quality Control) Order, 2020",
            "ministry": "Ministry of Road Transport and Highways (MoRTH)",
            "order_number": "S.O. 4242(E)",
            "effective_date": "2021-06-01",
            "hs_codes": ["650610"],
            "target_standard_ids": ["IS_4151_2015", "IS_2925_1984"],
            "mandatory_certification_type": "BIS Scheme-I (ISI Mark)",
            "source_url": "https://morth.nic.in/sites/default/files/QCO_Helmets.pdf",
            "verified": True
        },
        {
            "id": "QCO_STEEL_BARS_2012",
            "title": "Steel and Steel Products (Quality Control) Order, 2012",
            "ministry": "Ministry of Steel",
            "order_number": "S.O. 412(E)",
            "effective_date": "2012-03-15",
            "hs_codes": ["721420"],
            "target_standard_ids": ["IS_1786_2008"],
            "mandatory_certification_type": "BIS Scheme-I (ISI Mark)",
            "source_url": "https://steel.gov.in/qco-orders",
            "verified": True
        }
    ]
    for q in qcos_data:
        db.add(QCO(**q))

    db.commit()
    print("✅ Database successfully seeded with 18+ standards, QCOs, version lineages, and relationship graph edges.")
    db.close()

if __name__ == "__main__":
    seed_database()
