# MANAK Evidence Provenance & Highlighting Specification

## 1. Overview
The MANAK Evidence Engine provides deterministic, source-verified evidence for standard recommendations. It ensures complete transparency by mapping every match rationale back to exact dataset provenance stored in the Bureau of Indian Standards (BIS) dataset (`standards.xlsx`).

---

## 2. Evidence Model & Schema
Every recommendation item includes an array of `EvidenceItem` objects (`RecommendationItem.evidence`):

```json
{
  "evidence_id": "ev_scope_IS_2925_1984",
  "standard_id": "IS_2925_1984",
  "reason_code": "SCOPE_MATCH",
  "source_type": "BIS_DATASET",
  "source_file": "standards.xlsx",
  "source_sheet": "Published Standards",
  "source_row": 147,
  "source_field": "scope",
  "source_page": null,
  "excerpt": "Specifies constructional and performance requirements for industrial safety helmets for head protection of workers against falling objects and electrical shock hazards in construction sites.",
  "matched_terms": [
    "industrial safety helmet",
    "head protection",
    "construction site"
  ],
  "requirement_signal": "industrial safety helmet for construction workers",
  "evidence_strength": "STRONG",
  "explanation": "Official BIS published scope text directly addresses application and operational specifications."
}
```

---

## 3. Source Precedence & Fallback Rules
Evidence items are generated according to strict data availability rules:

1. **Scope Text (`source_field: "scope"`)**: Extracted from official published BIS scope specifications.
2. **Product Title (`source_field: "title"`)**: Extracted from standard publication titles.
3. **Category & Domain (`source_field: "category"`)**: Extracted from technical committee domain classifications.
4. **Active Lifecycle (`source_field: "status"`)**: Extracted from official publication status.

If detailed source text is unavailable for a standard:
- **`evidence_strength`**: Set to `"UNAVAILABLE"`.
- **UI Fallback**: Displays `"Evidence unavailable in current BIS dataset snapshot."` without blank screens or fake citations.

---

## 4. Provenance Rules
- **Exact Row Tracking**: `source_row` reflects the exact 1-indexed row number from `standards.xlsx` (e.g. `Row 147` for IS 2925, `Row 1487` for IS 17631).
- **No Generic Defaults**: If row metadata is unavailable, the UI renders `UNAVAILABLE` rather than defaulting to `Row 1`.

---

## 5. Deterministic Highlighting & Security
- **Highlight Component**: Implemented in `<HighlightText text={excerpt} matchedTerms={matched_terms} />`.
- **Regex Boundary Matching**: Matches exact terms using `\b[term]\b` case-insensitively.
- **XSS Prevention**: Source text is strictly HTML-escaped before wrapping matched terms in safe JSX elements (`<mark className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1 rounded">`).
- **No Unsafe HTML**: Eliminates `dangerouslySetInnerHTML`.

---

## 6. Verification & Test Suite
- **Backend Tests (`backend/tests/test_evidence.py`)**:
  - Verifies distinct source rows across candidate standards (fails if all resolve to Row 1).
  - Verifies that `evidence.excerpt` is contained in stored source field.
  - Verifies that every term in `evidence.matched_terms` exists in `excerpt.lower()`.
- **Frontend Build**: Validated with `npm run build` with zero TypeScript errors.
