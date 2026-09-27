#!/usr/bin/env python3
"""
MANAK Translation Key Parity Validator
Validates key parity across English, Hindi, and Tamil translation bundles.
"""

import json
import os
import sys

LOCALES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/src/i18n/locales"))
LOCALES = ["en", "hi", "ta"]

def get_keys(data, prefix=""):
    keys = set()
    if isinstance(data, dict):
        for k, v in data.items():
            full_key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys.update(get_keys(v, full_key))
            else:
                keys.add(full_key)
    return keys

def main():
    print("=" * 50)
    print("TRANSLATION KEY VALIDATION")
    print("=" * 50)

    key_sets = {}

    for loc in LOCALES:
        file_path = os.path.join(LOCALES_DIR, loc, "common.json")
        if not os.path.exists(file_path):
            print(f"❌ ERROR: Missing translation file for locale '{loc}': {file_path}")
            sys.exit(1)

        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
                keys = get_keys(data)
                key_sets[loc] = keys
                print(f"{loc.upper()} keys count: {len(keys)}")
            except Exception as e:
                print(f"❌ ERROR parsing JSON for locale '{loc}': {e}")
                sys.exit(1)

    all_keys = set().union(*key_sets.values())
    missing_found = False

    for loc in LOCALES:
        missing = all_keys - key_sets[loc]
        if missing:
            missing_found = True
            print(f"\n❌ Missing keys in '{loc}':")
            for k in sorted(missing):
                print(f"  - {k}")

    print("-" * 50)
    if missing_found:
        print("❌ FAILED: Translation key parity check failed!")
        sys.exit(1)
    else:
        print(f"✅ SUCCESS: 100% Translation Key Parity Across All Locales ({', '.join(LOCALES)}) ({len(all_keys)} keys)!")
        sys.exit(0)

if __name__ == "__main__":
    main()
