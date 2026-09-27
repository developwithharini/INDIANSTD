import re
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple
from app.core.config import settings
from app.schemas.domain import StructuredRequirement

class AIProvider(ABC):
    @abstractmethod
    def extract_requirements(self, text: str) -> Tuple[StructuredRequirement, str]:
        """Extract structured requirement schema from raw text input. Returns (StructuredRequirement, execution_mode)."""
        pass

class LocalFallbackProvider(AIProvider):
    """Deterministic local rule-based requirement extraction fallback."""
    def extract_requirements(self, text: str) -> Tuple[StructuredRequirement, str]:
        clean_text = text.strip()
        lines = [line.strip() for line in clean_text.split('\n') if line.strip()]
        
        # Product identification
        product = "Product Requirement"
        for line in lines:
            if any(k in line.lower() for k in ["procurement of", "supply of", "purchase of", "need", "require"]):
                product = line
                break
        if product == "Product Requirement" and lines:
            product = lines[0][:80]

        # Category detection
        category = "General Goods"
        text_lower = clean_text.lower()
        if any(k in text_lower for k in ["led", "street light", "luminaire", "lighting", "cable", "electrical"]):
            category = "Electrical & Lighting"
        elif any(k in text_lower for k in ["helmet", "safety", "protective", "headgear"]):
            category = "Personal Protective Equipment"
        elif any(k in text_lower for k in ["rebar", "steel", "concrete", "structural", "cement"]):
            category = "Civil & Construction"
        elif any(k in text_lower for k in ["chair", "table", "furniture", "desk"]):
            category = "Furniture & Appliances"

        # Detect explicit standard numbers
        mentioned_standards = re.findall(r'\b(IS\s*\d+(?:\s*:\s*\d+)?)\b', clean_text, re.IGNORECASE)
        mentioned_standards = list(set([s.upper().replace("  ", " ") for s in mentioned_standards]))

        # Environment detection
        environment = "General"
        if "outdoor" in text_lower or "municipal" in text_lower or "weather" in text_lower:
            environment = "Outdoor"
        elif "indoor" in text_lower or "office" in text_lower:
            environment = "Indoor"
        elif "industrial" in text_lower or "factory" in text_lower:
            environment = "Industrial"

        # Extract requirements lists
        performance = []
        safety = []
        testing = []

        if "ip66" in text_lower:
            performance.append("IP66 Weatherproof ingress protection")
        if "surge" in text_lower or "10kv" in text_lower:
            performance.append("10kV Surge protection rating")
        if "shock" in text_lower or "penetration" in text_lower:
            safety.append("Shock absorption & penetration resistance")
        if "fe 500" in text_lower:
            performance.append("High yield strength Fe 500 grade")

        req = StructuredRequirement(
            product=product,
            category=category,
            application=lines[0] if lines else "General Procurement",
            environment=environment,
            materials=["Metal", "Steel"] if "steel" in text_lower or "metal" in text_lower else [],
            dimensions=[],
            performance_requirements=performance,
            safety_requirements=safety,
            testing_requirements=testing,
            installation_requirements=[],
            mentioned_standards=mentioned_standards,
            regulatory_clues=[],
            language="en"
        )
        return req, "LOCAL_FALLBACK"


class GeminiProvider(AIProvider):
    """Gemini 3.6 Flash requirement extractor with strict Pydantic JSON schema."""
    def extract_requirements(self, text: str) -> Tuple[StructuredRequirement, str]:
        if not settings.GEMINI_API_KEY:
            return LocalFallbackProvider().extract_requirements(text)

        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)

            prompt = f"""You are a procurement standards extraction specialist.
Analyze the following procurement text and return a strict JSON object following this exact schema:
{{
  "product": "core product being procured",
  "category": "general product category",
  "application": "intended application",
  "environment": "operational environment (Outdoor/Indoor/Industrial)",
  "materials": ["list of materials"],
  "dimensions": ["list of dimensions"],
  "performance_requirements": ["list of performance specs"],
  "safety_requirements": ["list of safety specs"],
  "testing_requirements": ["list of test specs"],
  "installation_requirements": ["list of installation specs"],
  "mentioned_standards": ["explicit IS standard numbers found"],
  "regulatory_clues": ["any QCO or mandatory regulation hints"],
  "language": "en"
}}

Document content:
{text[:4000]}
"""
            res = model.generate_content(prompt)
            raw_res = res.text
            # Clean markdown codeblocks
            clean_res = re.sub(r'```json\s*|\s*```', '', raw_res).strip()
            data = json.loads(clean_res)
            return StructuredRequirement(**data), "GEMINI_FLASH"

        except Exception as e:
            # Graceful fallback on API error or network failure
            return LocalFallbackProvider().extract_requirements(text)


def get_ai_provider() -> AIProvider:
    if settings.GEMINI_API_KEY:
        return GeminiProvider()
    return LocalFallbackProvider()
