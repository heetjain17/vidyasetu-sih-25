"""
OpenAI-based RAG Chatbot Service
Uses OpenAI for both embeddings and LLM with Qdrant vector search.
Includes guardrails for response validation and hallucination prevention.
"""

import os
from typing import AsyncGenerator, List, Tuple, Dict, Any, Optional
from dotenv import load_dotenv
from qdrant_client import QdrantClient

# Import guardrails for validation
from app.services.chatbot_guardrails import (
    apply_guardrails,
    validate_input,
    RAGGroundingValidator,
    InputValidator
)

load_dotenv()

# Environment variables
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION = os.getenv("QDRANT_COLLECTION_NAME", "college_career_knowledge_openai")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI clients only if API key is available
openai_client = None
async_openai_client = None

if OPENAI_API_KEY:
    from openai import OpenAI, AsyncOpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    async_openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# OpenAI model configuration
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")

# Qdrant client (lazy initialization)
_qdrant_client: Optional[QdrantClient] = None


def get_qdrant_client() -> QdrantClient:
    """Get or create Qdrant client."""
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    return _qdrant_client


# ---------- Embed the query using OpenAI ----------
def embed_query(question: str) -> List[float]:
    """Embed a query using OpenAI embeddings."""
    response = openai_client.embeddings.create(
        model=OPENAI_EMBED_MODEL,
        input=question
    )
    return response.data[0].embedding


# ---------- Query Qdrant ----------
def search_vectors(query_vector: List[float], limit: int = 24) -> List[Any]:
    """Return search results from Qdrant."""
    client = get_qdrant_client()
    result = client.query_points(
        collection_name=COLLECTION,
        query=query_vector,
        limit=limit
    )
    return result.points


# ---------- Utility: small normalization for fuzzy matching ----------
def _norm(s: str) -> str:
    return "".join(ch.lower() for ch in s if ch.isalnum()) if s else ""


