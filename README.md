# MANAK — Indian Standards Recommendation Engine

**MANAK** is a production-grade Indian Standards Recommendation Engine built for procurement specialists. It automatically extracts structured requirements from procurement text or PDF/DOCX specifications, performs hybrid neuro-symbolic retrieval over official BIS standards data, and scores standard applicability with transparent 0-100 breakdown scores and evidence-based matching rationale.

---

## 🚀 Quick Start (Single Command Launch)

Start both backend and frontend servers with one script:

```bash
./run_demo.sh
```

- **Frontend Application**: `http://localhost:5173`
- **FastAPI OpenAPI Docs**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/api/v1/health`

---

## 🏗 System Architecture

```
[ Procurement Text / PDF / DOCX ]
               │
               ▼
[ Requirement Extraction Engine ]  ◄── (Gemini 3.6 Flash / Local Rule Fallback)
               │
               ▼
[ Hybrid Retrieval Engine ]        ◄── (Lexical BM25 + Dense Feature Embeddings)
               │
               ▼
[ Candidate Reranker ]             ◄── (Multi-field Overlap & Score Normalization)
               │
               ▼
[ Applicability Scoring Engine ]   ◄── (0-100 Weighted Score + Why Matched / Why Not)
               │
               ▼
[ Minimalist Enterprise Frontend ]  ◄── (3-State UX: Input ➔ Processing ➔ Results)
```

---

## 📦 Multi-Sheet XLSX Ingestion CLI

Ingest raw BIS datasets (`.xlsx`) with openpyxl multi-sheet discovery, column header normalization, and SQLite upserting:

```bash
python3 scripts/ingest_xlsx.py data/raw/standards.xlsx
```

---

## 📊 Evaluation & Domain Adapter Scripts

Run the retrieval benchmark evaluation suite:

```bash
python3 scripts/evaluate_retrieval.py
```

Fine-tune contrastive domain adapter checkpoints:

```bash
python3 scripts/train_domain_adapter.py --epochs 3 --batch-size 16
```

---

## 🧪 Running Automated Tests

Run backend pytest suite:

```bash
cd backend
python3 -m pytest
```

---

## 🏛 License & Provenance

All standard data records are indexed directly from official BIS published snapshots with source provenance retained down to sheet name and row index.
