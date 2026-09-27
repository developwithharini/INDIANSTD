import uuid
from typing import List, Dict, Any, Tuple, Optional
from app.schemas.domain import (
    StructuredRequirement,
    RequirementItem,
    RecommendationItem,
    EvidenceItem,
    RequirementEvidenceLink,
    RequirementCoverageItem
)

class RequirementEvidenceMapper:
    """
    Deterministic service for linking extracted procurement requirements
    to supporting evidence items and recommended standards.
    """

    def extract_discrete_requirements(self, req: StructuredRequirement) -> List[RequirementItem]:
        """
        Extracts discrete RequirementItem objects with stable identifiers from StructuredRequirement.
        """
        items: List[RequirementItem] = []
        counter = 1

        def add_item(val: Optional[str], req_type: str, category_label: str, inferred: bool = False):
            nonlocal counter
            if not val or not str(val).strip():
                return
            val_str = str(val).strip()
            req_id = f"req_{counter:02d}"
            counter += 1
            items.append(RequirementItem(
                id=req_id,
                type=req_type,
                value=val_str,
                source_span=val_str,
                confidence=1.0,
                inferred=inferred,
                category_label=category_label
            ))

        # 1. Core Product
        if req.product:
            add_item(req.product, "product", "Product / Item")

        # 2. Application
        if req.application:
            add_item(req.application, "application", "Application / Environment")

        # 3. Operational Environment
        if req.environment:
            if not req.application or req.environment.strip().lower() != req.application.strip().lower():
                add_item(req.environment, "environment", "Environment Specification")

        # 4. Safety Requirements
        for s in req.safety_requirements:
            add_item(s, "safety", "Safety Requirement")

        # 5. Performance Requirements
        for p in req.performance_requirements:
            add_item(p, "performance", "Performance Requirement")

        # 6. Testing & Verification Requirements
        for t in req.testing_requirements:
            add_item(t, "testing", "Testing & Verification")

        # 7. Material Specifications
        for m in req.materials:
            add_item(m, "material", "Material Specification")

        # 8. Dimensions
        for d in req.dimensions:
            add_item(d, "dimension", "Dimension / Physical Attribute")

        # 9. Explicit Standard References
        for std_ref in req.mentioned_standards:
            add_item(std_ref, "standard_reference", "Explicit Standard Reference")

        return items

    def map_requirements_to_evidence(
        self,
        req: StructuredRequirement,
        recommendations: List[RecommendationItem]
    ) -> Tuple[List[RequirementItem], List[RequirementCoverageItem], List[RequirementEvidenceLink], Dict[str, Any]]:
        """
        Maps discrete requirements to supporting evidence across candidate recommendations.
        Returns: (extracted_requirements, coverage_items, evidence_links, coverage_summary)
        """
        extracted_reqs = self.extract_discrete_requirements(req)
        evidence_links: List[RequirementEvidenceLink] = []
        coverage_items: List[RequirementCoverageItem] = []
        link_counter = 1

        supported_count = 0
        partial_count = 0
        unsupported_count = 0

        for r_item in extracted_reqs:
            req_val_lower = r_item.value.lower()
            req_tokens = set(t for t in req_val_lower.split() if len(t) > 2)
            supporting_stds_map: Dict[str, Dict[str, Any]] = {}
            best_strength_rank = 0  # 3: STRONG, 2: MODERATE, 1: LIMITED, 0: NONE
            primary_evidence_id: Optional[str] = None

            for rec in recommendations:
                rec_supported_reqs = set(rec.supported_requirement_ids)
                matched_evidences: List[EvidenceItem] = []

                for ev in rec.evidence:
                    ev_text = (ev.excerpt + " " + (ev.requirement_signal or "")).lower()
                    ev_terms = set(t.lower() for t in ev.matched_terms)

                    # Check 1: Exact string or phrase match
                    is_exact_phrase = req_val_lower in ev_text or req_val_lower in " ".join(ev_terms)
                    # Check 2: Token intersection match
                    common_tokens = req_tokens.intersection(set(ev_text.split()))
                    has_subphrase = len(common_tokens) >= max(1, len(req_tokens) - 1) if req_tokens else False
                    # Check 3: Semantic/Reason code alignment
                    is_product_align = (r_item.type == "product" and ev.reason_code in ["PRODUCT_MATCH", "SCOPE_MATCH"])
                    is_app_align = (r_item.type == "application" and ev.reason_code in ["DOMAIN_MATCH", "SCOPE_MATCH"])
                    is_std_align = (r_item.type == "standard_reference" and rec.standard_number.lower() in req_val_lower)

                    if is_exact_phrase or is_product_align or is_std_align:
                        strength = "STRONG"
                        rank_score = 3
                    elif has_subphrase or is_app_align:
                        strength = "MODERATE"
                        rank_score = 2
                    elif len(common_tokens) > 0:
                        strength = "LIMITED"
                        rank_score = 1
                    else:
                        continue

                    matched_evidences.append(ev)
                    link_id = f"link_{link_counter:03d}"
                    link_counter += 1

                    explanation_text = (
                        f"Requirement '{r_item.value}' is supported by {rec.standard_number} "
                        f"({ev.source_file}, Sheet: {ev.source_sheet or 'Standards'}, Row: {ev.source_row or 'N/A'}, Field: {ev.source_field.upper()})."
                    )

                    link = RequirementEvidenceLink(
                        id=link_id,
                        requirement_id=r_item.id,
                        standard_id=rec.standard_id,
                        evidence_id=ev.evidence_id,
                        relationship_type="SUPPORTS" if strength in ["STRONG", "MODERATE"] else "PARTIALLY_SUPPORTS",
                        support_strength=strength,
                        explanation=explanation_text
                    )
                    evidence_links.append(link)

                    # Update recommendation supported_requirement_ids
                    rec_supported_reqs.add(r_item.id)

                    if rank_score > best_strength_rank:
                        best_strength_rank = rank_score
                        primary_evidence_id = ev.evidence_id

                    # Record supporting standard summary
                    if rec.standard_id not in supporting_stds_map:
                        supporting_stds_map[rec.standard_id] = {
                            "standard_id": rec.standard_id,
                            "standard_number": rec.standard_number,
                            "title": rec.title,
                            "support_strength": strength,
                            "evidence_ids": [ev.evidence_id]
                        }
                    else:
                        if ev.evidence_id not in supporting_stds_map[rec.standard_id]["evidence_ids"]:
                            supporting_stds_map[rec.standard_id]["evidence_ids"].append(ev.evidence_id)

                rec.supported_requirement_ids = list(rec_supported_reqs)

            # Assign per-requirement coverage status
            if best_strength_rank >= 3:
                req_status = "SUPPORTED"
                supported_count += 1
            elif best_strength_rank >= 1:
                req_status = "PARTIALLY_SUPPORTED"
                partial_count += 1
            else:
                req_status = "NO_EVIDENCE"
                unsupported_count += 1

            coverage_items.append(RequirementCoverageItem(
                requirement=r_item,
                status=req_status,
                supporting_standards=list(supporting_stds_map.values()),
                primary_evidence_id=primary_evidence_id
            ))

        coverage_summary = {
            "total_requirements": len(extracted_reqs),
            "supported_count": supported_count,
            "partially_supported_count": partial_count,
            "unsupported_count": unsupported_count,
            "coverage_percentage": round((supported_count / len(extracted_reqs) * 100.0), 1) if extracted_reqs else 0.0
        }

        return extracted_reqs, coverage_items, evidence_links, coverage_summary

requirement_mapper = RequirementEvidenceMapper()
