#!/usr/bin/env python3
import sys
import os
import argparse

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.core.database import SessionLocal, Base, engine
from app.services.ingestion.xlsx_ingestion import process_xlsx_ingestion

def main():
    parser = argparse.ArgumentParser(description="MANAK BIS Standards Ingestion CLI")
    parser.add_argument("xlsx_file", help="Path to input .xlsx file")
    parser.add_argument("--dry-run", action="store_true", help="Inspect and validate without committing to DB")
    parser.add_argument("--validate-only", action="store_true", help="Validate column structure and exit")
    parser.add_argument("--rebuild-index", action="store_true", help="Rebuild FAISS vector and BM25 lexical indices after ingestion")
    parser.add_argument("--rebuild-graph", action="store_true", help="Rebuild graph relationship edges after ingestion")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.xlsx_file):
        print(f"❌ Error: File not found at {args.xlsx_file}")
        sys.exit(1)

    print(f"\n==========================================")
    print(f"📦 MANAK DATA INGESTION ENGINE")
    print(f"==========================================")
    print(f"File: {args.xlsx_file}")
    
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        report = process_xlsx_ingestion(args.xlsx_file, db)
        print(f"\n✅ INGESTION COMPLETED SUCCESSFULLY!")
        print(f"------------------------------------------")
        print(f"Sheets Discovered:  {report['sheets_discovered']}")
        print(f"Sheets Used:        {report['sheets_used']}")
        print(f"Total Rows Scanned: {report['records_count']}")
        print(f"Valid Records:      {report['valid_count']}")
        print(f"Inserted Standards: {report['inserted_count']}")
        print(f"Updated Standards:  {report['updated_count']}")
        print(f"Skipped Rows:       {report['skipped_count']}")
        print(f"Failed Rows:        {report['failed_count']}")
        print(f"Dataset Version:    {report['dataset_version']}")
        print(f"Ingestion Run ID:   {report['ingestion_run_id']}")
        print(f"==========================================\n")
        
    except Exception as e:
        print(f"\n❌ Ingestion Failed: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
