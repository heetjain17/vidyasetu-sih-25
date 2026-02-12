"""
RAG Chatbot Service
Handles queries about colleges, courses, and careers using Llama 3 via Ollama
with WebSocket streaming support for real-time responses.
"""

import os
from typing import AsyncGenerator, List, Tuple, Dict, Any, Optional
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from langchain_ollama import OllamaEmbeddings, ChatOllama

load_dotenv()

# Environment variables
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION = os.getenv("QDRANT_COLLECTION_NAME", "college_career_knowledge_llama3")

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "llama3")

# Initialize Ollama embeddings and LLM
embeddings = OllamaEmbeddings(
    model=OLLAMA_EMBED_MODEL,
    base_url=OLLAMA_BASE_URL
)

llm = ChatOllama(
    model=OLLAMA_MODEL,
    base_url=OLLAMA_BASE_URL,
    temperature=0.7
)

# Qdrant client (lazy initialization)
_qdrant_client: Optional[QdrantClient] = None


def get_qdrant_client() -> QdrantClient:
    """Get or create Qdrant client."""
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    return _qdrant_client


# ---------- Embed the query ----------
def embed_query(question: str) -> List[float]:
    """Embed a query using Ollama Llama 3."""
    return embeddings.embed_query(question)


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
QUERY_EXPANSIONS = {
    "computer science": "BCA MCA software engineering IT programming computer application",
    "computer": "BCA MCA software IT programming computer application",
    "medical": "MBBS doctor nursing pharmacy medicine healthcare",
    "doctor": "MBBS medical medicine healthcare physician",
    "engineering": "BTech BE mechanical civil electrical electronics",
    "law": "LLB legal advocate lawyer judiciary",
    "arts": "BA humanities literature history political science",
    "commerce": "BCom accounting finance business management",
    "science": "BSc physics chemistry biology mathematics",
    "management": "MBA BBA business administration",
}

def expand_query(question: str) -> str:
    """Expand query with synonyms for better search coverage."""
    expanded = question
    q_lower = question.lower()
    for term, synonyms in QUERY_EXPANSIONS.items():
        if term in q_lower:
            expanded += f" {synonyms}"
    return expanded


