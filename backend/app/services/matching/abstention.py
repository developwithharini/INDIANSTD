from typing import List, Dict, Any, Tuple, Optional
from app.schemas.domain import (
    StructuredRequirement,
    RecommendationItem,
    WhyNotReason,
    ClosestCandidate,
    ScoreCalibration,
    MatchReason
)

class AbstentionEngine:
    """
    Deterministic No-Match / Abstention and Applicability Score Calibration Engine.
    Evaluates candidate recommendations to determine if the BIS corpus contains
    a sufficiently relevant standard or if the system should abstain cleanly.
    """

    ABSTENTION_THRESHOLD = 45.0
    STRONG_MATCH_THRESHOLD = 75.0

    def evaluate_decision_state(
        self,
        req: StructuredRequirement,
        recommendations: List[RecommendationItem],
        why_not_list: List[WhyNotReason],
        all_scored_candidates: List[Tuple[float, Dict[str, Any], Dict[str, float], List[MatchReason]]]
    ) -> Tuple[str, bool, Optional[str], Optional[ClosestCandidate], ScoreCalibration]:
        """
        Evaluates scored candidates and recommendations to determine:
        1. decision_state: 'STRONGLY_SUPPORTED', 'POSSIBLE_MATCH_REVIEW_REQUIRED', or 'NO_SUFFICIENT_MATCH'
        2. is_abstained: bool
        3. abstention_reason: Optional[str]
        4. closest_candidate: Optional[ClosestCandidate]
        5. score_calibration: ScoreCalibration
        """
        # Sort all scored candidates descending by final applicability score
        sorted_candidates = sorted(all_scored_candidates, key=lambda x: x[0], reverse=True)

        top_candidate_tuple = sorted_candidates[0] if sorted_candidates else None
        top_score = top_candidate_tuple[0] if top_candidate_tuple else 0.0

        # Extract closest candidate info for honest report
        closest_cand_obj: Optional[ClosestCandidate] = None
        if top_candidate_tuple:
            score, candidate_dict, breakdown, reasons = top_candidate_tuple
            closest_cand_obj = ClosestCandidate(
                standard_id=candidate_dict.get("id", ""),
                standard_number=candidate_dict.get("standard_number", "UNKNOWN"),
                title=candidate_dict.get("title", "Unknown Standard Title"),
                applicability_score=score,
                status=candidate_dict.get("status", "CURRENT"),
                scope_preview=candidate_dict.get("scope", "")[:220] if candidate_dict.get("scope") else None,
                reasons=reasons
            )

        # Check for explicit standard mention override (e.g. user typed IS 10322 or IS 2925)
        std_numbers_in_candidates = [candidate_dict.get("standard_number", "").upper().replace(" ", "") for _, candidate_dict, _, _ in sorted_candidates]
        has_exact_is_override = any(
            ms.upper().replace(" ", "") in std_num
            for ms in req.mentioned_standards
            for std_num in std_numbers_in_candidates
        )

        # Product Match signal inspection
        prod_cat_score = top_candidate_tuple[2].get("product_category_match", 0.0) if top_candidate_tuple else 0.0

        # DECISION RULE:
        # Abstain if top score < 45.0 OR no recommendations pass threshold OR product match signal < 15.0 without exact override
        is_abstained = (
            top_score < self.ABSTENTION_THRESHOLD or
            len(recommendations) == 0 or
            (prod_cat_score < 15.0 and not has_exact_is_override)
        )

        if is_abstained:
            decision_state = "NO_SUFFICIENT_MATCH"
            query_product = req.product if req.product else "specified requirement"

            if closest_cand_obj:
                abstention_reason = (
                    f"No direct Indian Standard was found in the current corpus for '{query_product}'. "
                    f"The closest candidate identified is {closest_cand_obj.standard_number}: {closest_cand_obj.title} "
                    f"with a low applicability score of {closest_cand_obj.applicability_score}/100."
                )
            else:
                abstention_reason = (
                    f"No Indian Standard in the official corpus matches the requested product '{query_product}'."
                )

            score_calibration = ScoreCalibration(
                tier="ABSTAIN",
                confidence="NONE",
                score_range="0.0 - 44.9",
                interpretation="Below match threshold (45/100). Corpus does not contain an applicable standard."
            )
            return decision_state, True, abstention_reason, closest_cand_obj, score_calibration

        elif top_score >= self.STRONG_MATCH_THRESHOLD:
            decision_state = "STRONGLY_SUPPORTED"
            score_calibration = ScoreCalibration(
                tier="STRONG",
                confidence="HIGH",
                score_range="75.0 - 100.0",
                interpretation="Direct product/scope match (75-100/100). High applicability confidence."
            )
            return decision_state, False, None, closest_cand_obj, score_calibration

        else:
            decision_state = "POSSIBLE_MATCH_REVIEW_REQUIRED"
            score_calibration = ScoreCalibration(
                tier="REVIEW_REQUIRED",
                confidence="MODERATE",
                score_range="45.0 - 74.9",
                interpretation="Partial match detected (45-74/100). Technical review recommended before procurement."
            )
            return decision_state, False, None, closest_cand_obj, score_calibration

abstention_engine = AbstentionEngine()
