# recommender_db.py - Database-based recommender (replaces recommender_wrapped.py)
# Fetches all data from Supabase instead of JSON files

import numpy as np
from app.services.db_service import (
    fetch_riasec_careers,
    fetch_career_to_course_mapping,
    fetch_course_to_college_mapping,
    fetch_college_data,
)
from app.services.recommender2_db import college_recommender_db
from app.utils.model1_utils import compute_riasec, career_to_course, course_to_college
from app.utils.util_mod2_1 import cosine_similarity


def _to_float_list(x):
    """Helper to convert numpy arrays or sequences to list of floats."""
    if isinstance(x, np.ndarray):
        return [float(v) for v in x.tolist()]
    if isinstance(x, (list, tuple)):
        return [float(v) for v in x]
    return [float(x)]


def get_recommendations_from_db(logical, quant, analytical, verbal, spatial, creativity, enter, top_n=10):
    """
    Get career recommendations from database instead of CSV.
    """
    # Compute student's RIASEC vector
    student_vec = compute_riasec(logical, quant, analytical, verbal, spatial, creativity, enter)
    
    # Fetch careers from database (returns list of dicts)
    careers = fetch_riasec_careers()
    
    if not careers:
        return []
    
    trait_keys = ["Realistic", "Investigative", "Artistic",
                  "Social", "Enterprising", "Conventional"]
    
    # Calculate similarity scores for each career
    scored_careers = []
    for career in careers:
        career_vec = [float(career.get(k, 0) or 0) for k in trait_keys]
        sim = cosine_similarity(student_vec, career_vec)
        scored_careers.append((career["Title"], sim))
    
    # Sort by score descending and get top N
    scored_careers.sort(key=lambda x: x[1], reverse=True)
    top_careers = [title for title, score in scored_careers[:top_n]]
    
    return top_careers


async def run_recommender_db(
    scores: dict,
    student_actual: dict,
    student_preferences: dict
) -> dict:
    """
    Database-based recommender pipeline.
    Replaces run_recommender_async from recommender_wrapped.py.
    
    Args:
        scores: User aptitude scores (Logical, Quant, etc.)
        student_actual: Student's actual data (locality, gender, category, etc.)
        student_preferences: Student's preferences (weights for scoring)
    
    Returns:
        Complete recommendation results
    """
    from app.utils.explain_career_api import explain_careers_batch_with_llm
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

    # 2) Top careers from database
    top_careers = get_recommendations_from_db(L, Q, A, V, S, C, E)

    # 3) Fetch mappings from database
    career_course_dict = fetch_career_to_course_mapping()
    
    course_college_dict = fetch_course_to_college_mapping()

    # 4) careers → courses
    career_course_list = career_to_course(top_careers, career_course_dict)

    # 5) courses → colleges
    course_college_list, unique_colleges = course_to_college(
        career_course_list,
        course_college_dict
    )

    # 6) Fetch college data and run recommender
    # Fetch ALL colleges from database (not filtered) and let the recommender filter
    college_data = fetch_college_data()
    
    college_scores, final_scores = college_recommender_db(
        student_actual,
        student_preferences,
        college_data,
        unique_colleges  # Pass the filter list to recommender
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

    # Sort colleges by score and limit to top 5
    sorted_colleges = sorted(
        final_scores_clean.items(),
        key=lambda x: x[1],
        reverse=True
    )[:5]  # Limit to top 5 colleges
    
    sorted_colleges = [
        {"name": name, "score": round(score, 3)}
        for name, score in sorted_colleges
    ]

    # -------- Career Explanations (top 5) --------
    top_five_careers = top_careers[:5]
    career_explanations = []
    
    try:
        raw_career_exps = explain_careers_batch_with_llm(top_five_careers, riasec_scores)
    except Exception as e:
        raw_career_exps = {}

    for career in top_five_careers:
        explanation = raw_career_exps.get(career, "Career explanation unavailable")
        career_explanations.append({
            "career": career,
            "explanation": explanation
        })

    # -------- College Explanations (all 5) --------
    top_five_colleges = [col["name"] for col in sorted_colleges[:5]]
    college_explanations = {}
    
    try:
        # Check if we have scores for these colleges
        
        raw_college_exps = explain_multiple_colleges_with_llm(
            top_five_colleges,
            student_actual,
            student_preferences,
            college_scores_clean
        )
        
        for college in top_five_colleges:
            college_explanations[college] = raw_college_exps.get(
                college, "Explanation unavailable"
            )
    except Exception as e:
        for c in top_five_colleges:
            college_explanations[c] = "College explanation unavailable"

    
    # Return only essential fields with limited results
    return {
        "riasec_scores": riasec_scores,
        "top_careers": top_careers[:5],  # Only top 5 careers
        "career_courses": career_course_list,  # Career to courses mapping
        "recommended_colleges": sorted_colleges,  # Already limited to 10
        "career_explanations": career_explanations,  # Only 3
        "college_explanations": college_explanations  # Only 3
    }