# ---------- Build context from search results ----------
def build_context(matches: List[Any], question: str) -> Tuple[str, List[Tuple]]:
    """Build context from search results based on their types."""
    context_parts = []
    q_lower = question.lower()
    
    # Detect user intent
    wants_college = any(w in q_lower for w in ["college", "colleges", "institution", "university", "where to study"])
    wants_course = any(w in q_lower for w in ["course", "courses", "degree", "program", "study", "what to study"])
    wants_career = any(w in q_lower for w in ["career", "careers", "job", "profession", "become", "work as"])
    wants_hostel = any(w in q_lower for w in ["hostel", "accommodation", "stay", "living"])
    wants_fees = any(w in q_lower for w in ["fee", "fees", "cost", "affordable", "cheap", "budget"])
    
    scored_results = []
    
    for hit in matches:
        payload = hit.payload
        data_type = payload.get("type", "")
        score = hit.score if hasattr(hit, 'score') else 0
        bonus = 0
        
        # ----- COLLEGE or COLLEGE_INFO type -----
        if data_type in ["college", "college_info"]:
            name = payload.get("college_name", "Unknown")
            district = payload.get("district", "")
            state = payload.get("state", "")
            hostel = payload.get("hostel", payload.get("Hostel", ""))
            fees = payload.get("fees", payload.get("Fees", ""))
            course = payload.get("course_name", "")
            topic = payload.get("topic", "")
            
            # Build text from available fields
            text = f"College: {name}"
            if district:
                text += f" in {district}"
            if state:
                text += f", {state}"
            if course:
                text += f". Offers: {course}"
            if topic:
                text += f". {topic}"
            if hostel:
                text += f". Hostel: {hostel}"
            if fees:
                text += f". Fees: ₹{fees}"
            text += "."
            
            if wants_college:
                bonus += 3
            if wants_hostel and hostel:
                bonus += 2
            if wants_fees:
                bonus += 2
            if district and district.lower() in q_lower:
                bonus += 4
            if name and _norm(name) in _norm(question):
                bonus += 5
            if course and _norm(course) in _norm(question):
                bonus += 3
                
            scored_results.append((score + bonus, text, payload))
        
        # ----- COURSE type -----
        elif data_type == "course":
            name = payload.get("course_name", "Unknown")
            stream = payload.get("stream", "")
            
            text = f"Course: {name} ({stream} stream)."
            
            if wants_course:
                bonus += 3
            if name and _norm(name) in _norm(question):
                bonus += 5
            if stream and stream.lower() in q_lower:
                bonus += 2
                
            scored_results.append((score + bonus, text, payload))
        
        # ----- CAREER TO COURSE mapping -----
        elif data_type == "career_to_course":
            career = payload.get("career_name", "Unknown")
            courses = payload.get("courses", [])[:5]
            courses_str = ", ".join(courses) if courses else ""
            
            text = f"Career: {career}. Recommended courses: {courses_str}."
            
            if wants_career:
                bonus += 4
            if career and _norm(career) in _norm(question):
                bonus += 6
                
            scored_results.append((score + bonus, text, payload))
        
        # ----- COURSE TO COLLEGE mapping -----
        elif data_type == "course_to_college":
            course = payload.get("course_name", "Unknown")
            colleges = payload.get("colleges", [])[:5]
            colleges_str = ", ".join(colleges) if colleges else ""
            
            text = f"Course: {course}. Offered at: {colleges_str}."
            
            if wants_college or wants_course:
                bonus += 3
            if course and _norm(course) in _norm(question):
                bonus += 5
            
            # Extra bonus for exact keyword matches in course name
            course_lower = course.lower()
            for keyword in ["computer", "bca", "mca", "engineering", "medical", "mbbs", "law", "llb"]:
                if keyword in q_lower and keyword in course_lower:
                    bonus += 8  # High priority for exact keyword match
                    break
                
            scored_results.append((score + bonus, text, payload))
        
        # ----- FALLBACK for unknown types -----
        else:
            # Try to build context from any available text fields
            text_parts = []
            for key in ["text", "topic", "college_name", "course_name", "career_name"]:
                if key in payload and payload[key]:
                    text_parts.append(str(payload[key]))
            
            if text_parts:
                text = " - ".join(text_parts[:3])
                scored_results.append((score, text, payload))
    
    # Sort by score and take top results
    scored_results.sort(key=lambda x: x[0], reverse=True)
    top_results = scored_results[:10]
    
    # Build context text
    for _, text, _ in top_results:
        context_parts.append(text)
    
    return "\n".join(context_parts), top_results


# ---------- Classify Intent ----------
def classify_intent(message: str) -> str:
    """Classify user message intent using keyword matching for speed."""
    msg_lower = message.lower().strip()
    
    # Quick keyword-based classification (faster than LLM)
    greetings = ["hello", "hi", "hey", "hola", "namaste", "good morning", "good evening"]
    farewells = ["bye", "goodbye", "see you", "thanks bye", "take care"]
    gratitude = ["thank", "thanks", "thank you", "appreciated", "grateful"]
    bot_identity = ["who are you", "what are you", "your name", "about you"]
    chitchat = ["how are you", "what's up", "how do you do"]
    
    for g in greetings:
        if msg_lower.startswith(g) or msg_lower == g:
            return "greeting"
    
    for f in farewells:
        if f in msg_lower:
            return "farewell"
    
    for t in gratitude:
        if t in msg_lower:
            return "gratitude"
    
    for b in bot_identity:
        if b in msg_lower:
            return "bot_identity"
    
    for c in chitchat:
        if c in msg_lower:
            return "personal_chitchat"
    
    # Check for domain-specific queries
    career_keywords = ["career", "job", "profession", "become", "work as", "salary", "future"]
    college_keywords = ["college", "university", "institute", "admission", "hostel", "fees"]
    
    for k in career_keywords:
        if k in msg_lower:
            return "career_query"
    
    for k in college_keywords:
        if k in msg_lower:
            return "college_query"
    
    return "general_query"


