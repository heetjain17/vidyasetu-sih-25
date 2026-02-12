from .explain_college_helper import get_top_preferences, get_top_college_strengths   
from .llm_client import generate_text

def explain_multiple_colleges_with_llm(
    top_colleges: list,             
    student_actual_vector: dict,
    students_will_vector: dict,
    college_match_score: dict   
):
    """
    Generates explanations for 3 colleges in ONE LLM call.
    Returns dict: { college_name: explanation_text }
    """

    prefs = get_top_preferences(students_will_vector, k=3)

    summary_blocks = []
    for college in top_colleges:
        try:
            scores = college_match_score.get(college, [0.5, 0.5, 0.5, 0.5, 0.5])
            strengths = get_top_college_strengths(scores, k=3)
            summary_blocks.append(
                f"College: {college}\nStrengths: {', '.join(strengths)}"
            )
        except Exception:
            summary_blocks.append(f"College: {college}\nStrengths: General education")

    student_loc = student_actual_vector.get("Student_Locality", "")
    hobbies = ", ".join(student_actual_vector.get("Hobbies", []) or [])
    budget = student_actual_vector.get("Budget", "")

    prompt = f"""
You are an expert educational counselor.

A recommendation engine selected the following colleges for the student IN ORDER (do NOT change ranking):

Student details:
- Locality: {student_loc}
- Budget: {budget}
- Hobbies: {hobbies}

The student's top 3 preferences:
- {prefs[0]}
- {prefs[1] if len(prefs)>1 else ""}
- {prefs[2] if len(prefs)>2 else ""}

Now explain each college in 3–5 sentences.
IMPORTANT RULES:
- Keep a friendly motivational tone
- No numeric scores
- No algorithm or technical terms
- Explain WHY each college matches the student
- Write every explanation under its college name exactly in this format:

College: <name>
Explanation: <text>
---
(Repeat for all colleges)
    
Colleges and their strengths:
{chr(10).join(summary_blocks)}
"""

    raw = generate_text(prompt)

    explanation_dict = {}
    blocks = raw.split("College:")
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        try:
            name, rest = block.split("\n", 1)
            name = name.strip()
            if "Explanation:" in rest:
                expl = rest.split("Explanation:", 1)[1].strip()
                explanation_dict[name] = expl
        except:
            pass

    return explanation_dict
