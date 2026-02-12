import numpy as np

TRAIT_MAP = {
    0: "Realistic (hands-on / practical learning)",
    1: "Investigative (analysis, problem solving)",
    2: "Artistic (creativity, design, imagination)",
    3: "Social (teaching, helping, collaboration)",
    4: "Enterprising (leadership, persuasion)",
    5: "Conventional (organization, planning)",
}

def strongest_riasec_traits(riasec_scores, k=2):
    """
    riasec_scores must be list/array of 6 values [R, I, A, S, E, C]
    Returns top 2-3 strongest traits in human-readable form.
    """
    pairs = [(idx, score) for idx, score in enumerate(riasec_scores)]
    pairs.sort(key=lambda x: x[1], reverse=True)
    top = pairs[:k]
    return [TRAIT_MAP[i] for i, _ in top]
