# recommender_db.py - Unified Database-based recommender
# Consolidates logic from previous multi-file recommender system.

import numpy as np
import math
from typing import Optional, List, Tuple, Dict, Any
from app.services.db_service import (
    fetch_riasec_careers,
    fetch_career_to_course_mapping,
    fetch_course_to_college_mapping,
    fetch_college_data,
)
from app.utils.riasec_utils import compute_riasec
from app.utils.recommendation_helpers import career_to_course, course_to_college
from app.utils.math_utils import cosine_similarity
from app.utils.embedding_utils import embed
from app.utils.scoring_logic import (
    locality_match_score,
    financial_match_score,
    eligibility_match_score,
    cultural_match_score,
    quality_score,
)

# ============================================================================
# RECOMMENDER LOGIC
# ============================================================================


def normalize_student_weights(preferences: dict) -> List[float]:
    weights = {
        "locality": preferences.get("Importance_Locality", 3),
        "financial": preferences.get("Importance_Financial", 3),
        "eligibility": preferences.get("Importance_Eligibility", 3),
        "cultural": preferences.get("Importance_Events_hobbies", 3),
        "quality": preferences.get("Importance_Quality", 3),
    }
    total = sum(weights.values())
    if total == 0:
        return [0.2] * 5
    return [
        weights["locality"] / total,
        weights["financial"] / total,
        weights["eligibility"] / total,
        weights["cultural"] / total,
        weights["quality"] / total,
    ]


def college_recommender_logic(
    student_actual: dict, student_preferences: dict, colleges: list, filter_list: list
) -> tuple:
    # Setup for cultural matching
    CATEGORY_TEXT = {
        "cultural": ["music", "dance", "art", "painting", "theatre", "singing"],
        "sport": ["football", "cricket", "running", "basketball"],
        "technical": ["coding", "programming", "robotics", "ai"],
        "others": ["charity", "volunteering", "socialwork"],
    }
    CATEGORY_EMB = {cat: embed(" ".join(words)) for cat, words in CATEGORY_TEXT.items()}

    college_match_score = {}
    filter_set = {c.lower().strip() for c in filter_list} if filter_list else set()

    # Primary pass
    for college in colleges:
        name = college.get("Name", "").strip()
        if not name or (filter_set and name.lower() not in filter_set):
            continue

        eligibility = eligibility_match_score(student_actual, college)
        if eligibility == 0:
            continue

        scores = [
            locality_match_score(student_actual, college),
            financial_match_score(student_actual, college),
            eligibility,
            cultural_match_score(student_actual, college, CATEGORY_EMB, CATEGORY_TEXT),
            quality_score(college),
        ]
        college_match_score[name] = scores

    # Fallback to all colleges if filter Resulted in 0 matches
    if not college_match_score:
        for college in colleges:
            name = college.get("Name", "").strip()
            if not name:
                continue

            eligibility = eligibility_match_score(student_actual, college)
            if eligibility == 0:
                continue

            college_match_score[name] = [
                locality_match_score(student_actual, college),
                financial_match_score(student_actual, college),
                eligibility,
                cultural_match_score(
                    student_actual, college, CATEGORY_EMB, CATEGORY_TEXT
                ),
                quality_score(college),
            ]

    weights = normalize_student_weights(student_preferences)
    final_scores = {
        name: round(sum(s * w for s, w in zip(scores, weights)), 4)
        for name, scores in college_match_score.items()
    }

    return college_match_score, final_scores


# ============================================================================
# CORE RECOMMENDER PIPELINE
# ============================================================================


def _to_float_list(x):
    if isinstance(x, np.ndarray):
        return [float(v) for v in x.tolist()]
    if isinstance(x, (list, tuple)):
        return [float(v) for v in x]
    return [float(x)]


def get_career_recommendations(scores: dict, top_n=10) -> List[str]:
    student_vec = compute_riasec(
        scores["Logical_reasoning"],
        scores["Quantitative_reasoning"],
        scores["Analytical_reasoning"],
        scores["Verbal_reasoning"],
        scores["Spatial_reasoning"],
        scores["Creativity"],
        scores["Enter"],
    )
    careers = fetch_riasec_careers()
    if not careers:
        return []

    trait_keys = [
        "Realistic",
        "Investigative",
        "Artistic",
        "Social",
        "Enterprising",
        "Conventional",
    ]
    scored_careers = []
    for career in careers:
        career_vec = [float(career.get(k, 0) or 0) for k in trait_keys]
        sim = cosine_similarity(student_vec, career_vec)
        scored_careers.append((career["Title"], sim))

    scored_careers.sort(key=lambda x: x[1], reverse=True)
    return [title for title, score in scored_careers[:top_n]]


async def run_recommender_db(
    scores: dict, student_actual: dict, student_preferences: dict
) -> dict:
    from app.utils.explain_career_api import explain_careers_batch_with_llm
    from app.utils.explain_college_multi import explain_multiple_colleges_with_llm

    # 1. RIASEC & Careers
    riasec_scores = _to_float_list(
        compute_riasec(
            scores["Logical_reasoning"],
            scores["Quantitative_reasoning"],
            scores["Analytical_reasoning"],
            scores["Verbal_reasoning"],
            scores["Spatial_reasoning"],
            scores["Creativity"],
            scores["Enter"],
        )
    )
    top_careers = get_career_recommendations(scores)

    # 2. Mappings
    career_course_dict = fetch_career_to_course_mapping()
    course_college_dict = fetch_course_to_college_mapping()
    recommended_courses = career_to_course(top_careers, career_course_dict)
    _, unique_colleges = course_to_college(recommended_courses, course_college_dict)

    # 3. College Scoring
    college_data = fetch_college_data()
    college_scores, final_scores = college_recommender_logic(
        student_actual, student_preferences, college_data, unique_colleges
    )

    # 4. Formatting Output
    top_colleges = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)[:5]
    top_college_names = [name for name, _ in top_colleges]

    # 5. Explanations (AI)
    career_exps = []
    try:
        raw_exps = explain_careers_batch_with_llm(top_careers[:5], riasec_scores)
        career_exps = [
            {"career": c, "explanation": raw_exps.get(c, "Explanation unavailable")}
            for c in top_careers[:5]
        ]
    except Exception as e:
        print(f"❌ Career explanation AI failed: {e}")
        career_exps = [
            {"career": c, "explanation": "Explanation unavailable"}
            for c in top_careers[:5]
        ]

    college_exps = {}
    try:
        raw_college_exps = explain_multiple_colleges_with_llm(
            top_college_names,
            student_actual,
            student_preferences,
            {name: [float(v) for v in vals] for name, vals in college_scores.items()},
        )
        college_exps = {
            c: raw_college_exps.get(c, "Explanation unavailable")
            for c in top_college_names
        }
    except Exception as e:
        print(f"❌ College explanation AI failed: {e}")
        college_exps = {c: "Explanation unavailable" for c in top_college_names}

    return {
        "riasec_scores": riasec_scores,
        "top_careers": top_careers[:5],
        "career_courses": recommended_courses,
        "recommended_colleges": [
            {"name": n, "score": round(s, 3)} for n, s in top_colleges
        ],
        "career_explanations": career_exps,
        "college_explanations": college_exps,
    }
