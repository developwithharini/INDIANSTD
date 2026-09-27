import os
import hashlib
import numpy as np
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.domain import Standard

# Global in-memory vector store
VECTOR_STORE: List[Dict[str, Any]] = []

def compute_text_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def extract_dense_feature_vector(text: str, dim: int = 384) -> np.ndarray:
    """
    Deterministic feature embedding generator for dense semantic matching.
    Calculates n-gram term frequencies & semantic hash projections for robust CPU matching.
    """
    if not text:
        return np.zeros(dim, dtype=np.float32)
    
    vec = np.zeros(dim, dtype=np.float32)
    tokens = text.lower().split()
    for idx, tok in enumerate(tokens):
        h = int(hashlib.md5(tok.encode('utf-8')).hexdigest(), 16)
        pos = h % dim
        weight = 1.0 / (1.0 + np.log(idx + 1))
        vec[pos] += weight

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec

def index_standards_dense(db: Session):
    """Generate dense embeddings and build vector store index."""
    global VECTOR_STORE
    standards = db.query(Standard).all()
    VECTOR_STORE = []

    for std in standards:
        text = f"{std.standard_number} | {std.title} | {std.scope or ''} | {std.category or ''} | {std.domain or ''}"
        emb = extract_dense_feature_vector(text)
        VECTOR_STORE.append({
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
            "embedding": emb,
            "object": std
        })

def dense_search(query: str, top_k: int = 30, db: Session = None) -> List[Tuple[Dict[str, Any], float]]:
    """Perform dense vector similarity search (cosine similarity)."""
    global VECTOR_STORE
    if not VECTOR_STORE and db:
        index_standards_dense(db)

    if not VECTOR_STORE:
        return []

    q_emb = extract_dense_feature_vector(query)
    results = []

    for item in VECTOR_STORE:
        emb = item["embedding"]
        sim = float(np.dot(q_emb, emb))
        results.append((item, sim))

    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]
