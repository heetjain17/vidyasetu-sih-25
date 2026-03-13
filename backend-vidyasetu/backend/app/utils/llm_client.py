"""
LLM Client — Unified AI Provider
Supports OpenAI (primary) and falls back to local Ollama if OpenAI key is not set.
"""
import os
from typing import List

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:instruct")
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")

# Initialize OpenAI client if key is available
_openai = None
if OPENAI_API_KEY:
    try:
        from openai import OpenAI
        _openai = OpenAI(api_key=OPENAI_API_KEY)
    except ImportError:
        pass


def generate_text(prompt: str, model: str = None) -> str:
    """Generate text using OpenAI (preferred) or Ollama (fallback)."""
    if _openai:
        try:
            resp = _openai.chat.completions.create(
                model=model or OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            print(f"⚠ OpenAI generate_text failed: {e}")

    # Fallback to Ollama
    try:
        import ollama
        response = ollama.chat(model=model or OLLAMA_MODEL, messages=[{"role": "user", "content": prompt}])
        return response["message"]["content"]
    except Exception as e:
        print(f"❌ Ollama generate_text failed: {e}")
        return ""


def get_embedding(text: str, model: str = None) -> List[float]:
    """Get vector embedding using OpenAI (preferred) or Ollama (fallback)."""
    if not text:
        return [0.0] * 1536

    if _openai:
        try:
            resp = _openai.embeddings.create(model=model or OPENAI_EMBED_MODEL, input=text)
            return resp.data[0].embedding
        except Exception as e:
            print(f"⚠ OpenAI embedding failed: {e}")

    # Fallback to Ollama
    try:
        import ollama
        response = ollama.embeddings(model=model or OLLAMA_EMBED_MODEL, prompt=text)
        return response["embedding"]
    except Exception as e:
        print(f"❌ Ollama embedding failed: {e}")
        return [0.0] * 768
