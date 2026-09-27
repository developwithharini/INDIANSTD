# MANAK — Multilingual Support Jury Demonstration Guide

This guide outlines the step-by-step demonstration flow for showcasing MANAK's multilingual procurement intelligence.

---

## Step 1: English Procurement Baseline
1. Open MANAK Home (`http://localhost:5173`).
2. Verify English (`[ English ▾ ]`) in the top navigation header.
3. Click preset: **Outdoor LED Streetlights with IP66 Protection**.
4. Click **Analyze Requirement**.
5. Observe results:
   - Category: **Outdoor LED Streetlights**
   - Top Recommendation: **IS 10322 (Part 5/Sec 3) : 2012** (Score: **90.0 / 100**)

---

## Step 2: One-Click Instant Language Switching (Hindi & Tamil)
1. On the active results page, click the top language selector `[ English ▾ ]`.
2. Select **`हिन्दी`** (Hindi).
3. **Observe**:
   - Header labels update immediately to Devanagari script (`MANAK • भारतीय मानक सिफारिश इंजन`).
   - Section header changes to `अनुशंसित भारतीय मानक`.
   - Score badges change to `प्रयोज्यता स्कोर: 90 / 100`.
   - Action buttons change to `साक्ष्य देखें` and `तुलना करें`.
   - **Official Standard Number (`IS 10322 (Part 5/Sec 3) : 2012`) and rank order remain 100% identical**.
4. Select **`தமிழ்`** (Tamil).
5. **Observe**:
   - Section header changes to `பரிந்துரைக்கப்பட்ட இந்தியத் தரநிலைகள்`.
   - Score badges change to `பொருந்தக்கூடிய மதிப்பெண்: 90 / 100`.
   - Action buttons change to `சான்றைக் காண்க` and `ஒப்பிடுக`.
   - Page zero reload, zero re-querying latency!

---

## Step 3: Multilingual Query Submission (Hindi & Tamil Inputs)
1. Click **New Analysis** (`புதிய பகுப்பாய்வு`).
2. Paste Hindi query: `"नगरपालिका सड़कों के लिए बाहरी LED स्ट्रीट लाइट"`
3. Observe live detection badge: `Detected language: Hindi`.
4. Click **Analyze Requirement**.
5. Verify semantic retrieval returns **IS 10322 (Part 5/Sec 3) : 2012** without forcing translation!
6. Repeat for Tamil query: `"வெளிப்புற LED தெருவிளக்குகள்"`.

---

## Step 4: Verification Gate
- Translation key parity check: `python3 scripts/check_translations.py` (0 missing keys).
- Backend tests: `pytest backend/` (20/20 passed).
- Frontend compilation: `npm run build` in `frontend/` (0 errors).
