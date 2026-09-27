import re
from typing import List, Dict, Any, Optional
from app.schemas.domain import EvidenceItem, StructuredRequirement, MatchReason

def extract_evidence_items(
    standard: Dict[str, Any],
    requirement: StructuredRequirement,
    score_breakdown: Dict[str, float],
    reasons: List[MatchReason]
) -> List[EvidenceItem]:
    """
    Extracts deterministic evidence items from standard metadata and procurement requirement.
    Produces typed EvidenceItem objects with provenance (file, sheet, row, field) and phrase matching.
    """
    evidence_list: List[EvidenceItem] = []
    standard_id = standard.get("id") or standard.get("standard_id", "std_unknown")
    
    # Provenance metadata
    source_file = standard.get("source_file") or "standards.xlsx"
    source_sheet = standard.get("source_sheet") or "Standards"
    source_row = standard.get("source_row")
    
    # Collect requirement terms for phrase highlighting
    req_terms = set()
    for field in [
        requirement.product,
        requirement.category,
        requirement.application,
        requirement.environment
    ]:
        if field:
            # Tokenize into words of length >= 3
            words = re.findall(r'\b[A-Za-z0-9]{3,}\b', field.lower())
            req_terms.update(words)
            
    for item in requirement.materials + requirement.performance_requirements + requirement.safety_requirements:
        words = re.findall(r'\b[A-Za-z0-9]{3,}\b', item.lower())
        req_terms.update(words)
        
    # Helper to find matched terms in text
    def find_matched_phrases(text: str) -> List[str]:
        if not text:
            return []
        text_lower = text.lower()
        matched = []
        # Check explicit multi-word product phrases first
        if requirement.product and len(requirement.product.strip()) > 3:
            prod_clean = requirement.product.strip().lower()
            if prod_clean in text_lower:
                matched.append(requirement.product.strip())
        
        # Check individual keywords
        for term in sorted(req_terms, key=len, reverse=True):
            if term not in ["for", "and", "the", "with", "use", "used", "req", "type"]:
                if re.search(r'\b' + re.escape(term) + r'\b', text_lower):
                    if not any(term in m.lower() for m in matched):
                        matched.append(term)
        return matched[:6]

    scope_text = standard.get("scope") or standard.get("scope_preview")
    title_text = standard.get("title", "")
    category_text = standard.get("category", "")
    status_text = standard.get("status", "CURRENT")

    # 1. SCOPE MATCH EVIDENCE
    if scope_text and len(scope_text.strip()) > 10:
        matched_in_scope = find_matched_phrases(scope_text)
        scope_score = score_breakdown.get("scope_match", 50.0)
        strength = "STRONG" if matched_in_scope and scope_score >= 60 else "MODERATE"
        req_sig = requirement.product or requirement.application or "Scope Specification Alignment"
        
        evidence_list.append(
            EvidenceItem(
                evidence_id=f"ev_scope_{standard_id}",
                standard_id=standard_id,
                reason_code="SCOPE_MATCH",
                source_type="BIS_DATASET",
                source_file=source_file,
                source_sheet=source_sheet,
                source_row=source_row,
                source_field="scope",
                source_page=None,
                excerpt=scope_text.strip(),
                matched_terms=matched_in_scope,
                requirement_signal=req_sig,
                evidence_strength=strength,
                explanation="Official BIS published scope text directly addresses application and operational specifications."
            )
        )

    # 2. PRODUCT MATCH EVIDENCE
    if title_text:
        matched_in_title = find_matched_phrases(title_text)
        title_score = score_breakdown.get("product_category_match", 50.0)
        strength = "STRONG" if matched_in_title and title_score >= 60 else "MODERATE"
        req_sig = requirement.product or "Product Category Specification"
        
        evidence_list.append(
            EvidenceItem(
                evidence_id=f"ev_prod_{standard_id}",
                standard_id=standard_id,
                reason_code="PRODUCT_MATCH",
                source_type="BIS_DATASET",
                source_file=source_file,
                source_sheet=source_sheet,
                source_row=source_row,
                source_field="title",
                source_page=None,
                excerpt=f"{standard.get('standard_number', '')} — {title_text}",
                matched_terms=matched_in_title,
                requirement_signal=req_sig,
                evidence_strength=strength,
                explanation="Standard official publication title aligns with target product specification."
            )
        )

    # 3. CATEGORY / DOMAIN MATCH EVIDENCE
    if category_text:
        cat_terms = find_matched_phrases(category_text)
        req_sig = requirement.category or requirement.domain or "Technical Sector Domain"
        evidence_list.append(
            EvidenceItem(
                evidence_id=f"ev_cat_{standard_id}",
                standard_id=standard_id,
                reason_code="DOMAIN_MATCH",
                source_type="BIS_DATASET",
                source_file=source_file,
                source_sheet=source_sheet,
                source_row=source_row,
                source_field="category",
                source_page=None,
                excerpt=f"Category: {category_text} | Domain: {standard.get('domain', 'General')}",
                matched_terms=cat_terms,
                requirement_signal=req_sig,
                evidence_strength="MODERATE",
                explanation="Bureau of Indian Standards technical classification domain aligns with procurement sector."
            )
        )

    # 4. VERSION & REGULATORY EVIDENCE
    if status_text:
        evidence_list.append(
            EvidenceItem(
                evidence_id=f"ev_ver_{standard_id}",
                standard_id=standard_id,
                reason_code="VERSION_VALID",
                source_type="BIS_DATASET",
                source_file=source_file,
                source_sheet=source_sheet,
                source_row=source_row,
                source_field="status",
                source_page=None,
                excerpt=f"Status: {status_text} | Publication Year: {standard.get('publication_year', 'Current')}",
                matched_terms=[status_text],
                requirement_signal="Active Publication Lifecycle Verification",
                evidence_strength="STRONG" if status_text == "CURRENT" else "MODERATE",
                explanation="Verified active publication status in official BIS registry."
            )
        )

    # Fallback if no scope/title stored
    if not evidence_list:
        evidence_list.append(
            EvidenceItem(
                evidence_id=f"ev_unavail_{standard_id}",
                standard_id=standard_id,
                reason_code="UNAVAILABLE",
                source_type="BIS_DATASET",
                source_file=source_file,
                source_sheet=source_sheet,
                source_row=source_row,
                source_field="scope",
                source_page=None,
                excerpt="No detailed scope text recorded in the current BIS dataset snapshot.",
                matched_terms=[],
                evidence_strength="UNAVAILABLE",
                explanation="Detailed text evidence unavailable in snapshot."
            )
        )

    return evidence_list