# ---------- Query Expansion with Synonyms ----------
# Comprehensive mapping for better search coverage across all data
QUERY_EXPANSIONS = {
    # ===========================================
    # COURSE ABBREVIATIONS & SYNONYMS
    # ===========================================
    # Computer/IT Courses
    "bca": "Bachelor of Computer Applications BCA Computer Application software programming IT",
    "mca": "Bachelor of Computer Applications BCA Computer Application software MCA masters",
    "computer science": "BCA Computer Applications Information Technology Electronics software programming coding",
    "computer": "BCA Computer Applications Information Technology Electronics software",
    "it": "Information Technology BCA Computer Applications software",
    "information technology": "IT BCA Computer Applications Electronics software",
    "software": "BCA Computer Applications Information Technology programming coding developer",
    "programming": "BCA Computer Applications Information Technology software coding developer",
    "coding": "BCA Computer Applications Information Technology software programming",
    
    # Commerce/Business Courses
    "bcom": "Bachelor of Commerce BCom Commerce Accounting Finance Business",
    "bba": "Bachelor of Business Administration BBA Management Business Commerce",
    "commerce": "BCom Bachelor of Commerce Accounting Finance Business Taxation",
    "accounting": "BCom Commerce Accounting Taxation Finance CA",
    "finance": "BCom Commerce Accounting Finance Banking BBA",
    "business": "BBA Bachelor of Business Administration Commerce Management Marketing",
    "management": "BBA Business Administration Commerce Management Marketing MBA",
    "mba": "BBA Business Administration Management Commerce",
    "marketing": "BBA Business Administration Marketing Management Commerce",
    "taxation": "BCom Commerce Accounting Taxation Finance",
    "ca": "BCom Commerce Accounting Taxation Chartered Accountant",
    
    # Arts/Humanities Courses
    "ba": "Bachelor of Arts BA Arts Humanities English History Political Science",
    "arts": "BA Bachelor of Arts Humanities English History Sociology Philosophy",
    "humanities": "BA Arts English History Philosophy Sociology Psychology",
    "english": "BA English Literature Arts Humanities",
    "hindi": "BA Hindi Literature Arts Humanities",
    "history": "BA History Arts Humanities Political Science",
    "political science": "BA Political Science History Public Administration Sociology",
    "politics": "BA Political Science History Public Administration",
    "sociology": "BA Sociology Psychology Arts Humanities Social Work",
    "psychology": "BA Psychology Sociology Arts Humanities Counseling",
    "philosophy": "BA Philosophy Arts Humanities",
    "economics": "BA Economics Commerce Finance Statistics",
    "education": "BA Education Teaching Arts Humanities",
    "urdu": "BA Urdu Literature Arts Humanities",
    "kashmiri": "BA Kashmiri Literature Arts Humanities",
    "dogri": "BA Dogri Literature Arts Humanities",
    "punjabi": "BA Punjabi Literature Arts Humanities",
    "arabic": "BA Arabic Literature Arts Humanities Islamic Studies",
    "persian": "BA Persian Literature Arts Humanities",
    "sanskrit": "BA Sanskrit Literature Arts Humanities",
    "journalism": "BA Mass Communication Journalism Media Multimedia",
    "mass communication": "BA Journalism Mass Communication Media Multimedia",
    "media": "BA Journalism Mass Communication Multimedia Arts",
    "music": "BA Music Arts Humanities",
    
    # Science Courses
    "bsc": "Bachelor of Science BSc Science Physics Chemistry Mathematics Biology",
    "science": "BSc Bachelor of Science Physics Chemistry Mathematics Biology Botany Zoology Biotechnology",
    "physics": "BSc Physics Science Mathematics Electronics",
    "chemistry": "BSc Chemistry Science Biochemistry",
    "mathematics": "BSc Mathematics Science Physics Statistics",
    "maths": "BSc Mathematics Science Physics Statistics",
    "statistics": "BSc Statistics Mathematics Science Data",
    "biology": "BSc Biotechnology Biochemistry Zoology Botany Life Sciences",
    "biotechnology": "BSc Biotechnology Biochemistry Life Sciences Biology",
    "biochemistry": "BSc Biochemistry Biotechnology Chemistry Life Sciences",
    "botany": "BSc Botany Biology Life Sciences Environmental Science",
    "zoology": "BSc Zoology Biology Life Sciences Biotechnology",
    "electronics": "BSc Electronics Physics BCA Information Technology",
    "environmental": "BSc Environmental Science Botany Geology Geography",
    "geography": "BSc Geography Environmental Science Arts",
    "geology": "BSc Geology Environmental Science Geography",
    "nanotechnology": "BSc NanoScience NanoTechnology Physics Chemistry",
    "home science": "BSc Home Science Science",
    "food science": "BSc Food Science Technology Nutrition",
    "anthropology": "BSc Anthropology Sociology History Archaeology",
    
    # ===========================================
    # CAREER QUERIES
    # ===========================================
    # Technical/Engineering Careers
    "engineering": "Electronics BCA Information Technology Physics Mathematics technical BTech",
    "engineer": "Electronics BCA Information Technology Physics Mathematics technical",
    "btech": "Electronics BCA Information Technology Physics Mathematics Engineering technical",
    "technical": "Electronics BCA Information Technology Physics Engineering",
    "software developer": "BCA Computer Applications Information Technology programming coding",
    "software engineer": "BCA Computer Applications Information Technology programming coding",
    "web developer": "BCA Computer Applications Information Technology programming",
    "app developer": "BCA Computer Applications Information Technology programming",
    "data scientist": "Statistics Mathematics BCA Computer Applications IT",
    "data analyst": "Statistics Mathematics BCA Computer Applications Economics",
    "machine learning": "Statistics Mathematics BCA Computer Applications IT AI",
    "ai": "BCA Computer Applications Mathematics Statistics Information Technology artificial intelligence",
    "artificial intelligence": "BCA Computer Applications Mathematics Statistics IT",
    "cyber security": "BCA Information Technology Electronics Computer Applications",
    "networking": "BCA Information Technology Electronics Computer Applications",
    "hardware": "Electronics Physics BCA Information Technology",
    "mechatronics": "Electronics Physics Mathematics BCA Information Technology",
    
    # Medical/Healthcare Careers
    "doctor": "Biotechnology Biochemistry Zoology Botany Life Sciences medical healthcare MBBS",
    "medical": "Biotechnology Biochemistry Zoology Botany Life Sciences healthcare",
    "healthcare": "Biotechnology Biochemistry Zoology Botany Psychology",
    "mbbs": "Biotechnology Biochemistry Zoology Botany Life Sciences medical",
    "nurse": "Biotechnology Biochemistry Zoology Life Sciences healthcare",
    "pharmacy": "Biochemistry Chemistry Biotechnology Life Sciences",
    "pharmacist": "Biochemistry Chemistry Biotechnology Life Sciences",
    "lab technician": "Biotechnology Biochemistry Chemistry Physics",
    "veterinary": "Zoology Biotechnology Life Sciences Biology",
    "biologist": "Biotechnology Biochemistry Zoology Botany Life Sciences",
    "researcher": "Biotechnology Biochemistry Zoology Botany Physics Chemistry Mathematics Statistics",
    
    # Business/Finance Careers
    "banker": "BCom Commerce Finance Accounting BBA",
    "bank": "BCom Commerce Finance Accounting BBA Economics",
    "accountant": "BCom Commerce Accounting Taxation Finance",
    "chartered accountant": "BCom Commerce Accounting Taxation Finance CA",
    "tax consultant": "BCom Commerce Accounting Taxation Finance",
    "financial analyst": "BCom Commerce Finance Economics Statistics BBA",
    "entrepreneur": "BBA Business Administration Commerce Management",
    "businessman": "BBA Business Administration Commerce Management",
    "manager": "BBA Business Administration Management Commerce",
    "hr": "BBA Business Administration Management Psychology",
    "human resources": "BBA Business Administration Management Psychology",
    "sales": "BBA Business Administration Marketing Management Commerce",
    "marketing manager": "BBA Business Administration Marketing Management",
    
    # Government/Civil Services Careers
    "upsc": "Political Science History Public Administration Economics Sociology",
    "ias": "Political Science History Public Administration Economics",
    "civil services": "Political Science History Public Administration Economics Sociology",
    "government job": "Political Science Public Administration Economics Sociology",
    "police": "Political Science Sociology Psychology Public Administration",
    "administrative": "Public Administration Political Science Sociology",
    
    # Teaching/Education Careers
    "teacher": "BA Education English Hindi History Political Science",
    "professor": "BA BSc Education Arts Science",
    "lecturer": "BA BSc Education Arts Science Masters",
    "teaching": "BA Education English Hindi History",
    "school teacher": "BA Education Arts Humanities",
    "counselor": "Psychology Sociology Education",
    "career counselor": "Psychology Sociology",
    
    # Creative/Media Careers
    "journalist": "BA Mass Communication Journalism English",
    "writer": "BA English Literature Hindi Urdu",
    "photographer": "BA Mass Communication Multimedia",
    "filmmaker": "BA Mass Communication Multimedia Journalism",
    "content creator": "BA Mass Communication Journalism English",
    "public relations": "BA Mass Communication Journalism English Marketing",
    
    # Science/Research Careers
    "scientist": "BSc Physics Chemistry Mathematics Biotechnology Biochemistry",
    "astronomer": "BSc Physics Mathematics",
    "chemist": "BSc Chemistry Biochemistry",
    "physicist": "BSc Physics Mathematics Electronics",
    "mathematician": "BSc Mathematics Statistics Physics",
    "statistician": "BSc Statistics Mathematics Economics",
    "geologist": "BSc Geology Geography Environmental Science",
    "environmental scientist": "BSc Environmental Science Botany Geology",
    
    # ===========================================
    # J&K DISTRICTS
    # ===========================================
    "jammu": "Jammu district Government Degree College GDC",
    "srinagar": "Srinagar Kashmir district Government Degree College GDC",
    "kashmir": "Srinagar Kashmir Valley Government Degree College",
    "anantnag": "Anantnag district South Kashmir Government Degree College",
    "baramulla": "Baramulla district North Kashmir Government Degree College",
    "pulwama": "Pulwama district South Kashmir Government Degree College",
    "budgam": "Budgam district Central Kashmir Government Degree College",
    "kupwara": "Kupwara district North Kashmir Government Degree College",
    "bandipora": "Bandipora district North Kashmir Government Degree College",
    "ganderbal": "Ganderbal district Central Kashmir Government Degree College",
    "shopian": "Shopian district South Kashmir Government Degree College",
    "kulgam": "Kulgam district South Kashmir Government Degree College",
    "kathua": "Kathua district Jammu Government Degree College",
    "udhampur": "Udhampur district Jammu Government Degree College",
    "doda": "Doda district Jammu Government Degree College Bhaderwah",
    "ramban": "Ramban district Jammu Government Degree College",
    "kishtwar": "Kishtwar district Jammu Government Degree College",
    "rajouri": "Rajouri district Jammu Government Degree College",
    "poonch": "Poonch district Jammu Government Degree College",
    "samba": "Samba district Jammu Government Degree College",
    "reasi": "Reasi district Jammu Government Degree College",
    
    # ===========================================
    # COMMON QUERY PATTERNS
    # ===========================================
    "best": "top ranked good quality popular",
    "top": "best ranked good quality popular",
    "good": "best top quality popular",
    "cheap": "affordable low fees budget government",
    "affordable": "cheap low fees budget government",
    "low fees": "cheap affordable budget government",
    "hostel": "accommodation stay living residential",
    "accommodation": "hostel stay living residential",
    "girls college": "women college for girls GCW",
    "women college": "girls college for women GCW",
    "government": "GDC Government Degree College state",
    "private": "private college self financed",
    "admission": "admission seats eligibility intake",
    "eligibility": "admission qualification requirements",
    "placement": "job recruitment campus placement career",
    "job": "career placement employment work profession",
    "career": "job profession work employment placement",
    "salary": "job career income earnings pay",
    "scope": "future career opportunities prospects job",
    "future": "scope career opportunities prospects",
    
    # ===========================================
    # QUESTION PATTERNS
    # ===========================================
    "which": "what colleges courses options available",
    "how to become": "career path courses colleges requirements",
    "what should i study": "course recommendation best courses",
    "where can i study": "colleges institutions available locations",
    "tell me about": "information details overview",
    "compare": "comparison difference between vs versus",
    "difference between": "compare comparison vs versus",
}


