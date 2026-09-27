from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.domain import Standard
from app.services.retrieval.bm25 import bm25_retriever
from app.services.retrieval.dense import dense_search

def get_hybrid_candidates(query: str, db: Session, top_k_lexical: int = 30, top_k_dense: int = 30, return_details: bool = False):
    """
    Generate candidate pool by combining Lexical Top 30 + Dense Top 30 results.
    Includes exact IS-number matching override if query mentions an IS number.
    If return_details=True, returns (candidates, bm25_raw_list, dense_raw_list) for diagnostics.
    """
    import re
    candidate_map: Dict[str, Dict[str, Any]] = {}
    bm25_raw_list: List[Dict[str, Any]] = []
    dense_raw_list: List[Dict[str, Any]] = []

    # Exact IS Number Override Detection (e.g. "IS 10322", "IS 9748")
    is_match = re.search(r'\bIS\s*(\d+)\b', query, re.IGNORECASE)
    if is_match:
        is_num = f"IS {is_match.group(1)}"
        exact_stds = db.query(Standard).filter(Standard.standard_number.like(f"%{is_num}%")).all()
        for std in exact_stds:
            candidate_map[std.id] = {
                "id": std.id,
                "standard_number": std.standard_number,
                "title": std.title,
                "scope": std.scope,
                "category": std.category,
                "domain": std.domain,
                "status": std.status,
                "source_file": getattr(std, "source_file", None) or "standards.xlsx",
                "source_sheet": getattr(std, "source_sheet", None) or "Standards",
                "source_row": getattr(std, "source_row", None),
                "object": None,
                "lexical_score": 100.0,
                "dense_score": 1.0,
                "retrieval_method": "EXACT_IS_MATCH"
            }

    lexical_results = bm25_retriever.search(query, top_k=top_k_lexical, db=db)
    dense_results = dense_search(query, top_k=top_k_dense, db=db)

    # Add Lexical Candidates
    for doc, lex_score in lexical_results:
        std_id = doc["id"]
        bm25_raw_list.append({
            "id": std_id,
            "standard_number": doc["standard_number"],
            "title": doc["title"],
            "lexical_score": lex_score
        })
        if std_id in candidate_map:
            candidate_map[std_id]["lexical_score"] = max(candidate_map[std_id]["lexical_score"], lex_score)
        else:
            candidate_map[std_id] = {
                "id": std_id,
                "standard_number": doc["standard_number"],
                "title": doc["title"],
                "scope": doc["scope"],
                "category": doc["category"],
                "domain": doc["domain"],
                "status": doc["status"],
                "source_file": doc.get("source_file") or "standards.xlsx",
                "source_sheet": doc.get("source_sheet") or "Standards",
                "source_row": doc.get("source_row"),
                "object": None,
                "lexical_score": lex_score,
                "dense_score": 0.0,
                "retrieval_method": "LEXICAL"
            }

    # Add Dense Candidates
    for doc, dense_score in dense_results:
        std_id = doc["id"]
        dense_raw_list.append({
            "id": std_id,
            "standard_number": doc["standard_number"],
            "title": doc["title"],
            "dense_score": dense_score
        })
        if std_id in candidate_map:
            candidate_map[std_id]["dense_score"] = max(candidate_map[std_id]["dense_score"], dense_score)
            if candidate_map[std_id]["retrieval_method"] == "LEXICAL":
                candidate_map[std_id]["retrieval_method"] = "HYBRID"
        else:
            candidate_map[std_id] = {
                "id": std_id,
                "standard_number": doc["standard_number"],
                "title": doc["title"],
                "scope": doc["scope"],
                "category": doc["category"],
                "domain": doc["domain"],
                "status": doc["status"],
                "source_file": doc.get("source_file") or "standards.xlsx",
                "source_sheet": doc.get("source_sheet") or "Standards",
                "source_row": doc.get("source_row"),
                "object": doc.get("object"),
                "lexical_score": 0.0,
                "dense_score": dense_score,
                "retrieval_method": "DENSE"
            }

    # Fallback to database query if candidate pool is empty
    if not candidate_map:
        standards = db.query(Standard).limit(10).all()
        for idx, std in enumerate(standards):
            std_id = std.id
            candidate_map[std_id] = {
                "id": std_id,
                "standard_number": std.standard_number,
                "title": std.title,
                "scope": std.scope,
                "category": std.category,
                "domain": std.domain,
                "status": std.status,
                "source_file": getattr(std, "source_file", None) or "standards.xlsx",
                "source_sheet": getattr(std, "source_sheet", None) or "Standards",
                "source_row": getattr(std, "source_row", None),
                "object": std,
                "lexical_score": 10.0,
                "dense_score": 0.5,
                "retrieval_method": "DATABASE_FALLBACK"
            }

    cands = list(candidate_map.values())
    if return_details:
        return cands, bm25_raw_list, dense_raw_list
    return cands
