from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.domain import Standard

class VersionEngine:
    """
    Version intelligence scanner.
    Checks standard version status and generates warnings for outdated referenced standards.
    """
    def check_version_signals(self, mentioned_standards: List[str], db: Session) -> List[Dict[str, Any]]:
        signals = []
        for ms in mentioned_standards:
            # Check if mentioned standard exists in DB
            query_str = ms.strip().upper()
            stds = db.query(Standard).filter(Standard.standard_number.ilike(f"%{query_str}%")).all()
            
            for std in stds:
                if std.status == "SUPERSEDED":
                    signals.append({
                        "standard_id": std.id,
                        "referenced_standard": std.standard_number,
                        "status": "SUPERSEDED",
                        "severity": "WARNING",
                        "message": f"⚠ Referenced standard {std.standard_number} is SUPERSEDED in official registry.",
                        "current_recommendation": f"Verify latest active revision for {std.standard_number}"
                    })
                elif std.publication_year and std.publication_year < 2010:
                    signals.append({
                        "standard_id": std.id,
                        "referenced_standard": std.standard_number,
                        "status": "CURRENT",
                        "severity": "INFO",
                        "message": f"Referenced standard {std.standard_number} (Edition {std.publication_year}) is verified active.",
                        "current_recommendation": None
                    })
        return signals

version_engine = VersionEngine()
