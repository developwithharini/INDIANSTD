import os
import re
import math
import logging
import openpyxl
from typing import Dict, List, Any, Tuple
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.models.domain import (
    Standard, StandardVersion, StandardAmendment,
    StandardRelationship, QCO
)

logger = logging.getLogger("manak.ingest_excel")

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

def sanitize_id(std_num: str) -> str:
    """Normalize standard number into a valid database primary key string."""
    clean = re.sub(r'[^a-zA-Z0-9]', '_', std_num)
    clean = re.sub(r'_+', '_', clean).strip('_')
    return clean.upper()

def infer_domain(department: str, title: str) -> Tuple[str, str]:
    """
    Infer domain and category from department name and title.
    """
    dept_lower = (department or "").lower()
    title_lower = (title or "").lower()

    if "electrical" in dept_lower or "lighting" in title_lower or "led" in title_lower or "luminaire" in title_lower or "cable" in title_lower:
        domain = "electrical"
        if "led" in title_lower:
            category = "LED Lighting"
        elif "luminaire" in title_lower:
            category = "Luminaires"
        elif "cable" in title_lower or "wire" in title_lower:
            category = "Cables & Wiring"
        else:
            category = "Electrical Equipment"
    elif "civil" in dept_lower or "construction" in title_lower or "steel" in title_lower or "cement" in title_lower or "concrete" in title_lower or "rebar" in title_lower:
        domain = "construction"
        if "steel" in title_lower or "rebar" in title_lower:
            category = "Steel Reinforcement"
        elif "cement" in title_lower:
            category = "Cement"
        elif "concrete" in title_lower:
            category = "Concrete Practice"
        else:
            category = "Construction Materials"
    elif "textile" in dept_lower or "helmet" in title_lower or "ppe" in title_lower or "footwear" in title_lower or "mask" in title_lower or "safety" in title_lower:
        domain = "ppe"
        if "helmet" in title_lower:
            category = "Safety Helmets"
        elif "footwear" in title_lower or "shoe" in title_lower:
            category = "Safety Footwear"
        else:
            category = "Personal Protective Equipment"
    elif "mechanical" in dept_lower or "fastener" in title_lower or "pin" in title_lower or "bearing" in title_lower or "valve" in title_lower or "cylinder" in title_lower:
        domain = "mechanical"
        if "fastener" in title_lower or "pin" in title_lower:
            category = "Fasteners & Pins"
        elif "cylinder" in title_lower or "hydraulic" in title_lower:
            category = "Hydraulic & Pneumatic"
        else:
            category = "Mechanical Components"
    else:
        domain = "general_engineering"
        if "specification" in title_lower:
            category = "Product Specifications"
        elif "test" in title_lower or "calibration" in title_lower:
            category = "Testing & Metrology"
        else:
            category = "General Engineering Standards"

    return domain, category