def expand_query(question: str) -> str:
    """Expand query with synonyms for better search coverage."""
    expanded = question
    q_lower = question.lower()
    for term, synonyms in QUERY_EXPANSIONS.items():
        if term in q_lower:
            expanded += f" {synonyms}"
    return expanded


# ---------- LLM Query Rewriting (Phase 2) ----------
QUERY_REWRITE_PROMPT = """You are a query optimizer for a J&K (Jammu & Kashmir) college and career guidance database.

Your task: Rewrite the user's query to improve search results. Add relevant terms that will help find better matches.

Database contains:
- 136 colleges across 20 districts in J&K (Government Degree Colleges, Women's Colleges)
- 215 courses (BCA, BCom, BBA, BA, BSc in various subjects)
- 132 career paths with recommended courses
- College details: fees, hostel availability, district location

RULES:
1. Keep the original intent but expand with relevant search terms
2. Add course abbreviations if mentioned (e.g., "computer" → add "BCA Computer Applications")
3. Add district names if location mentioned (e.g., "Jammu" → add "Jammu district GDC")
4. For careers, add related courses (e.g., "software developer" → add "BCA IT programming")
5. Fix any spelling mistakes
6. Keep response SHORT (max 50 words) - just the optimized search query
7. Don't add explanations, just the rewritten query

Examples:
- "I want to become a doctor" → "career doctor medical MBBS healthcare biotechnology biochemistry zoology courses colleges J&K"
- "BCA in Jammu" → "BCA Bachelor of Computer Applications computer Jammu district Government Degree College GDC"
- "cheap colleges" → "affordable low fees government degree college GDC budget hostel facilities J&K"
- "what after 12th science" → "science stream courses BSc physics chemistry biology mathematics biotechnology colleges career options"

User query: {question}

Optimized search query:"""


