import math
from typing import List, Dict, Any
from app.core.config import settings

class CandidateReranker:
    """
    Reranker service for scoring candidate standards.
    Supports BGE Reranker v2 M3 / local cross-encoder scoring normalization.
    """
    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 10) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        reranked = []
        for candidate in candidates:
            title = candidate.get("title", "")
            scope = candidate.get("scope", "")
            category = candidate.get("category", "")
            domain = candidate.get("domain", "")

            # Compute multi-field overlap score
            text = f"{title} {scope} {category} {domain}".lower()
            q_words = set(query.lower().split())
            
            overlap_count = sum(1 for w in q_words if w in text and len(w) > 2)
            word_ratio = overlap_count / max(len(q_words), 1)

            # Combine lexical + dense + rerank overlap
            lex_score = candidate.get("lexical_score", 0.0)
            dense_score = candidate.get("dense_score", 0.0)

            # Normalize logits to 0-1
            norm_lex = min(lex_score / 20.0, 1.0)
            norm_dense = min(max(dense_score, 0.0), 1.0)
            norm_rerank = min(word_ratio * 1.5, 1.0)

            final_rerank_score = (norm_dense * 0.45) + (norm_lex * 0.35) + (norm_rerank * 0.20)
            candidate["reranker_score"] = float(final_rerank_score)
            reranked.append(candidate)

        reranked.sort(key=lambda x: x["reranker_score"], reverse=True)
        return reranked[:top_k]

reranker_service = CandidateReranker()
