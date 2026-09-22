# MANAK / ISCOPE — Standards Intelligence & Procurement Workspace

**SIH26108 Master Prompt Solution**  
*Department of Consumer Affairs | Ministry of Consumer Affairs, Food & Public Distribution*

---

## 🏛️ Executive Summary

**MANAK** (Standards Intelligence & Procurement Workspace) is an enterprise-grade procurement intelligence platform designed for procurement officers, technical specification engineers, compliance officers, and auditors. 

It converts natural-language procurement requirements and unstructured tender documents into:
1. **Traceable Requirement Models** with extracted constraints & parameters.
2. **Hybrid Multi-Vector Retrieval Maps** powered by BM25 + dense multilingual embeddings + cross-encoder re-ranking.
3. **Interactive Standards Relationship Graphs** detailing normative, test-method, safety, installation, and material dependencies.
4. **Deterministic Regulatory & QCO Compliance** checks backed by Python rule engines with evidence links.
5. **Temporal & Version Intelligence** tracking current vs superseded editions and amendment lineages.
6. **Automated Tender Specification Audits** highlighting missing standards, outdated references, ambiguous parameters, and testing gaps.
7. **Procurement-Ready Technical Specifications** ready for export (PDF/DOCX/JSON) with full audit trails.

---

## 🚀 Key Differentiators

- **Deterministic Regulatory Engine**: Zero LLM hallucination on mandatory BIS certification or Quality Control Orders (QCOs).
- **Graph-Enhanced Retrieval**: Traverses $N$-hop relationships (Primary → Normative → Test Method → Safety → Certification).
- **100% Deterministic Fallback**: Operates fully offline or without LLM API keys via rule-based vectorless fallbacks.
- **Specification Readiness Score**: Visual metric drilldowns across standard coverage, version currency, testing completeness, and regulatory alignment.
- **Why / Why-Not Explainability**: Transparent evidence breakdown for why standards were recommended or rejected.
- **No "AI Slop" Design**: Clean enterprise light theme built for serious technical work.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend** | FastAPI, Python 3.11, Pydantic v2, SQLAlchemy 2, Alembic, Pytest |
| **Databases** | PostgreSQL 16 + pgvector, Neo4j 5 Community, Redis 7 |
| **AI / ML** | Gemini 2.0 Flash, Multilingual Sentence Embeddings, Cross-Encoder Re-ranker |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui components, React Flow (Graph), Recharts |
| **DevOps** | Docker, Docker Compose, Structured JSON Logging |

---

## 💻 Quick Start Guide

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Environment Setup
```bash
cp .env.example .env
```

### 2. Launching with Docker Compose
```bash
docker compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend REST API Docs: `http://localhost:8000/docs`
- Neo4j Graph Browser: `http://localhost:7474`

### 3. Local Development (Alternative)

**Backend Setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

**Frontend Setup**:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Evaluation

```bash
# Backend unit & integration tests
cd backend && pytest

# Frontend component & page tests
cd frontend && npm test
```

---

## 📜 Regulatory Governance & Source Rules
- Official metadata is tagged `VERIFIED` with direct source URLs to official government portals.
- Synthetic/demonstration data is explicitly flagged `DEMO`.
- Mandatory certification is evaluated strictly by deterministic rules in `backend/app/services/regulatory/`.
