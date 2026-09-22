# DECISIONS.md — Architectural Decision Log

## ADR-001: Graph-Enhanced Neuro-Symbolic Hybrid RAG vs HMM
- **Context**: The problem requires mapping unstructured procurement requirements to primary, allied, test-method, safety, installation, and material standards while tracking lifecycle states and mandatory certification orders (QCOs).
- **Decision**: Use a hybrid neuro-symbolic retrieval architecture combining BM25 lexical search, dense vector embeddings (pgvector), cross-encoder re-ranking, and a graph relationship traversal layer (Neo4j / NetworkX graph engine) instead of a Hidden Markov Model (HMM).
- **Rationale**: Standard relationships (normative refs, test methods, QCOs) are topological network graphs rather than sequential state transitions. Graph queries offer $O(1)$ relationship lookups and multi-hop expansion.

## ADR-002: Deterministic Regulatory Rule Engine
- **Context**: Mandatory Certification Orders (QCOs) carry legal weight for procurement officers. LLMs are susceptible to hallucinations on dates and mandatory statuses.
- **Decision**: Regulatory compliance state is computed exclusively by Python rule engine logic (`backend/app/services/regulatory/`). The LLM is strictly confined to generating natural language summaries of verified rule engine outputs.
- **Rationale**: Ensures non-negotiable compliance accuracy and zero hallucination of legal requirements.

## ADR-003: Graceful AI Fallback Mode
- **Context**: Production procurement applications must remain functional during LLM API outages or in air-gapped environments without Gemini API keys.
- **Decision**: All requirement extraction, applicability scoring, graph expansion, and gap auditing services feature dual execution paths: Gemini-assisted and Rule-based Fallback.
- **Rationale**: Guarantees 100% operational uptime without hard external API dependencies.

## ADR-004: Evidence Provenance & Data Governance
- **Context**: Procurement audits require strict evidence trails for why a standard or requirement was chosen.
- **Decision**: Every standard, relationship, and recommendation score stores source URLs, publication timestamps, verification flags (`VERIFIED` vs `DEMO`), and exact text span mappings.
