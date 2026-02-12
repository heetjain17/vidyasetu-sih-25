"""
Futuristic Career Generation Module
Uses OpenAI GPT to generate emerging/future career suggestions
Integrated with the chatbot system
"""

import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client only if API key is available
openai_client = None
if OPENAI_API_KEY:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def generate_futuristic_careers(
    interests: str = "",
    hobbies: List[str] = None,
    skills: List[str] = None,
    location: str = "India",
    current_field: str = "",
    num_careers: int = 5
) -> Dict[str, Any]:
    """
    Generate futuristic/emerging career suggestions using OpenAI GPT.
    
    These are careers that may become prominent in the next 5-20 years,
    focusing on technology, sustainability, and emerging industries.
    
    Args:
        interests: User's general interests as a string
        hobbies: List of hobbies
        skills: List of current skills
        location: User's location (for regional relevance)
        current_field: Current career interest/field
        num_careers: Number of career suggestions to generate
    
    Returns:
        Dict with futuristic careers and explanations
    """
    if not openai_client:
        return {
            "success": False,
            "error": "OpenAI API key not configured",
            "careers": []
        }
    
    # Build user profile string
    profile_parts = []
    if interests:
        profile_parts.append(f"Interests: {interests}")
    if hobbies:
        profile_parts.append(f"Hobbies: {', '.join(hobbies)}")
    if skills:
        profile_parts.append(f"Skills: {', '.join(skills)}")
    if location:
        profile_parts.append(f"Location: {location}")
    if current_field:
        profile_parts.append(f"Current field of interest: {current_field}")
    
    user_profile = "\n".join(profile_parts) if profile_parts else "General student looking for career guidance"
    
    prompt = f"""You are a futuristic career advisor specializing in emerging jobs and industries.

Generate {num_careers} FUTURISTIC/EMERGING career options that:
- Will be in high demand in the next 5-20 years
- Are NOT traditional careers (avoid: Software Engineer, Doctor, Teacher, Lawyer, Accountant)
- Focus on emerging technologies, sustainability, space, AI, biotech, metaverse, etc.

Examples of futuristic careers:
- AI Ethics Officer
- Space Tourism Guide
- Metaverse Architect
- Neural Interface Designer
- Climate Change Analyst
- Quantum Computing Specialist
- Digital Twin Engineer
- Synthetic Biology Designer
- Drone Traffic Controller
- Virtual Reality Therapist

User Profile:
{user_profile}

For EACH career, provide a JSON object with these fields:
- "title": The futuristic career title
- "description": 2-3 sentences about what this career involves
- "why_suitable": 1 sentence why this matches the user's profile
- "skills_needed": Array of 3-4 key skills required
- "getting_started": Array of 3-4 actionable steps to begin preparing
- "future_demand": "High", "Very High", or "Emerging"
- "salary_potential": "₹" followed by estimated annual range in lakhs

Return ONLY a valid JSON array of career objects. No markdown, no explanation text."""

    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a futuristic career advisor. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,  # Higher creativity for unique suggestions
            max_tokens=2000
        )
        
        raw_response = response.choices[0].message.content.strip()
        
        # Parse JSON response
        import json
        
        # Clean up response if needed
        if raw_response.startswith("```"):
            raw_response = raw_response.split("```")[1]
            if raw_response.startswith("json"):
                raw_response = raw_response[4:]
        raw_response = raw_response.strip()
        
        careers = json.loads(raw_response)
        
        return {
            "success": True,
            "careers": careers,
            "count": len(careers),
            "note": "These are emerging careers expected to grow in the next 5-20 years"
        }
        
    except json.JSONDecodeError as e:
        # If JSON parsing fails, return raw text
        return {
            "success": True,
            "careers_text": raw_response,
            "parse_error": str(e),
            "note": "Response generated but could not be parsed as JSON"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "careers": []
        }


def quick_futuristic_suggestions(query: str, num_suggestions: int = 3) -> str:
    """
    Quick futuristic career suggestions based on a simple query.
    Returns a formatted text response for chatbot integration.
    
    Args:
        query: User's question or interest
        num_suggestions: Number of suggestions to generate
    
    Returns:
        Formatted text with career suggestions
    """
    if not openai_client:
        return "I'm unable to generate futuristic career suggestions right now. Please try again later."
    
    prompt = f"""Based on this query: "{query}"

Suggest {num_suggestions} FUTURISTIC/EMERGING careers (not traditional jobs).
Focus on jobs that will exist in 5-20 years: AI, space, biotech, metaverse, sustainability, etc.

For each career, provide:
1. **Career Title** - A futuristic, interesting name
2. Why it fits - One sentence connection to the query
3. How to start - 2-3 quick steps to begin preparing

Keep it concise and engaging. Use emojis for visual appeal."""

    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=800
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        return f"Error generating suggestions: {str(e)}"


def is_futuristic_career_query(question: str) -> bool:
    """
    Detect if a question is asking about futuristic/emerging careers.
    Used by the chatbot to route to the futuristic career generator.
    """
    q_lower = question.lower()
    
    futuristic_keywords = [
        "futuristic", "future career", "future job", "emerging career",
        "new career", "upcoming career", "career of the future",
        "jobs of the future", "future profession", "career in 2030",
        "career in 2040", "next generation career", "innovative career",
        "cutting edge career", "modern career", "21st century career",
        "ai career", "tech career of future", "space career",
        "metaverse career", "what jobs will exist", "new age career",
        "career trends", "emerging jobs", "future opportunities"
    ]
    
    for keyword in futuristic_keywords:
        if keyword in q_lower:
            return True
    
    # Also check for pattern "future + career/job"
    if "future" in q_lower and any(w in q_lower for w in ["career", "job", "profession", "work"]):
        return True
    
    return False


# Structured response for API
def get_futuristic_careers_for_chatbot(question: str) -> Dict[str, Any]:
    """
    Main entry point for chatbot integration.
    Detects intent and generates appropriate futuristic career response.
    
    Returns a dict with:
    - answer: Text answer for the chatbot
    - futuristic_careers: Structured career data (if available)
    """
    # Generate quick text response
    text_response = quick_futuristic_suggestions(question, num_suggestions=4)
    
    # Also try to get structured data
    structured = generate_futuristic_careers(
        interests=question,
        num_careers=4
    )
    
    return {
        "answer": text_response,
        "futuristic_careers": structured.get("careers", []) if structured.get("success") else [],
        "is_futuristic_query": True
    }
