import re
import math
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.domain import Standard

class BM25Retriever:
    """
    BM25 Lexical Retriever for Indian Standards.
    Prioritizes exact IS-number matches (e.g. 'IS 10322' -> IS 10322) with heavy weighting.
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: List[Dict[str, Any]] = []
        self.doc_len: List[int] = []
        self.avg_doc_len: float = 0.0
        self.doc_freqs: List[Dict[str, int]] = []
        self.idf: Dict[str, float] = {}
        self.is_indexed: bool = False

    def _tokenize(self, text: str) -> List[str]:
        if not text:
            return []
        # Extract IS numbers as special tokens
        tokens = re.findall(r'\b[A-Za-z0-9_]+\b', text.lower())
        return tokens

    def index_standards(self, db: Session):
        """Index all standards in database into BM25 token corpus."""
        standards = db.query(Standard).all()
        self.corpus = []
        self.doc_len = []
        self.doc_freqs = []

        total_len = 0
        df_counter: Dict[str, int] = {}

        for std in standards:
            # Combine IS number, title, scope, category, domain for indexing
            text = f"{std.standard_number} {std.title} {std.scope or ''} {std.category or ''} {std.domain or ''}"
            tokens = self._tokenize(text)
            
            # Boost IS number tokens
            is_tokens = self._tokenize(std.standard_number) * 3
            tokens.extend(is_tokens)

            freqs: Dict[str, int] = {}
            for tok in tokens:
                freqs[tok] = freqs.get(tok, 0) + 1

            self.corpus.append({
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
                "object": std
            })
            self.doc_len.append(len(tokens))
            self.doc_freqs.append(freqs)
            total_len += len(tokens)

            # Record document frequencies
            for tok in set(tokens):
                df_counter[tok] = df_counter.get(tok, 0) + 1

        num_docs = len(self.corpus)
        self.avg_doc_len = (total_len / num_docs) if num_docs > 0 else 1.0

        # Calculate IDF values
        self.idf = {}
        for tok, freq in df_counter.items():
            self.idf[tok] = math.log((num_docs - freq + 0.5) / (freq + 0.5) + 1.0)

        self.is_indexed = True

    def search(self, query: str, top_k: int = 30, db: Session = None) -> List[Tuple[Dict[str, Any], float]]:
        """Search BM25 index and return Top K candidates with lexical scores."""
        if not self.is_indexed and db:
            self.index_standards(db)

        if not self.corpus:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        # Check for explicit IS number in query e.g. "IS 10322" or "IS 4151"
        exact_is_match = re.search(r'\b(IS\s*\d+)\b', query, re.IGNORECASE)
        exact_is_clean = exact_is_match.group(1).upper().replace(" ", "") if exact_is_match else None

        scores = []
        num_docs = len(self.corpus)

        for idx, doc in enumerate(self.corpus):
            freqs = self.doc_freqs[idx]
            d_len = self.doc_len[idx]
            score = 0.0

            for tok in query_tokens:
                if tok in freqs:
                    tf = freqs[tok]
                    idf_val = self.idf.get(tok, 0.5)
                    denom = tf + self.k1 * (1 - self.b + self.b * (d_len / self.avg_doc_len))
                    score += idf_val * (tf * (self.k1 + 1)) / denom

            # Apply heavy exact IS-number boost
            if exact_is_clean and exact_is_clean in doc["standard_number"].upper().replace(" ", ""):
                score += 50.0 # Massive lexical boost for exact IS number

            scores.append((doc, float(score)))

        # Sort descending by score
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

bm25_retriever = BM25Retriever()
