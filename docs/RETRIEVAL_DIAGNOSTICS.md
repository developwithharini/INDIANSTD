# MANAK Retrieval Diagnostics & Trace Architecture

## Overview

Priority 4 introduces a surgical, non-intrusive observability layer for the MANAK recommendation engine. It instruments the entire retrieval pipeline—from requirement extraction to final decision—to enable development-only diagnostic tracing.

> **Zero Production Regression**: Diagnostic collection operates in-flight during single-pass analysis without re-running models or altering ranking, scoring, or recommendation decisions.

---

## 8 Major Pipeline Stages Instrumented

1. **REQUIREMENT EXTRACTION**: Captures normalized product term, category, domain, application, environment, materials, performance attributes, and explicit standard mentions.
2. **BM25 RETRIEVAL**: Captures top 30 lexical candidates, raw BM25 scores, matched fields, and exact IS number match overrides.
3. **BGE-M3 DENSE RETRIEVAL**: Captures top 30 dense vector candidates, vector similarities, model version (`BAAI/bge-m3`), and embedding mode.
4. **HYBRID FUSION (RRF)**: Captures candidate union pool, individual BM25 vs Dense ranks, and retrieval provenance (`[BM25]`, `[DENSE]`, `[HYBRID]`, `[EXACT_IS_MATCH]`).
5. **BGE RERANKER**: Captures pre-rerank rank vs post-rerank rank, reranker score, rank movements (`+N` / `-N`), and model metadata (`BAAI/bge-reranker-v2-m3`).
6. **APPLICABILITY ENGINE**: Captures sub-score breakdowns (Semantic, Lexical, Product Match, Scope Match, Attribute Match, Version Validity), raw composite score, and calibrated score.
7. **DECISION & ABSTENTION**: Captures decision state (`STRONGLY_SUPPORTED`, `POSSIBLE_MATCH_REVIEW_REQUIRED`, `NO_SUFFICIENT_MATCH`), top/2nd score margin, abstention reasons, and heuristic diagnostic flags.
8. **STAGE TIMING**: Measures execution latency per stage in milliseconds (`extraction_ms`, `bm25_ms`, `dense_ms`, `fusion_ms`, `reranker_ms`, `applicability_ms`, `decision_ms`, `total_ms`).

---

## Benchmark Query Root-Cause Analyses

### 1. Query: `gymnastic landing mat`
* **Decision State**: `NO_SUFFICIENT_MATCH` (Abstained)
* **Primary Suspected Failure Stage**: `NO_CORPUS_MATCH`
* **Top Candidate**: `IS 19597:2026` (Score: `42.7/100`)
* **Root Cause**: The BIS corpus contains `IS 19597:2026: Landing Mats used in Gymnastics`, but the calibrated score is 42.7 (<45 threshold). Lexical score is 66.1, but semantic similarity is low (24.4) due to sparse scope text in the baseline corpus snapshot.
* **Diagnostic Flag**: Correctly abstains from recommending low-confidence results.

### 2. Query: `ergonomic executive work chair with lumbar support`
* **Decision State**: `POSSIBLE_MATCH_REVIEW_REQUIRED`
* **Primary Suspected Failure Stage**: `NO_FAILURE_OBSERVED`
* **Top Candidate**: `IS 17631: 2022: Work Chairs - Performance, Safety and Test Requirements` (Score: `65.6/100`)
* **Root Cause**: Product match and lexical relevance are 100%, but scope match is low because ISO/BIS scope descriptions focus on test methods rather than specific feature lists like "lumbar support".
* **Recommendation**: Correctly surfaced as Rank 1 match, flagged for expert review due to score range 45–84.

### 3. Query: `industrial safety helmet with chin strap`
* **Decision State**: `POSSIBLE_MATCH_REVIEW_REQUIRED`
* **Primary Suspected Failure Stage**: `NO_FAILURE_OBSERVED`
* **Top Candidate**: `IS 2925: 1984: Specification for Industrial Safety Helmets` (Score: `67.0/100`)
* **Root Cause**: Exact match for industrial safety helmets. Reranker correctly prioritized `IS 2925` over two-wheeler helmets (`IS 4151`).

### 4. Query: `IS 10322`
* **Decision State**: `STRONGLY_SUPPORTED`
* **Primary Suspected Failure Stage**: `NO_FAILURE_OBSERVED`
* **Top Candidate**: `IS 10322 (Part 5/Sec 1): 2012` (Score: `100.0/100`)
* **Root Cause**: Exact IS-number override triggered in `hybrid.py`, elevating exact match to 100.0 score across BM25, Dense, and Reranker stages.

---

## Developer Usage & API Reference

### Feature Flag Configuration
In `backend/app/core/config.py` or `.env`:
```env
DEBUG_RETRIEVAL_TRACE=true
```

### Trace Retrieval Endpoint
```http
GET /api/v1/analyses/{analysis_id}/trace?debug=true
```

### System Diagnostic Status Endpoint
```http
GET /api/v1/diagnostics/status
```

### Frontend UI Access
Click the **🔬 Retrieval Trace** button on any recommendation result screen or navigate with `?debug=true`. Trace JSON can be exported via `[Export Trace JSON]`.
