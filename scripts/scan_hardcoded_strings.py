#!/usr/bin/env python3
"""
MANAK Hardcoded String Scanner
Scans frontend JSX/TSX files for suspicious hardcoded user-facing English strings.
Excludes technical identifiers, standard numbers, imports, types, CSS classes, URLs, etc.
"""

import os
import re
import sys

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/src"))

# Known allowed technical / dataset terms
WHITELIST = {
    "MANAK", "BIS", "IS", "IP66", "10kV", "BGE-M3", "BM25", "FAISS",
    "PDF", "DOCX", "XLSX", "JSON", "HTTP", "LOCAL_FALLBACK", "AI_SEARCH",
    "standards.xlsx", "Standards", "v1.0", "ISO", "QCO", "CRS"
}

SUSPICIOUS_TERMS = [
    r"PRODUCT / ITEM",
    r"APPLICATION / ENVIRONMENT",
    r"PERFORMANCE REQUIREMENT",
    r"Input: DESCRIBE",
    r"Input: UPLOAD",
    r"Processed in",
    r"Collapse",
    r"Expand",
    r"PRODUCT CATEGORY",
    r"WHY THIS MATCHED",
    r"View Evidence",
    r"Compare",
    r"Details",
    r"Refine search",
    r"WORKBOOK",
    r"SHEET",
    r"ROW",
    r"FIELD",
    r"CURRENT",
    r"SUPERSEDED",
    r"WITHDRAWN",
    r"PRIMARY",
    r"RELATED"
]

def scan_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    findings = []
    lines = content.splitlines()

    for i, line in enumerate(lines, 1):
        trimmed = line.strip()
        # Skip import lines, comments, console logs, type definitions, function declarations
        if (trimmed.startswith("import") or 
            trimmed.startswith("//") or 
            trimmed.startswith("/*") or 
            trimmed.startswith("*") or
            "console.log" in trimmed or 
            "const " in trimmed or 
            "let " in trimmed or 
            "function " in trimmed or 
            "interface " in trimmed or 
            "type " in trimmed):
            continue

        # Look for literal raw text between JSX tags like >Text<
        jsx_text_matches = re.findall(r'>\s*([A-Za-z0-9\s/:-]{3,})\s*<', line)
        for match in jsx_text_matches:
            text = match.strip()
            # If text is not t('...') and not a number/whitelist term
            if not text.startswith("{") and not text.startswith("t(") and text not in WHITELIST:
                # Exclude purely numeric or icon strings
                if re.search(r'[a-zA-Z]{3,}', text):
                    findings.append((i, line.strip(), text))

    return findings

def main():
    print("=" * 60)
    print("MANAK HARDCODED STRING AUDIT SCANNER")
    print("=" * 60)

    total_findings = 0
    for root, _, files in os.walk(FRONTEND_DIR):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".jsx"):
                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, FRONTEND_DIR)
                findings = scan_file(filepath)
                if findings:
                    print(f"\n📁 File: frontend/src/{rel_path}")
                    for line_num, line_str, pattern in findings:
                        print(f"  Line {line_num:3d} | Match: [{pattern}] -> {line_str}")
                        total_findings += 1

    print("\n" + "=" * 60)
    if total_findings == 0:
        print("✅ SUCCESS: 0 hardcoded UI strings detected!")
        sys.exit(0)
    else:
        print(f"⚠️  WARNING: Found {total_findings} potential hardcoded UI string(s).")
        sys.exit(1)

if __name__ == "__main__":
    main()