def rewrite_query_with_llm(question: str) -> str:
    """
    Use LLM to intelligently rewrite the query for better vector search.
    Falls back to keyword expansion if LLM fails.
    """
    if not openai_client:
        # Fallback to keyword expansion if OpenAI not available
        return expand_query(question)
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Fast and cheap
            messages=[
                {"role": "user", "content": QUERY_REWRITE_PROMPT.format(question=question)}
            ],
            temperature=0.3,  # Low temperature for consistent results
            max_tokens=100,  # Keep it short
            timeout=5  # 5 second timeout
        )
        
        rewritten = response.choices[0].message.content.strip()
        
        # Combine original query + LLM rewrite + keyword expansion for best coverage
        combined = f"{question} {rewritten}"
        
        # Also apply keyword expansion for terms LLM might have missed
        final_query = expand_query(combined)
        
        return final_query
        
    except Exception as e:
        # If LLM fails, fall back to keyword expansion
        print(f"LLM query rewrite failed: {e}")
        return expand_query(question)


def smart_expand_query(question: str, use_llm: bool = True) -> str:
    """
    Smart query expansion that combines LLM rewriting with keyword expansion.
    
    Args:
        question: Original user question
        use_llm: Whether to use LLM rewriting (disable for speed if needed)
    
    Returns:
        Expanded query optimized for vector search
    """
    if use_llm and openai_client:
        return rewrite_query_with_llm(question)
    else:
        return expand_query(question)


# ---------- Build context from search results (Phase 3 Enhanced) ----------
def detect_query_intent(question: str) -> dict:
    """
    Enhanced intent detection for better context building.
    Returns a dict with boolean flags for different intents.
    """
    q_lower = question.lower()
    
    return {
        # Primary intents
        "wants_college": any(w in q_lower for w in [
            "college", "colleges", "institution", "university", "universities",
            "where to study", "study at", "admission", "gdc", "gcw",
            "government degree college", "best college", "top college"
        ]),
        "wants_course": any(w in q_lower for w in [
            "course", "courses", "degree", "degrees", "program", "programmes",
            "subject", "subjects", "what to study", "which course", "stream",
            "bca", "bcom", "bba", "bsc", "ba", "honours", "major"
        ]),
        "wants_career": any(w in q_lower for w in [
            "career", "careers", "job", "jobs", "profession", "become", 
            "work as", "employment", "salary", "scope", "future",
            "what can i do", "after 12th", "after graduation"
        ]),
        
        # Specific attribute intents
        "wants_hostel": any(w in q_lower for w in [
            "hostel", "accommodation", "stay", "living", "residential"
        ]),
        "wants_fees": any(w in q_lower for w in [
            "fee", "fees", "cost", "affordable", "cheap", "budget", 
            "low cost", "scholarship", "expense"
        ]),
        "wants_location": any(w in q_lower for w in [
            "jammu", "srinagar", "kashmir", "anantnag", "baramulla", 
            "pulwama", "budgam", "kupwara", "kathua", "udhampur",
            "doda", "rajouri", "poonch", "district", "near", "location"
        ]),
        "wants_girls_college": any(w in q_lower for w in [
            "girls", "women", "ladies", "gcw", "for girls", "women's college"
        ]),
        
        # Query modifiers
        "wants_comparison": any(w in q_lower for w in [
            "compare", "vs", "versus", "difference", "better", "best"
        ]),
        "wants_list": any(w in q_lower for w in [
            "list", "all", "available", "options", "which", "what are"
        ]),
    }


