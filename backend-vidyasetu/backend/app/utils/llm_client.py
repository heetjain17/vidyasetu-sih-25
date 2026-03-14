"""
LLM Client — Unified AI Provider using Gemini
Uses Google's Gemini API via OpenAI SDK for compatibility.
"""

from typing import List, Optional
from app.utils.gemini_client import (
    generate_text as gemini_generate_text,
    get_embedding as gemini_get_embedding,
    get_gemini_client,
    GEMINI_MODEL,
)


def generate_text(prompt: str, model: Optional[str] = None) -> str:
    """
    Generate text using Gemini API.

    Args:
        prompt: The input prompt
        model: Model to use (defaults to GEMINI_MODEL)

    Returns:
        Generated text string
    """
    try:
        return gemini_generate_text(prompt, model=model)
    except Exception as e:
        import logging

        logging.error(f"Gemini generate_text failed: {e}")
        return ""


def get_embedding(text: str, model: Optional[str] = None) -> List[float]:
    """
    Get vector embedding using Gemini API.

    Args:
        text: Text to embed
        model: Embedding model to use

    Returns:
        List of embedding values
    """
    if not text:
        return [0.0] * 768

    try:
        return gemini_get_embedding(text, model=model)
    except Exception as e:
        import logging

        logging.error(f"Gemini embedding failed: {e}")
        return [0.0] * 768
