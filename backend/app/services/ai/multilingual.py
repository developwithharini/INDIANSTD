import re

def detect_language(text: str) -> str:
    """Detects if text contains Tamil, Hindi (Devanagari), or English."""
    # Tamil Unicode block: U+0B80 - U+0BFF
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"
    # Devanagari Unicode block: U+0900 - U+097F
    elif re.search(r'[\u0900-\u097F]', text):
        return "hi"
    return "en"

def normalize_intent(text: str, language: str) -> str:
    """Translates/normalizes Tamil or Hindi procurement text to English for retrieval while preserving original text."""
    if language == "ta":
        # Rule-based fallback mapping for common procurement terms if AI offline
        text_lower = text.lower()
        if "தெருவிளக்கு" in text or "தெரு விளக்கு" in text:
            return text + " [Normalized Intent: Outdoor LED Street Lighting Luminaires municipal roads 500 units IP66 IS 10322]"
        elif "தலைக்கவசம்" in text or "ஹெல்மெட்" in text:
            return text + " [Normalized Intent: Protective Safety Helmets industrial work IS 2925 IS 4151]"
        elif "சிமெண்ட்" in text:
            return text + " [Normalized Intent: Ordinary Portland Cement 53 grade IS 269 structural construction]"
        elif "நாற்காலி" in text:
            return text + " [Normalized Intent: Office Ergonomic Work Chairs metal IS 17631 IS 3499]"
    elif language == "hi":
        if "एलईडी" in text or "स्ट्रीट लाइट" in text:
            return text + " [Normalized Intent: Outdoor LED Street Lighting Luminaires IP65 IS 10322]"
        elif "हेलमेट" in text:
            return text + " [Normalized Intent: Safety Helmet Industrial IS 2925 IS 4151]"
    
    return text
