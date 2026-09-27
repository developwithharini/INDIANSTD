import sys
import os
import json

# Add backend root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ingest_excel import process_xlsx_ingestion

def main():
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
    else:
        filepath = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "published_standards.xlsx")

    print(f"📥 Starting XLSX Ingestion for file: {filepath}")
    result = process_xlsx_ingestion(filepath)
    print("\n🎉 INGESTION PIPELINE COMPLETE!")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
