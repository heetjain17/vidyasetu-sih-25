"""
Gemini Client using OpenAI SDK
Uses the OpenAI Python SDK to connect to Google's Gemini API.
"""
import os
from typing import List, Optional
from openai import OpenAI, AsyncOpenAI

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GEMINI_EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "text-embedding-004")

# Gemini API base URL for OpenAI SDK compatibility
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

# Initialize Gemini clients using OpenAI SDK
gemini_client: Optional[OpenAI] = None
async_gemini_client: Optional[AsyncOpenAI] = None

if GEMINI_API_KEY:
    try:
        gemini_client = OpenAI(
            api_key=GEMINI_API_KEY,
            base_url=GEMINI_BASE_URL
        )
        async_gemini_client = AsyncOpenAI(
            api_key=GEMINI_API_KEY,
            base_url=GEMINI_BASE_URL
        )
        print("✅ Gemini client initialized successfully")
    except Exception as e:
        print(f"⚠ Failed to initialize Gemini client: {e}")
else:
    print("⚠ GEMINI_API_KEY not found in environment variables")


def get_gemini_client() -> Optional[OpenAI]:
    """Get the synchronous Gemini client."""
    return gemini_client


def get_async_gemini_client() -> Optional[AsyncOpenAI]:
    """Get the asynchronous Gemini client."""
    return async_gemini_client


def generate_text(prompt: str, model: Optional[str] = None, max_tokens: int = 1024) -> str:
    """
    Generate text using Gemini API via OpenAI SDK.
    
    Args:
        prompt: The input prompt
        model: Model to use (defaults to GEMINI_MODEL)
        max_tokens: Maximum tokens to generate
    
    Returns:
        Generated text string
    """
    if not gemini_client:
        raise ValueError("Gemini client not initialized. Check GEMINI_API_KEY.")
    
    try:
        response = gemini_client.chat.completions.create(
            model=model or GEMINI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Gemini text generation failed: {str(e)}")


async def generate_text_async(prompt: str, model: Optional[str] = None, max_tokens: int = 1024) -> str:
    """
    Generate text using Gemini API asynchronously.
    
    Args:
        prompt: The input prompt
        model: Model to use (defaults to GEMINI_MODEL)
        max_tokens: Maximum tokens to generate
    
    Returns:
        Generated text string
    """
    if not async_gemini_client:
        raise ValueError("Async Gemini client not initialized. Check GEMINI_API_KEY.")
    
    try:
        response = await async_gemini_client.chat.completions.create(
            model=model or GEMINI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Gemini async text generation failed: {str(e)}")


def get_embedding(text: str, model: Optional[str] = None) -> List[float]:
    """
    Get text embedding using Gemini API.
    
    Args:
        text: Text to embed
        model: Embedding model to use (defaults to GEMINI_EMBED_MODEL)
    
    Returns:
        List of embedding values
    """
    if not text:
        return [0.0] * 768  # Default embedding dimension
    
    if not gemini_client:
        raise ValueError("Gemini client not initialized. Check GEMINI_API_KEY.")
    
    try:
        response = gemini_client.embeddings.create(
            model=model or GEMINI_EMBED_MODEL,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        raise Exception(f"Gemini embedding failed: {str(e)}")


def check_health() -> dict:
    """Check if Gemini client is properly configured."""
    return {
        "gemini_configured": gemini_client is not None,
        "model": GEMINI_MODEL,
        "embed_model": GEMINI_EMBED_MODEL
    }