def build_context(matches: List[Any], question: str) -> Tuple[str, List[Tuple]]:
    """
    Enhanced context building with better scoring, deduplication, and formatting.
    Phase 3: Produces cleaner, more relevant context for the LLM.
    """
    q_lower = question.lower()
    intent = detect_query_intent(question)
    
    scored_results = []
    seen_names = set()  # For deduplication
    
    for hit in matches:
        payload = hit.payload
        data_type = payload.get("type", "")
        base_score = hit.score if hasattr(hit, 'score') else 0
        bonus = 0
        
        # ----- COLLEGE or COLLEGE_INFO type -----
        if data_type in ["college", "college_info"]:
            name = payload.get("college_name", "Unknown")
            district = payload.get("district", "")
            state = payload.get("state", "Jammu and Kashmir")
            hostel = payload.get("hostel", payload.get("Hostel", "No"))
            fees = payload.get("fees", payload.get("Fees", ""))
            course = payload.get("course_name", "")
            
            # Deduplication
            name_key = _norm(name)
            if name_key in seen_names:
                continue
            seen_names.add(name_key)
            
            # Build structured text
            text_parts = [f"**{name}**"]
            text_parts.append(f"Location: {district}, {state}")
            if course:
                text_parts.append(f"Offers: {course}")
            text_parts.append(f"Hostel: {hostel}")
            if fees:
                text_parts.append(f"Fees: ₹{fees}")
            
            text = " | ".join(text_parts)
            
            # Smart scoring
            if intent["wants_college"]:
                bonus += 5
            if intent["wants_hostel"] and hostel.lower() == "yes":
                bonus += 8  # High bonus for hostel availability
            if intent["wants_fees"]:
                bonus += 3
            if intent["wants_location"] and district.lower() in q_lower:
                bonus += 10  # High bonus for location match
            if intent["wants_girls_college"] and ("women" in name.lower() or "gcw" in name.lower()):
                bonus += 8
            if name and _norm(name) in _norm(question):
                bonus += 12  # Very high for exact name match
            if course and _norm(course) in _norm(question):
                bonus += 6
                
            scored_results.append((base_score + bonus, text, payload, "college"))
        
        # ----- COURSE type -----
        elif data_type == "course":
            name = payload.get("course_name", "Unknown")
            stream = payload.get("stream", "")
            
            # Deduplication
            name_key = _norm(name)
            if name_key in seen_names:
                continue
            seen_names.add(name_key)
            
            text = f"**{name}** - {stream} stream"
            
            if intent["wants_course"]:
                bonus += 5
            if name and _norm(name) in _norm(question):
                bonus += 10
            if stream and stream.lower() in q_lower:
                bonus += 4
            
            # Boost common course searches
            course_lower = name.lower()
            for keyword in ["bca", "bcom", "bba", "bsc", "ba ", "computer", "it"]:
                if keyword in q_lower and keyword in course_lower:
                    bonus += 8
                    break
                    
            scored_results.append((base_score + bonus, text, payload, "course"))
        
        # ----- CAREER TO COURSE mapping -----
        elif data_type == "career_to_course":
            career = payload.get("career_name", "Unknown")
            courses = payload.get("courses", [])[:8]  # More courses
            
            # Deduplication
            career_key = _norm(career)
            if career_key in seen_names:
                continue
            seen_names.add(career_key)
            
            courses_str = ", ".join(courses) if courses else "Various courses"
            text = f"**Career: {career}** → Recommended courses: {courses_str}"
            
            if intent["wants_career"]:
                bonus += 8
            if career and _norm(career) in _norm(question):
                bonus += 15  # Very high for career match
            
            # Check for related career keywords
            career_lower = career.lower()
            for kw in ["engineer", "doctor", "teacher", "scientist", "accountant", "manager"]:
                if kw in q_lower and kw in career_lower:
                    bonus += 10
                    break
                    
            scored_results.append((base_score + bonus, text, payload, "career"))
        
        # ----- COURSE TO COLLEGE mapping -----
        elif data_type == "course_to_college":
            course = payload.get("course_name", "Unknown")
            colleges = payload.get("colleges", [])[:8]  # More colleges
            
            # Deduplication
            course_key = _norm(course)
            if course_key in seen_names:
                continue
            seen_names.add(course_key)
            
            colleges_str = ", ".join(colleges) if colleges else "Multiple colleges"
            text = f"**{course}** is offered at: {colleges_str}"
            
            if intent["wants_college"] or intent["wants_course"]:
                bonus += 5
            if course and _norm(course) in _norm(question):
                bonus += 10
            
            # High bonus for specific course matches
            course_lower = course.lower()
            for keyword in ["computer", "bca", "bcom", "bba", "bsc", "ba ", "biotechnology", "psychology"]:
                if keyword in q_lower and keyword in course_lower:
                    bonus += 12
                    break
                    
            scored_results.append((base_score + bonus, text, payload, "course_colleges"))
        
        # ----- FALLBACK for unknown types -----
        else:
            text_parts = []
            for key in ["text", "topic", "college_name", "course_name", "career_name"]:
                if key in payload and payload[key]:
                    text_parts.append(str(payload[key]))
            
            if text_parts:
                text = " - ".join(text_parts[:3])
                scored_results.append((base_score, text, payload, "other"))
    
    # Sort by score (highest first)
    scored_results.sort(key=lambda x: x[0], reverse=True)
    
    # Take top results with type diversity
    top_results = []
    type_counts = {"college": 0, "course": 0, "career": 0, "course_colleges": 0, "other": 0}
    max_per_type = 5  # Limit per type for diversity
    
    for result in scored_results:
        result_type = result[3]
        if type_counts.get(result_type, 0) < max_per_type and len(top_results) < 15:
            top_results.append(result)
            type_counts[result_type] = type_counts.get(result_type, 0) + 1
    
    # Build structured context with sections
    context_sections = {
        "career": [],
        "course": [],
        "college": [],
        "course_colleges": [],
        "other": []
    }
    
    for score, text, payload, result_type in top_results:
        context_sections[result_type].append(text)
    
    # Format context with clear sections
    context_parts = []
    
    if context_sections["career"]:
        context_parts.append("=== CAREER INFORMATION ===")
        context_parts.extend(context_sections["career"])
        context_parts.append("")
    
    if context_sections["course"]:
        context_parts.append("=== AVAILABLE COURSES ===")
        context_parts.extend(context_sections["course"])
        context_parts.append("")
    
    if context_sections["course_colleges"]:
        context_parts.append("=== COURSES & COLLEGES ===")
        context_parts.extend(context_sections["course_colleges"])
        context_parts.append("")
    
    if context_sections["college"]:
        context_parts.append("=== COLLEGES ===")
        context_parts.extend(context_sections["college"])
        context_parts.append("")
    
    if context_sections["other"]:
        context_parts.append("=== OTHER INFORMATION ===")
        context_parts.extend(context_sections["other"])
    
    # If no structured content, fall back to simple list
    if not context_parts:
        for _, text, _, _ in top_results:
            context_parts.append(text)
    
    return "\n".join(context_parts), [(s, t, p) for s, t, p, _ in top_results]