def validate_xlsx_file(filepath: str) -> openpyxl.Workbook:
    """Stage 1: Validate XLSX file existence and format."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Excel file not found at: {filepath}")
    
    logger.info(f"🔍 [1. Validate] Loading workbook: {filepath}")
    wb = openpyxl.load_workbook(filepath, data_only=True)
    if not wb.sheetnames:
        raise ValueError("Provided Excel file contains no worksheets.")
    return wb

def normalize_record(row_data: Tuple, default_dept: str = "General Engineering") -> Dict[str, Any]:
    """Stage 2: Normalize row data into standard domain object structure."""
    # Rows format: (Sl#, Standard Number, Date of Publish, Title, Type of Standard, Degree of Equivalence)
    sl_no = row_data[0]
    std_number_raw = str(row_data[1]).strip() if row_data[1] else ""
    date_pub = str(row_data[2]).strip() if row_data[2] else ""
    title_raw = str(row_data[3]).strip() if row_data[3] else ""
    type_std_raw = str(row_data[4]).strip() if row_data[4] else "Product Specification"
    equiv_raw = str(row_data[5]).strip() if len(row_data) > 5 and row_data[5] else ""

    if not std_number_raw or std_number_raw == "None" or std_number_raw == "Standard Number":
        return None

    std_id = sanitize_id(std_number_raw)

    # Extract publication year
    pub_year = 2026
    year_match = re.search(r'(\d{4})', date_pub) or re.search(r':(\d{4})', std_number_raw)
    if year_match:
        try:
            pub_year = int(year_match.group(1))
        except ValueError:
            pub_year = 2026

    domain, category = infer_domain(default_dept, title_raw)

    scope_summary = f"Official BIS Standard {std_number_raw}: {title_raw}. Type: {type_std_raw}. Equivalence: {equiv_raw or 'Indigenous'}."

    return {
        "id": std_id,
        "standard_number": std_number_raw,
        "title": title_raw,
        "domain": domain,
        "category": category,
        "scope_summary": scope_summary,
        "status": "CURRENT",
        "publication_year": pub_year,
        "revision_date": date_pub,
        "type_of_standard": type_std_raw,
        "degree_of_equivalence": equiv_raw,
        "source_url": f"https://www.services.bis.gov.in/php/BIS_2.0/bisportal/standard_details/{std_id}",
        "verified": True
    }

def process_xlsx_ingestion(filepath: str) -> Dict[str, Any]:
    """
    Executes the full 8-stage ingestion pipeline:
    1. Validate
    2. Normalize
    3. Deduplicate / Upsert
    4. Database
    5. Generate embeddings
    6. Update vector index
    7. Update lexical index
    8. Update graph relationships
    """
    logger.info(f"🚀 Starting 8-Stage BIS Standards Ingestion Pipeline for: {filepath}")

    # STAGE 1: Validate
    wb = validate_xlsx_file(filepath)
    sheet = wb.active
    rows = list(sheet.iter_rows(values_only=True))

    dept_name = "Production And General Engineering Department"
    if rows and len(rows[0]) > 2 and rows[0][2]:
        dept_name = str(rows[0][2])

    logger.info(f"📌 Department Identified: {dept_name}")
    logger.info(f"📊 Total Rows to Process: {len(rows) - 2}")

    # STAGE 2 & 3: Normalize & Deduplicate
    valid_records = {}
    for i, row in enumerate(rows[2:], start=3):
        rec = normalize_record(row, default_dept=dept_name)
        if rec and rec["id"]:
            # Deduplicate by standard ID (upsert latest)
            valid_records[rec["id"]] = rec

    logger.info(f"✅ [2. Normalize & 3. Deduplicate] {len(valid_records)} unique standards ready for database ingestion.")

    # STAGE 4: Database Insertion & Upsert
    db: Session = SessionLocal()
    inserted_count = 0
    updated_count = 0

    try:
        existing_ids = set(r[0] for r in db.query(Standard.id).all())

        for std_id, rec in valid_records.items():
            if std_id in existing_ids:
                # Update existing record
                std_obj = db.query(Standard).filter(Standard.id == std_id).first()
                if std_obj:
                    std_obj.title = rec["title"]
                    std_obj.scope_summary = rec["scope_summary"]
                    std_obj.domain = rec["domain"]
                    std_obj.category = rec["category"]
                    std_obj.publication_year = rec["publication_year"]
                    std_obj.revision_date = rec["revision_date"]
                    updated_count += 1
            else:
                # Insert new standard record
                std_obj = Standard(
                    id=rec["id"],
                    standard_number=rec["standard_number"],
                    title=rec["title"],
                    domain=rec["domain"],
                    category=rec["category"],
                    scope_summary=rec["scope_summary"],
                    status=rec["status"],
                    publication_year=rec["publication_year"],
                    revision_date=rec["revision_date"],
                    source_url=rec["source_url"],
                    verified=rec["verified"]
                )
                db.add(std_obj)
                
                # Add default current version
                ver = StandardVersion(
                    standard_id=rec["id"],
                    edition="Latest Published Edition",
                    publication_year=rec["publication_year"],
                    status="CURRENT",
                    scope_changes=rec["scope_summary"],
                    amendments_count=0
                )
                db.add(ver)
                inserted_count += 1

        db.commit()
        logger.info(f"💾 [4. Database] Upsert complete! Inserted: {inserted_count}, Updated: {updated_count}")

        # STAGE 5 & 6: Generate Embeddings & Update Vector Index
        logger.info("🧠 [5. Embeddings & 6. Vector Index] Rebuilding vector search representations...")
        from app.services.retrieval.hybrid import build_lexical_index, index_standards_in_vector_store
        
        all_standards = db.query(Standard).all()
        index_standards_in_vector_store(all_standards)

        # STAGE 7: Update Lexical Index
        logger.info("⚡ [7. Lexical Index] Rebuilding BM25 lexical token index...")
        build_lexical_index(all_standards)

        # STAGE 8: Update Graph Relationships
        logger.info("🕸️ [8. Graph Relationships] Synthesizing graph relationship edges (Test methods & Safety links)...")
        test_standards = [s for s in all_standards if "test" in (s.title or "").lower() or "method" in (s.title or "").lower()]
        spec_standards = [s for s in all_standards if "specification" in (s.title or "").lower()]

        new_relationships = 0
        existing_edges = set((r.source_standard_id, r.target_standard_id) for r in db.query(StandardRelationship).all())

        # Auto-link test methods to product specifications in the same category
        for spec in spec_standards[:100]:  # Link top specs to relevant test methods
            for test in test_standards:
                if test.category == spec.category and test.id != spec.id:
                    edge_key = (spec.id, test.id)
                    if edge_key not in existing_edges:
                        rel = StandardRelationship(
                            source_standard_id=spec.id,
                            target_standard_id=test.id,
                            relationship_type="TEST_METHOD",
                            evidence_text=f"Normative test method requirement per {test.standard_number}",
                            source_clause="Normative Test Section"
                        )
                        db.add(rel)
                        existing_edges.add(edge_key)
                        new_relationships += 1

        db.commit()
        logger.info(f"🌐 [8. Graph Relationships] Added {new_relationships} new graph relationship edges.")

        total_standards = db.query(Standard).count()
        total_qcos = db.query(QCO).count()
        total_rels = db.query(StandardRelationship).count()

        return {
            "status": "SUCCESS",
            "message": f"Successfully ingested {len(valid_records)} records from {os.path.basename(filepath)}.",
            "pipeline_summary": {
                "file_processed": os.path.basename(filepath),
                "department": dept_name,
                "raw_rows": len(rows) - 2,
                "valid_records": len(valid_records),
                "inserted": inserted_count,
                "updated": updated_count,
                "total_standards_in_db": total_standards,
                "total_qcos_in_db": total_qcos,
                "graph_edges_count": total_rels,
                "vector_embeddings_generated": len(all_standards),
                "lexical_bm25_indexed": len(all_standards)
            }
        }
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error during XLSX ingestion pipeline: {str(e)}", exc_info=True)
        raise e
    finally:
        db.close()
