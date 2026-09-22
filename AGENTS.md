# AGENTS.md — MANAK Standards Intelligence & Procurement Workspace

## Core Rules for AI Coding Agents

1. **Source of Truth & Evidence First**:
   - Never fabricate standard numbers, titles, QCOs, certifications, or version numbers.
   - If official metadata is unavailable, explicitly flag the record as `DEMO` or `UNVERIFIED`.
   - Never generate unsupported reasoning or fake source URLs.

2. **No "AI Slop" Design Rules**:
   - Enterprise light theme by default (warm white, near-black typography, deep navy primary `#1E3A8A`, subtle gray borders).
   - No generic purple/blue glowing gradients, floating blobs, robot illustrations, or excessive glassmorphism.
   - Do NOT put "AI POWERED" labels everywhere. Position the system as a Procurement Workspace.
   - Avoid typing animations, generic 3-card features, or decorative animations (>250ms).

3. **Deterministic Regulatory Engine**:
   - The LLM must NEVER decide mandatory certification or QCO status.
   - Regulatory status is determined by Python rule engine logic in `backend/app/services/regulatory/`.
   - The LLM may only provide natural-language explanations of deterministic regulatory outputs.

4. **Deterministic Fallback**:
   - The application MUST remain fully functional without a Gemini API key.
   - Always maintain rule-based fallback extraction, vector-free lexical matching, and local applicability scoring.

5. **Folder & Code Boundaries**:
   - Backend: `backend/app/` (FastAPI, SQLAlchemy models, service layers).
   - Frontend: `frontend/src/` (Next.js/React, components by feature domain).
   - Never put business logic inside page components or inline API handlers.

6. **Testing & Quality**:
   - Run `pytest` in `backend/` and `npm test` in `frontend/` before declaring work finished.
   - Ensure `GET /health` and `GET /metrics` return HTTP 200.