# ---------- Classify Intent ----------
def classify_intent(message: str) -> str:
    """Classify user message intent using keyword matching for speed."""
    msg_lower = message.lower().strip()
    
    # Very short messages or single words
    if len(msg_lower) < 1:
        return "unclear"
    
    # Greetings
    greetings = ["hello", "hi", "hey", "hola", "namaste", "good morning", "good evening", "good afternoon"]
    for g in greetings:
        if msg_lower.startswith(g) or msg_lower == g:
            return "greeting"
    
    # Farewells
    farewells = ["bye", "goodbye", "see you", "thanks bye", "take care", "good night"]
    for f in farewells:
        if f in msg_lower:
            return "farewell"
    
    # Gratitude
    gratitude = ["thank", "thanks", "thank you", "appreciated", "grateful", "thx"]
    for t in gratitude:
        if t in msg_lower:
            return "gratitude"
    
    # Bot identity
    bot_identity = ["who are you", "what are you", "your name", "about you", "introduce yourself"]
    for b in bot_identity:
        if b in msg_lower:
            return "bot_identity"
    
    # Personal chitchat
    chitchat = ["how are you", "what's up", "how do you do", "wassup", "whats up"]
    for c in chitchat:
        if c in msg_lower:
            return "personal_chitchat"
    
    # OFF-TOPIC GUARDRAILS - detect queries not related to J&K education
    off_topic_keywords = [
        # Entertainment
        "movie", "movies", "song", "songs", "music", "singer", "actor", "actress", "film",
        "cricket", "football", "sports team", "ipl", "world cup",
        # Technology products
        "iphone", "android", "laptop", "mobile", "phone", "gaming",
        # General knowledge unrelated
        "weather", "news", "politics", "election", "war", "covid", "stock market",
        # Food/recipes
        "recipe", "cooking", "restaurant", "food",
        # Travel (non-education)
        "hotel", "tourism", "flight", "vacation",
        # Relationships
        "girlfriend", "boyfriend", "dating", "marriage",
        # Other random
        "joke", "funny", "meme", "game"
    ]
    
    # Check if message is clearly off-topic (only if no education keywords present)
    education_present = any(k in msg_lower for k in [
        "college", "course", "career", "job", "study", "degree", "admission", 
        "bca", "bcom", "bba", "bsc", "ba", "hostel", "fees", "placement",
        "science", "arts", "commerce", "engineering", "medical", "teacher",
        "jammu", "kashmir", "srinagar", "university", "education"
    ])
    
    if not education_present:
        for ot in off_topic_keywords:
            if ot in msg_lower:
                return "off_topic"
    
    # EDUCATION-RELATED INTENT CLASSIFICATION
    # Career-focused queries
    career_keywords = [
        "career", "job", "profession", "become", "work as", "salary", "future",
        "scope", "opportunities", "employment", "placement", "how to become",
        "what career", "which career", "career after", "job after", "want to be",
        "dream job", "profession after"
    ]
    
    # College-focused queries
    college_keywords = [
        "college", "university", "institute", "institution", "admission",
        "hostel", "fees", "campus", "infrastructure", "gdc", "gcw",
        "government degree college", "which college", "best college", "top college",
        "colleges in", "college for", "where to study", "study at"
    ]
    
    # Course-focused queries
    course_keywords = [
        "course", "courses", "degree", "program", "bca", "bcom", "bba", "bsc", "ba",
        "honours", "major", "stream", "subject", "what to study", "which course",
        "best course", "course for", "eligibility"
    ]
    
    # Check for career intent
    for k in career_keywords:
        if k in msg_lower:
            return "career_query"
    
    # Check for college intent
    for k in college_keywords:
        if k in msg_lower:
            return "college_query"
    
    # Check for course intent
    for k in course_keywords:
        if k in msg_lower:
            return "course_query"
    
    # Check if any district name is mentioned
    jk_districts = [
        "jammu", "srinagar", "kashmir", "anantnag", "baramulla", "pulwama", "budgam",
        "kupwara", "bandipora", "ganderbal", "shopian", "kulgam", "kathua", "udhampur",
        "doda", "ramban", "kishtwar", "rajouri", "poonch", "samba", "reasi"
    ]
    for district in jk_districts:
        if district in msg_lower:
            return "location_query"
    
    # Default to general educational query (will try RAG)
    return "general_query"


