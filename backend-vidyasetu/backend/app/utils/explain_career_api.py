from .explain_career_helper import strongest_riasec_traits
from .llm_client import generate_text

def explain_career_with_llm(top_career, riasec_scores):
    top_traits = strongest_riasec_traits(riasec_scores, k=3)

    prompt = f"""
You are a professional career counselor.

A recommendation engine has selected the career "{top_career}" for a student.
You MUST NOT doubt or change the recommendation.

Student psychological strengths (RIASEC):
- {top_traits[0]}
- {top_traits[1] if len(top_traits) > 1 else ""}
- {top_traits[2] if len(top_traits) > 2 else ""}

Write a friendly, motivational explanation (3–5 sentences) describing:
- Why this career aligns with the student's strengths
- What aspects of the career would they enjoy
- No technical terms, no numeric scores, no algorithms
"""

    try:
        return generate_text(prompt)
    except Exception as e:
        print("Career explanation LLM error:", e)
        return f"{top_career} suits your strengths especially in {', '.join(top_traits)}."


def explain_careers_batch_with_llm(top_careers, riasec_scores):
    """
    Generates explanations for multiple careers in ONE LLM call.
    Returns dict: { career_name: explanation_text }
    """
    top_traits = strongest_riasec_traits(riasec_scores, k=3)
    
    # Build a numbered list for clearer parsing
    careers_list = "\n".join([f"{i+1}. {c}" for i, c in enumerate(top_careers)])
    
    prompt = f"""You are a professional career counselor.

A recommendation engine has selected the following careers for a student:
{careers_list}

Student psychological strengths (RIASEC):
- {top_traits[0]}
- {top_traits[1] if len(top_traits) > 1 else ""}
- {top_traits[2] if len(top_traits) > 2 else ""}

Write a friendly, motivational explanation (3-5 sentences) for EACH career describing:
- Why this specific career aligns with the student's strengths
- What aspects of the career would they enjoy
- No technical terms, no numeric scores, no algorithms

Format your response EXACTLY like this for each career (use the exact career name):

CAREER: {top_careers[0]}
EXPLANATION: <your explanation here>
---
CAREER: {top_careers[1] if len(top_careers) > 1 else "Second Career"}
EXPLANATION: <your explanation here>
---
(Continue for all {len(top_careers)} careers)
"""

    try:
        raw = generate_text(prompt)
        print(f"📝 Raw LLM career response length: {len(raw)}")
        
        explanation_dict = {}
        
        # Split by "CAREER:" (case insensitive)
        import re
        blocks = re.split(r'(?i)CAREER:\s*', raw)
        
        for block in blocks:
            block = block.strip()
            if not block:
                continue
            try:
                # Handle potential "---" separator
                clean_block = block.split("---")[0].strip()
                
                # Find the career name (first line or before EXPLANATION:)
                if "EXPLANATION:" in clean_block.upper():
                    parts = re.split(r'(?i)EXPLANATION:\s*', clean_block, maxsplit=1)
                    name = parts[0].strip().rstrip(':').strip()
                    expl = parts[1].strip() if len(parts) > 1 else ""
                else:
                    # Fallback: first line is name, rest is explanation
                    lines = clean_block.split("\n", 1)
                    name = lines[0].strip().rstrip(':').strip()
                    expl = lines[1].strip() if len(lines) > 1 else ""
                
                # Match to our career list (fuzzy match)
                matched_career = None
                for career in top_careers:
                    if career.lower() in name.lower() or name.lower() in career.lower():
                        matched_career = career
                        break
                
                if matched_career and expl:
                    explanation_dict[matched_career] = expl
                    print(f"   ✅ Matched: {matched_career}")
                elif name and expl:
                    # Use the name as-is if no match found
                    explanation_dict[name] = expl
                    print(f"   ⚠️ No exact match for: {name}")
                    
            except Exception as parse_err:
                print(f"   ❌ Parse error in block: {parse_err}")
                continue
        
        # Fallback: generate individual explanations for missing careers
        for career in top_careers:
            if career not in explanation_dict:
                print(f"   🔄 Generating fallback for: {career}")
                try:
                    single_exp = explain_career_with_llm(career, riasec_scores)
                    explanation_dict[career] = single_exp
                except:
                    explanation_dict[career] = f"{career} aligns well with your strengths in {', '.join(top_traits[:2])}."
                
        return explanation_dict
    except Exception as e:
        print(f"❌ Career batch explanation LLM error: {e}")
        # Return fallback explanations
        return {career: f"{career} aligns with your psychological profile." for career in top_careers}