# ---------- Quick responses for non-RAG intents ----------
QUICK_RESPONSES = {
    "greeting": "Hello! 😊 How can I help you explore colleges or careers today?",
    "farewell": "Goodbye! 👋 If you need college or career help later, just ask anytime.",
    "gratitude": "You're welcome! Glad I could help 🤝",
    "bot_identity": "I'm your academic assistant. I help you find suitable colleges and explore career options in Jammu & Kashmir.",
    "personal_chitchat": "I'm doing great! 😊 Feel free to ask anything related to colleges or careers.",
}


# ---------- Streaming RAG Answer ----------
async def rag_answer_stream(question: str) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Async generator that yields tokens as they're generated.
    Yields dicts with 'type' and 'content' keys.
    """
    # First, classify intent for quick responses
    intent = classify_intent(question)
    
    if intent in QUICK_RESPONSES:
        yield {"type": "complete", "answer": QUICK_RESPONSES[intent], "sources": []}
        return
    
    # For unclear queries
    if intent == "unclear":
        yield {"type": "complete", "answer": "I didn't fully understand. Could you ask something related to colleges or careers?", "sources": []}
        return
    
    # Perform RAG for relevant queries
    try:
        # Use expanded query for better search coverage (same as REST endpoint)
        expanded_question = expand_query(question)
        query_vector = embed_query(expanded_question)
        matches = search_vectors(query_vector, limit=30)
        
        if not matches:
            yield {"type": "complete", "answer": "I couldn't find any relevant information for your query.", "sources": []}
            return
        
        context, scored_results = build_context(matches, question)
        
        if not context.strip():
            yield {"type": "complete", "answer": "I couldn't find relevant information for your query.", "sources": []}
            return
        
        # Build prompt based on query type
        q_lower = question.lower()
        wants_career = any(w in q_lower for w in ["career", "careers", "job", "profession", "become"])
        
        if wants_career:
            prompt = f"""You are a career guidance assistant. Use ONLY the information provided below.

CONTEXT:
{context}

USER QUESTION: {question}

Write a clear and encouraging guidance message in 4-6 lines.
- Explain what courses to study for this career path
- Mention relevant colleges if available
- Keep the tone motivating and student-friendly
- Do NOT add information not in the context

ANSWER:"""
        else:
            prompt = f"""You are a helpful assistant for students looking for colleges and career guidance in Jammu & Kashmir.

CONTEXT:
{context}

USER QUESTION: {question}

Provide a helpful answer based ONLY on the context above.
If the information is not in the context, say so politely.
Keep response concise (3-6 lines).

ANSWER:"""
        
        # Stream the response
        full_response = ""
        async for chunk in llm.astream(prompt):
            token = chunk.content
            if token:
                full_response += token
                yield {"type": "token", "content": token}
        
        # Send completion with sources
        sources = [r[2] for r in scored_results[:5]]
        yield {"type": "complete", "answer": full_response, "sources": sources}
        
    except Exception as e:
        yield {"type": "error", "content": f"Error processing query: {str(e)}"}


# ---------- Non-streaming RAG Answer (REST fallback) ----------
def rag_answer(question: str) -> Tuple[Dict[str, Any], List[Dict]]:
    """
    Synchronous RAG answer for REST API fallback.
    Returns (answer_dict, sources_list).
    Now includes structured college_cards and career_cards.
    """
    intent = classify_intent(question)
    
    if intent in QUICK_RESPONSES:
        return {"answer": QUICK_RESPONSES[intent]}, []
    
    if intent == "unclear":
        return {"answer": "I didn't fully understand. Could you ask something related to colleges or careers?"}, []
    
    try:
        # Use expanded query for better search coverage
        expanded_question = expand_query(question)
        query_vector = embed_query(expanded_question)
        matches = search_vectors(query_vector, limit=30)
        
        if not matches:
            return {"answer": "I couldn't find any relevant information for your query."}, []
        
        context, scored_results = build_context(matches, question)
        
        if not context.strip():
            return {"answer": "I couldn't find relevant information for your query."}, []
        
        q_lower = question.lower()
        wants_career = any(w in q_lower for w in ["career", "careers", "job", "profession", "become", "work as"])
        wants_college = any(w in q_lower for w in ["college", "colleges", "institution", "university", "where"])
        
        result = {"answer": ""}
        
        # ----- BUILD CAREER CARDS -----
        if wants_career:
            career_results = [r for r in scored_results if r[2].get("type") == "career_to_course"]
            
            if career_results:
                career_cards = []
                for _, _, payload in career_results[:3]:
                    career = payload.get("career_name", "Unknown")
                    courses = payload.get("courses", [])[:5]
                    
                    # Find colleges for these courses
                    course_college_results = [r for r in scored_results if r[2].get("type") == "course_to_college"]
                    colleges = []
                    for _, _, cc_payload in course_college_results[:3]:
                        colleges.extend(cc_payload.get("colleges", [])[:3])
                    colleges = list(set(colleges))[:6]
                    
                    career_cards.append({
                        "career": career,
                        "courses": courses,
                        "colleges": colleges
                    })
                
                if career_cards:
                    result["career_cards"] = career_cards
            
            prompt = f"""You are a career guidance assistant. Use ONLY the information provided below.

