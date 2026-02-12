from app.utils.util_mod2_1 import embed, normalize_student_will_vector
from app.utils.score_model2 import (
    locality_match_score,
    financial_match_score,
    eligibility_match_score,
    cultural_match_score,
    quality_score,
    final_college_match_score,
)


def college_recommender(student_actual_vector: dict,
                        students_will_vector: dict,
                        colleges: list,
                        finalCollegeList: list):
    """
    filters colleges by finalCollegeList and then computes match scores
    returns (college_match_score, final_scores)
    """

    CATEGORY_TEXT = {
        "cultural": ["music", "dance", "art", "painting", "theatre", "singing"],
        "sport": ["football", "cricket", "running", "basketball"],
        "technical": ["coding", "programming", "robotics", "ai"],
        "others": ["charity", "volunteering", "socialwork"],
    }

    CATEGORY_EMB = {}
    for cat, words in CATEGORY_TEXT.items():
        phrase = " ".join(words)
        CATEGORY_EMB[cat] = embed(phrase)

    def college_events_text(college):
        return (
            f"{college.get('Fests', '')} "
            f"{college.get('Facilities', '')} "
            f"{college.get('Extra_curricular', '')}"
        )

    college_match_score = {}

    for college in colleges:
        name = college.get("Name", "").strip()
        # print("Recommender test name:",name)
        if not name:
            continue

        # ⭐ FILTER HERE
        if finalCollegeList and name not in finalCollegeList:
            # print("Recommender test name not in finalCollegeList:",name)
            continue

        _ = embed(college_events_text(college))
        # print("Recommender test name:",name)

        locality_score = round(float(locality_match_score(student_actual_vector, college)), 4)
        finance_score = round(float(financial_match_score(student_actual_vector, college)), 4)
        eligibility_score = round(float(eligibility_match_score(student_actual_vector, college)), 4)
        cultural_score = round(
            float(cultural_match_score(student_actual_vector, college, CATEGORY_EMB, CATEGORY_TEXT)), 4
        )
        quality_score_val = round(float(quality_score(college)), 4)

        college_match_score[name] = [
            locality_score,
            finance_score,
            eligibility_score,
            cultural_score,
            quality_score_val,
        ]
    # print("Recommender test college_match_score:",college_match_score)
    # If nothing matched → return empty results instead of crashing
    if not college_match_score:
        return {}, {}

    normalized_student_will = normalize_student_will_vector(students_will_vector)

    final_scores = {}
    for college_name, score_list in college_match_score.items():
        final_scores[college_name] = round(
            float(final_college_match_score(normalized_student_will, score_list)), 4
        )
    # print("Recommender test final_scores:",final_scores)
    return college_match_score, final_scores

