# MANAK — Multilingual Architecture & Localization Guide

This document details the full-stack i18n localization architecture for MANAK across **English (`en`)**, **Hindi (`hi`)**, and **Tamil (`ta`)**.

---

## 1. Core Architectural Principles

1. **One-Click Instant Switching**:
   - UI language switches instantly via the Header dropdown without page reload or re-executing analysis queries.
   - User language preference is stored in `localStorage` (`manak_locale`) and defaults to `en`.

2. **Official Source Data Preservation (STRICT INVARIANCE)**:
   - Official BIS Standard Numbers (e.g. `IS 17631:2022`, `IS 10322`) are **never translated or mutated**.
   - Official Standard Titles, Scopes, and Source Excerpts remain in their original authoritative form.
   - Dataset Provenance metadata (`standards.xlsx`, Sheet `Standards`, Row numbers) remains unmutated.

3. **100% Translation Key Parity**:
   - All UI strings are structured in `frontend/src/i18n/locales/{en,hi,ta}/common.json`.
   - Script `python3 scripts/check_translations.py` validates key parity before every build.

---

## 2. Technical Glossary & Conventions

| Concept / UI Key | English (`en`) | Hindi (`hi`) | Tamil (`ta`) |
| :--- | :--- | :--- | :--- |
| `app.title` | MANAK | MANAK | MANAK |
| `app.subtitle` | Indian Standards Recommendation Engine | भारतीय मानक सिफारिश इंजन | இந்தியத் தரநிலைகள் பரிந்துரை இயந்தரம் |
| `nav.newAnalysis` | New analysis | नया विश्लेषण | புதிய பகுப்பாய்வு |
| `results.recommendedTitle` | RECOMMENDED STANDARDS | अनुशंसित भारतीय मानक | பரிந்துரைக்கப்பட்ட இந்தியத் தரநிலைகள் |
| `results.applicabilityScore` | Applicability Score | प्रयोज्यता स्कोर | பொருந்தக்கூடிய மதிப்பெண் |
| `results.whyMatched` | Why this matched | मिलान का कारण | பொருந்தியதற்கான காரணம் |
| `results.viewEvidence` | View Evidence | साक्ष्य देखें | சான்றைக் காண்க |
| `evidence.title` | Supporting Evidence Trail | सहायक साक्ष्य ट्रेल | ஆதார சான்று பாதை |
| `compare.title` | Compare Indian Standards | भारतीय मानकों की तुलना करें | இந்தியத் தரநிலைகளை ஒப்பிடுக |

---

## 3. Extensibility to 4th Language

To add a 4th language (e.g. Telugu `te` or Marathi `mr`):
1. Create `frontend/src/i18n/locales/te/common.json`.
2. Add language option to `frontend/src/i18n/LanguageContext.tsx`:
   ```ts
   { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' }
   ```
3. Run `python3 scripts/check_translations.py`. No code refactoring is required.
