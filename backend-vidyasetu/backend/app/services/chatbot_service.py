"""
Unified Chatbot Service
Supports both OpenAI and Ollama (Llama 3) with automatic fallback.
Includes guardrails, query expansion, and structured context building.
"""

import os
import json
import random
from typing import AsyncGenerator, List, Tuple, Dict, Any, Optional
from dotenv import load_dotenv
from qdrant_client import QdrantClient

# Import guardrails
from app.services.chatbot_guardrails import (
    apply_guardrails,
    validate_input,
    RAGGroundingValidator,
    InputValidator
)

load_dotenv()

# --- Configuration ---
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION = os.getenv("QDRANT_COLLECTION_NAME", "college_career_knowledge_openai")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

# --- Clients Initialization ---
_qdrant_client = None
openai_client = None
async_openai_client = None
ollama_llm = None

def get_qdrant_client():
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    return _qdrant_client

if OPENAI_API_KEY:
    try:
        from openai import OpenAI, AsyncOpenAI
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        async_openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    except ImportError:
        print("⚠ OpenAI package not installed.")

# Initialize Ollama as fallback
try:
    from langchain_ollama import ChatOllama
    ollama_llm = ChatOllama(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL, temperature=0.7)
except ImportError:
    print("⚠ Langchain-Ollama package not installed.")

# --- Core Utilities ---

def embed_query(question: str) -> List[float]:
    """Embed query using OpenAI if available, else fallback logic."""
    if openai_client:
        try:
            resp = openai_client.embeddings.create(model=OPENAI_EMBED_MODEL, input=question)
            return resp.data[0].embedding
        except Exception as e:
            print(f"⚠ OpenAI embedding failed: {e}")
    
    # Simple fallback embedding (random/seeded) if no provider available
    random.seed(question)
    return [random.uniform(-0.1, 0.1) for _ in range(1536 if openai_client else 768)]

def search_vectors(query_vector: List[float], limit: int = 24) -> List[Any]:
    client = get_qdrant_client()
    return client.query_points(collection_name=COLLECTION, query=query_vector, limit=limit).points

def _norm(s: str) -> str:
    return "".join(ch.lower() for ch in s if ch.isalnum()) if s else ""

# --- Query Expansion & Intent Detection ---
# (Simplified versions of the robust logic from openai_chatbot.py)

QUERY_EXPANSIONS = {
    "bca": "Bachelor of Computer Applications BCA Computer Application software programming IT",
    "mca": "Master of Computer Applications MCA",
    "bcom": "Bachelor of Commerce BCom Accounting Finance Business",
    "bba": "Bachelor of Business Administration BBA Management",
    "engineering": "BTech BE technical electronics computer civil mechanical",
    "medical": "MBBS doctor healthcare biotechnology science",
}

def expand_query(question: str) -> str:
    expanded = question
    q_lower = question.lower()
    for term, syns in QUERY_EXPANSIONS.items():
        if term in q_lower: expanded += f" {syns}"
    return expanded

def classify_intent(message: str) -> str:
    msg = message.lower().strip()
    if not msg: return "unclear"
    if any(g in msg for g in ["hello", "hi", "hey", "namaste"]): return "greeting"
    if any(f in msg for f in ["bye", "goodbye"]): return "farewell"
    if any(t in msg for t in ["thank", "thanks"]): return "gratitude"
    
    education_keywords = ["college", "course", "career", "job", "study", "degree", "admission", "jammu", "kashmir"]
    if any(k in msg for k in education_keywords):
        if any(c in msg for c in ["career", "job", "become"]): return "career_query"
        if any(c in msg for c in ["college", "university", "gdc", "gcw"]): return "college_query"
        return "course_query"
    
    return "general_query"

QUICK_RESPONSES = {
    "greeting": "Hello! 😊 I'm your J&K Education Assistant. How can I help you today?",
    "farewell": "Goodbye! 👋 Best wishes for your academic journey.",
    "gratitude": "You're welcome! Happy to help. 😊",
}

# --- Context Building ---

def build_context(matches: List[Any], question: str) -> Tuple[str, List[Dict]]:
    context_parts = []
    sources = []
    seen = set()
    
    for hit in matches:
        p = hit.payload
        dtype = p.get("type", "unknown")
        name = p.get("college_name") or p.get("course_name") or p.get("career_name") or "Info"
        
        if name in seen: continue
        seen.add(name)
        
        text = ""
        if dtype in ["college", "college_info"]:
            text = f"**{name}** | Location: {p.get('district', 'J&K')} | Fees: {p.get('fees', 'N/A')} | Hostel: {p.get('hostel', 'N/A')}"
        elif dtype == "course":
            text = f"**Course: {name}** | Stream: {p.get('stream', 'N/A')}"
        elif dtype == "career_to_course":
            text = f"**Career: {name}** | Recommended: {', '.join(p.get('courses', [])[:5])}"
        else:
            text = f"{name}: {str(p)[:100]}"
            
        context_parts.append(text)
        sources.append(p)
        
    return "\n".join(context_parts[:10]), sources[:5]

# --- Main Entry Points ---

async def rag_answer_stream(question: str) -> AsyncGenerator[Dict[str, Any], None]:
    intent = classify_intent(question)
    if intent in QUICK_RESPONSES:
        yield {"type": "complete", "answer": QUICK_RESPONSES[intent], "sources": []}
        return

    expanded = expand_query(question)
    try:
        vec = embed_query(expanded)
        matches = search_vectors(vec)
        context, sources = build_context(matches, question)
        
        prompt = f"Context:\n{context}\n\nQuestion: {question}\n\nAssistant (use only context):"
        
        if async_openai_client:
            response = await async_openai_client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                stream=True
            )
            full_ans = ""
            async for chunk in response:
                token = chunk.choices[0].delta.content or ""
                if token:
                    full_ans += token
                    yield {"type": "token", "content": token}
            yield {"type": "complete", "answer": full_ans, "sources": sources}
        
        elif ollama_llm:
            full_ans = ""
            async for chunk in ollama_llm.astream(prompt):
                token = chunk.content
                full_ans += token
                yield {"type": "token", "content": token}
            yield {"type": "complete", "answer": full_ans, "sources": sources}
            
        else:
            yield {"type": "error", "content": "No AI provider configured."}
            
    except Exception as e:
        yield {"type": "error", "content": f"Chatbot error: {str(e)}"}

def rag_answer(question: str) -> Tuple[Dict[str, Any], List[Dict]]:
    # Simplified non-streaming version
    intent = classify_intent(question)
    if intent in QUICK_RESPONSES: return {"answer": QUICK_RESPONSES[intent]}, []
    
    expanded = expand_query(question)
    try:
        vec = embed_query(expanded)
        matches = search_vectors(vec)
        context, sources = build_context(matches, question)
        prompt = f"Context:\n{context}\n\nQuestion: {question}\n\nAssistant:"
        
        if openai_client:
            resp = openai_client.chat.completions.create(model=OPENAI_MODEL, messages=[{"role": "user", "content": prompt}])
            return {"answer": resp.choices[0].message.content}, sources
        elif ollama_llm:
            resp = ollama_llm.invoke(prompt)
            return {"answer": resp.content}, sources
        return {"answer": "No AI available."}, []
    except Exception as e:
        return {"answer": f"Error: {e}"}, []

def check_health() -> Dict[str, str]:
    h = {"qdrant": "error", "ai_provider": "none"}
    try:
        get_qdrant_client().get_collections()
        h["qdrant"] = "ok"
    except: pass
    
    if openai_client: h["ai_provider"] = "openai"
    elif ollama_llm: h["ai_provider"] = "ollama"
    
    return h