# ---------- Quick responses for non-RAG intents ----------
QUICK_RESPONSES = {
    "greeting": "Hello! 😊 I'm your J&K Education Assistant. I can help you with:\n• Finding colleges in Jammu & Kashmir\n• Exploring career options and courses\n• College fees, hostel facilities\n• Course recommendations\n\nWhat would you like to know?",
    
    "farewell": "Goodbye! 👋 Best wishes for your academic journey. Feel free to come back anytime for college or career guidance!",
    
    "gratitude": "You're welcome! 🤝 Happy to help. If you have more questions about colleges or careers, just ask!",
    
    "bot_identity": "I am an AI-powered education assistant specifically trained to help you navigate colleges, courses, and career paths in Jammu & Kashmir. 🎓",
    
    "personal_chitchat": "I'm doing great, thanks for asking! 🤖 I'm ready to help you find the best college or career path. What are you looking for?",
    
    "off_topic": "I specialize in education and career guidance for Jammu & Kashmir. 📚\nPlease ask me about colleges, courses, admissions, or career paths, and I'll be happy to help!",
    
    "unclear": "I didn't quite catch that. Could you please ask about colleges, courses, or careers in J&K? 🤔"
}


# ---------- The Main RAG Function (Sync) ----------
def rag_answer(question: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Main RAG pipeline:
    1. Input validation & safety check
    2. Intent classification (handle greeting/off-topic)
    3. Query expansion/rewriting (LLM + Keyword)
    4. Retrieval (similarity search)
    5. Context building & Deduplication
    6. LLM Generation
    7. Output Guardrails (Hallucination check)
    
    Returns:
        (result_dict, sources_list)
    """
    if not openai_client:
        return {"answer": "OpenAI API key not configured.", "is_valid": False}, []
    
    # 1. Input Validation
    validation = validate_input(question)
    if not validation["valid"]:
        return {
            "answer": f"Input rejected: {validation['reason']}",
            "is_valid": False,
            "issues": ["Input validation failed"]
        }, []
    
    sanitized_question = validation["sanitized"]
    
    # 2. Intent Check
    intent = classify_intent(sanitized_question)
    if intent in QUICK_RESPONSES:
        return {
            "answer": QUICK_RESPONSES[intent],
            "is_valid": True,
            "confidence": 1.0,
            "is_grounded": True
        }, []
    
    try:
        # 3. Smart Query Expansion
        search_query = smart_expand_query(sanitized_question, use_llm=True)
        # print(f"Original: {question} | Expanded: {search_query}")
        
        # 4. Retrieval - Embed & Search
        vector = embed_query(search_query)
        matches = search_vectors(vector, limit=20)  # Fetch more to allow for filtering
        
        # 5. Build Context
        context_str, top_hits = build_context(matches, sanitized_question)
        
        if not context_str.strip():
            return {
                "answer": "I couldn't find specific information matching your query in our J&K education database. Could you try rephrasing or asking about a specific college or course?",
                "is_valid": True,
                "confidence": 0.0,
                "is_grounded": True  # Technically grounded as it refuses to answer
            }, []

        # 6. LLM Generation
        sys_prompt = """You are a helpful, accurate education counselor for Jammu & Kashmir students.
        Use ONLY the provided Context to answer the user's question.
        
        Guidelines:
        - Be encouraging and professional.
        - If the answer is in the Context, provide it clearly.
        - If the Context mentions multiple colleges/courses, summarize them efficiently.
        - If the answer is NOT in the Context, say you don't have that specific information.
        - DO NOT HALLUCINATE or make up colleges/fees/courses not in the text.
        - Formatting: Use bullet points for lists. Use bold for key terms.
        
        Context:
        {context}
        """
        
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": sys_prompt.format(context=context_str)},
                {"role": "user", "content": sanitized_question},
            ],
            temperature=0.3, # Low temp for factual answers
        )
        
        raw_answer = response.choices[0].message.content.strip()
        
        # 7. Apply Guardrails (Output Validation)
        # We validate if the answer is grounded in the context we retrieved
        guardrail_result = apply_guardrails(
            response=raw_answer,
            context=context_str,
            question=sanitized_question,
            validate_grounding=True
        )
        
        final_answer = guardrail_result["final_response"]
        
        # Prepare result dict
        result = {
            "answer": final_answer,
            "is_valid": guardrail_result["is_valid"],
            "is_grounded": guardrail_result["is_grounded"],
            "confidence": guardrail_result["confidence"],
            "intent": intent
        }
        
        # Prepare sources
        sources = []
        for score, text, payload in top_hits[:5]:
            sources.append({
                "source": text,
                "score": score,
                "type": payload.get("type", "unknown")
            })
            
        return result, sources

    except Exception as e:
        print(f"RAG Error: {e}")
        return {
            "answer": "I encountered an error while searching for information. Please try again later.",
            "is_valid": False,
            "error": str(e)
        }, []



# ---------- Async Wrapper (Optional) ----------
async def rag_answer_async(question: str) -> Dict[str, Any]:
    """Async wrapper for the RAG pipeline suitable for FastAPI endpoints."""
    # Note: For true async, we'd need async versions of embed/search/chat
    # This is a synchronous wrapper for now
    result, sources = rag_answer(question)
    
    # Add sources to the result for the frontend
    if sources:
        result["sources"] = sources
        
    return result


# ---------- Streaming RAG Function ----------
async def rag_answer_stream(question: str) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Streaming RAG pipeline:
    1. Input validation
    2. Intent classification
    3. Retrieval
    4. Streaming LLM generation
    5. Post-generation guardrails check (logged/flagged)
    """
    if not async_openai_client:
        yield {"type": "error", "content": "OpenAI API key not configured."}
        return

    # 1. Input Validation
    validation = validate_input(question)
    if not validation["valid"]:
        yield {"type": "error", "content": f"Input rejected: {validation['reason']}"}
        return

    sanitized_question = validation["sanitized"]

    # 2. Intent Check
    intent = classify_intent(sanitized_question)
    if intent in QUICK_RESPONSES:
        # Simulate streaming for quick responses
        response_text = QUICK_RESPONSES[intent]
        # Split by words for effect
        words = response_text.split(" ")
        for i, word in enumerate(words):
            yield {"type": "token", "content": word + (" " if i < len(words)-1 else "")}
            # Add a small delay if needed, but usually not for async generator
        
        yield {
            "type": "complete", 
            "answer": response_text,
            "sources": [],
            "is_valid": True,
            "intent": intent
        }
        return

    try:
        # 3. Retrieval
        # Use sync methods for now (embed/search) inside async wrapper if needed, 
        # but for simplicity we call them directly as they are fast enough or should be asyncified later.
        # Ideally embed_query should be async.
        search_query = smart_expand_query(sanitized_question, use_llm=True)
        vector = embed_query(search_query) # This is sync, might block slightly
        matches = search_vectors(vector, limit=20)
        
        context_str, top_hits = build_context(matches, sanitized_question)
        
        if not context_str.strip():
            fallback = "I couldn't find specific information matching your query."
            yield {"type": "token", "content": fallback}
            yield {"type": "complete", "answer": fallback, "sources": [], "is_valid": True}
            return

        # 4. Streaming LLM Generation
        sys_prompt = """You are a helpful, accurate education counselor for Jammu & Kashmir students.
        Use ONLY the provided Context to answer the user's question.
        
        Guidelines:
        - Be encouraging and professional.
        - If the answer is in the Context, provide it clearly.
        - If the Context mentions multiple colleges/courses, summarize them efficiently.
        - If the answer is NOT in the Context, say you don't have that specific information.
        - DO NOT HALLUCINATE or make up colleges/fees/courses not in the text.
        - Formatting: Use bullet points for lists. Use bold for key terms.
        
        Context:
        {context}
        """

        stream = await async_openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": sys_prompt.format(context=context_str)},
                {"role": "user", "content": sanitized_question},
            ],
            temperature=0.3,
            stream=True
        )

        full_answer = ""
        
        async for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                full_answer += content
                yield {"type": "token", "content": content}

        # 5. Post-generation Guardrails
        # We validate the full answer after streaming. 
        # If it fails, we can't "unsend" tokens, but we can flag it in the final message.
        guardrail_result = apply_guardrails(
            response=full_answer,
            context=context_str,
            question=sanitized_question,
            validate_grounding=True
        )

        # Prepare sources
        sources = []
        for score, text, payload in top_hits[:5]:
            sources.append({
                "source": text,
                "score": score,
                "type": payload.get("type", "unknown")
            })

        yield {
            "type": "complete",
            "answer": full_answer,
            "sources": sources,
            "is_valid": guardrail_result["is_valid"],
            "is_grounded": guardrail_result["is_grounded"],
            "issues": guardrail_result["issues"]
        }

    except Exception as e:
        print(f"Streaming Error: {e}")
        yield {"type": "error", "content": "An error occurred while generating the response."}

def check_health() -> Dict[str, Any]:
    """Check connections to Qdrant and LLM."""
    status = {"qdrant": False, "llm": False}
    
    # Check Qdrant
    try:
        client = get_qdrant_client()
        collections = client.get_collections()
        status["qdrant"] = True
    except Exception:
        status["qdrant"] = False
        
    # Check LLM (OpenAI)
    try:
        if openai_client:
            status["llm"] = True
    except Exception:
        status["llm"] = False
        
    return status
