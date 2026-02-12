import numpy as np
import pandas as pd

from app.utils.util_mod2_1 import (
cosine_similarity
)

def compute_riasec(logical, quant, analytical, verbal, spatial, creativity, enter):

    R = (0.055*logical + 0.022*quant + 0.044*analytical +
     0.011*verbal + 0.604*spatial + 0.033*creativity + 0.231*enter)

    I = (0.346*logical + 0.346*quant + 0.231*analytical +
     0.038*verbal + 0.015*spatial + 0.015*creativity + 0.008*enter)

    A = (0.019*logical + 0.009*quant + 0.094*analytical +
     0.094*verbal + 0.236*spatial + 0.481*creativity + 0.066*enter)

    S = (0.016*logical + 0.008*quant + 0.039*analytical +
     0.426*verbal + 0.023*spatial + 0.093*creativity + 0.395*enter)

    E = (0.042*logical + 0.025*quant + 0.042*analytical +
     0.212*verbal + 0.008*spatial + 0.068*creativity + 0.602*enter)

    C = (0.153*logical + 0.250*quant + 0.222*analytical +
     0.056*verbal + 0.194*spatial + 0.069*creativity + 0.056*enter)

    score_vec = np.array([R, I, A, S, E, C])
    score_vec = score_vec / score_vec.sum()

    return score_vec


def normalize_career_rows(df):
    traits = ["Realistic", "Investigative", "Artistic",
              "Social", "Enterprising", "Conventional"]

    vecs = df[traits].astype(float).values
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms[norms == 0] = 1 

    df_norm = df.copy()
    df_norm[traits] = vecs / norms
    return df_norm


def get_recommendations(csv_path, logical, quant, analytical, verbal, spatial, creativity, enter, top_n=10):

    student_vec = compute_riasec(logical, quant, analytical, verbal, spatial, creativity, enter)

    df = pd.read_csv(csv_path)

    trait_cols = ["Realistic", "Investigative", "Artistic",
                  "Social", "Enterprising", "Conventional"]

    scores = []
    for _, row in df.iterrows():
        career_vec = row[trait_cols].values.astype(float)
        sim = cosine_similarity(student_vec, career_vec)
        scores.append(sim)

    df["Score"] = scores

    return df.sort_values(by="Score", ascending=False).head(top_n)


def career_to_course(career_list, career_course_dict):
    """
    career_list: list of career names returned by recommender1
    career_course_dict: {career → [courses]}
    returns: list of {"career": career, "courses": [...]}
    """
    result = []
    for career in career_list:
        courses = career_course_dict.get(career, [])
        if not courses:
            continue
        result.append({"career": career, "courses": courses})
    return result




def course_to_college(career_course_list, course_college_dict):
    """
    career_course_list: output of career_to_course
        e.g. [{"career": "X", "courses": ["c1", "c2"]}]
    course_college_dict: {course → [colleges]}
    returns:
      1) detailed list: [{"course": course, "colleges": [...]}, ...]
      2) unique list of all colleges (flat)
    """
    result = []
    unique_colleges = set()

    for entry in career_course_list:
        for course in entry["courses"]:
            colleges = course_college_dict.get(course, [])
            if not colleges:
                continue

            # add to detailed structure
            result.append({"course": course, "colleges": colleges})

            # collect unique colleges
            for col in colleges:
                unique_colleges.add(col)

    return result, sorted(unique_colleges)



