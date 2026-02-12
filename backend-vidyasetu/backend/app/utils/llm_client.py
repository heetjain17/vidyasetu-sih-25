
import ollama
import os
from typing import List, Union

# Configuration
# Users should run: 
#   ollama run llama3:instruct
#   ollama pull nomic-embed-text
DEFAULT_LLM_MODEL = "llama3:instruct" 
DEFAULT_EMBED_MODEL = "nomic-embed-text" 

def generate_text(prompt: str, model: str = DEFAULT_LLM_MODEL) -> str:
    """
    Generates text using the locally running Ollama instance.
    """
    try:
        response = ollama.chat(model=model, messages=[
            {
                'role': 'user',
                'content': prompt,
            },
        ])
        return response['message']['content']
    except Exception as e:
        print(f"❌ Ollama Generation Error: {e}")
        # Fallback or re-raise depending on strictness. 
        # For now, we return empty string or error message to avoid crashing
        return ""

def get_embedding(text: str, model: str = DEFAULT_EMBED_MODEL) -> List[float]:
    """
    Generates embeddings using the locally running Ollama instance.
    Returns a list of floats.
    """
    if not text:
        return []
        
    try:
        response = ollama.embeddings(model=model, prompt=text)
        return response['embedding']
    except Exception as e:
        print(f"❌ Ollama Embedding Error: {e}")
        # Return zero vector fallback if needed, or let caller handle
        # For compatibility with existing code which expects a list:
        return [0.0] * 768 