CONTEXT:
{context}

USER QUESTION: {question}

Write a clear and encouraging guidance message in 4-6 lines.
- Explain what courses to study for this career
- Mention relevant colleges if available
- Keep the tone motivating and student-friendly

ANSWER:"""
        
        # ----- BUILD COLLEGE CARDS -----
        elif wants_college:
            college_results = [r for r in scored_results if r[2].get("type") in ["college", "college_info", "course_to_college"]]
            
            college_cards = []
            seen = set()
            
            for _, _, payload in college_results[:10]:
                if payload.get("type") in ["college", "college_info"]:
                    name = payload.get("college_name")
                    if name and name.lower() not in seen:
                        seen.add(name.lower())
                        college_cards.append({
                            "college": name,
                            "district": payload.get("district", "J&K"),
                            "course": payload.get("course_name", ""),
                            "hostel": payload.get("hostel", payload.get("Hostel", "Check with college")),
                            "fees": payload.get("fees", payload.get("Fees", "Check with college"))
                        })
                elif payload.get("type") == "course_to_college":
                    for college_name in payload.get("colleges", [])[:4]:
                        if college_name.lower() not in seen:
                            seen.add(college_name.lower())
                            college_cards.append({
                                "college": college_name,
                                "district": "J&K",
                                "course": payload.get("course_name", ""),
                                "hostel": "Check with college",
                                "fees": "Check with college"
                            })
            
            college_cards = college_cards[:8]
            if college_cards:
                result["colleges"] = college_cards
            
            prompt = f"""You are a college guidance assistant for students in Jammu & Kashmir.

CONTEXT:
{context}

USER QUESTION: {question}

Write a helpful summary (3-5 lines):
- Mention the relevant colleges found
- Note any specific courses they offer
- Be student-friendly

ANSWER:"""
        
        # ----- GENERAL QUERY -----
        else:
            prompt = f"""You are a helpful assistant for students looking for colleges and career guidance.

CONTEXT:
{context}

USER QUESTION: {question}

Provide a helpful answer based ONLY on the context above.
Keep response concise (3-6 lines).

ANSWER:"""
        
        response = llm.invoke(prompt)
        result["answer"] = response.content
        sources = [r[2] for r in scored_results[:5]]
        
        return result, sources
        
    except Exception as e:
        return {"answer": f"Error processing query: {str(e)}"}, []


# ---------- Health Check ----------
def check_health() -> Dict[str, str]:
    """Check connectivity to Qdrant and Ollama."""
    status = {"qdrant": "unknown", "ollama": "unknown"}
    
    # Check Qdrant
    try:
        client = get_qdrant_client()
        client.get_collections()
        status["qdrant"] = "ok"
    except Exception as e:
        status["qdrant"] = f"error: {str(e)}"
    
    # Check Ollama
    try:
        # Simple test embedding
        embeddings.embed_query("test")
        status["ollama"] = "ok"
    except Exception as e:
        status["ollama"] = f"error: {str(e)}"
    
    return status
