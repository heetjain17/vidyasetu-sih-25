# recommender_wrapped.py - English only, fast response

import json
from pathlib import Path
import numpy as np

from app.services.recommender import recommender1
from app.services.recommender2 import college_recommender
from app.utils.model1_utils import compute_riasec, career_to_course, course_to_college


# ---- load static data once ----
BASE_DIR = Path(__file__).resolve().parent.parent

with (BASE_DIR / "asset" / "Career_to_course.json").open("r", encoding="utf-8") as f:
    career_course_dict = json.load(f)

with (BASE_DIR / "asset" / "Course_to_college.json").open("r", encoding="utf-8") as f:
    course_college_dict = json.load(f)

with (BASE_DIR / "asset" / "college_data.json").open("r", encoding="utf-8") as f:
    college_data = json.load(f)


def _to_float_list(x):
    """Helper to convert numpy arrays or sequences to list of floats."""
    if isinstance(x, np.ndarray):
        return [float(v) for v in x.tolist()]
    if isinstance(x, (list, tuple)):
        return [float(v) for v in x]
    return [float(x)]


async def run_recommender_async(scores: dict,
                                student_actual: dict,
                                student_preferences: dict) -> dict:
    """
    Fast recommender that returns English explanations only.
    Translations are done on-demand via separate endpoint.
    """
    from app.utils.explain_career_api import explain_career_with_llm
    from app.utils.explain_college_multi import explain_multiple_colleges_with_llm

    L = scores["Logical_reasoning"]
    Q = scores["Quantitative_reasoning"]
    A = scores["Analytical_reasoning"]
    V = scores["Verbal_reasoning"]
    S = scores["Spatial_reasoning"]
    C = scores["Creativity"]
    E = scores["Enter"]

    # 1) RIASEC vector
    riasec_scores = compute_riasec(L, Q, A, V, S, C, E)
    riasec_scores = _to_float_list(riasec_scores)

    # 2) Top careers
    top_careers = recommender1(L, Q, A, V, S, C, E)

    # 3) careers → courses
    career_course_list = career_to_course(top_careers, career_course_dict)

    # 4) courses → colleges
    course_college_list, unique_colleges = course_to_college(
        career_course_list,
        course_college_dict
    )

    # 5) college recommender
    college_scores, final_scores = college_recommender(
        student_actual,
        student_preferences,
        college_data,
        unique_colleges
    )

    # Clean scores for JSON
    final_scores_clean = {
        str(name): float(score)
        for name, score in final_scores.items()
    }

    college_scores_clean = {
        str(name): [float(v) for v in vals]
        for name, vals in college_scores.items()
    }

    # Sort colleges by score
    sorted_colleges = sorted(
        final_scores_clean.items(),
        key=lambda x: x[1],
        reverse=True
    )
    sorted_colleges = [
        {"name": name, "score": score}
        for name, score in sorted_colleges
    ]

    # -------- Career Explanations (English only) --------
    print("🚀 Generating career explanations (English only)...")
    
    career_explanations = []
    for career in top_careers[:5]:
        try:
            explanation = explain_career_with_llm(career, riasec_scores)
        except Exception:
            explanation = "Career explanation unavailable"
        career_explanations.append({
            "career": career,
            "explanation": explanation  # Single string, not dict
        })

    # -------- College Explanations (English only) --------
    print("🚀 Generating college explanations (English only)...")
    
    top_three = [col["name"] for col in sorted_colleges[:3]]
    college_explanations = {}
    
    try:
        raw_college_exps = explain_multiple_colleges_with_llm(
            top_three,
            student_actual,
            student_preferences,
            college_scores_clean
        )
        for college in top_three:
            college_explanations[college] = raw_college_exps.get(
                college, "Explanation unavailable"
            )
    except Exception:
        for c in top_three:
            college_explanations[c] = "College explanation unavailable"

    print("✅ Recommendations complete!")
    
    return {
        "riasec_scores": riasec_scores,
        "top_careers": top_careers,
        "career_courses": career_course_list,
        "course_colleges": course_college_list,
        "unique_colleges": unique_colleges,
        "college_components": college_scores_clean,
        "recommended_colleges": sorted_colleges,
        "career_explanations": career_explanations,      # Now: [{career, explanation}]
        "college_explanations": college_explanations     # Now: {name: explanation}
    }
