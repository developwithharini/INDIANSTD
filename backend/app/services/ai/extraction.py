import json
import logging
from app.core.config import settings
from app.schemas.domain import RequirementModel
from app.services.fallback.rule_fallback import rule_based_extract

logger = logging.getLogger("manak.ai.extraction")

def extract_requirements(text: str, language: str = "en") -> RequirementModel:
    """Extracts structured requirement parameters using Gemini or fallback rule engine."""
    if not settings.GEMINI_API_KEY:
        logger.info("No GEMINI_API_KEY provided. Using deterministic rule-based requirement extraction fallback.")
        return rule_based_extract(text, language)

    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = f"""You are a senior standards and procurement specification officer.
Extract structured procurement requirement details from the input text below into JSON format matching the schema:
- product: primary product name
- category: general domain category
- application: intended application environment
- environment: indoor/outdoor/industrial
- attributes: technical parameters like IP ratings, surge protection, wattage, etc.
- performance_requirements: performance criteria
- safety_requirements: safety parameters
- testing_requirements: test procedures needed
- materials: raw materials specified
- mentioned_standards: any IS/ISO standards mentioned explicitly

Input text: "{text}"
Input language: {language}

Return ONLY valid JSON matching this schema:
{{
  "product": "...",
  "category": "...",
  "application": "...",
  "environment": "...",
  "attributes": [],
  "performance_requirements": [],
  "safety_requirements": [],
  "testing_requirements": [],
  "installation_requirements": [],
  "materials": [],
  "quantities": [],
  "mentioned_standards": [],
  "regulatory_clues": [],
  "language": "{language}"
}}
"""
        response = client.models.generate_content(
            model=settings.DEFAULT_AI_MODEL,
            contents=prompt,
        )
        content_text = response.text.strip()
        if content_text.startswith("```json"):
            content_text = content_text.replace("```json", "").replace("```", "").strip()
        
        parsed = json.loads(content_text)
        return RequirementModel(**parsed)
    except Exception as e:
        logger.warning(f"Gemini requirement extraction failed ({str(e)}). Falling back to rule engine.")
        return rule_based_extract(text, language)
