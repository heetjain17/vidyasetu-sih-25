import json
import random
from pathlib import Path
from .llm_client import get_embedding

# Constants and Cache Setup
BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "cache"
CACHE_DIR.mkdir(exist_ok=True)
CACHE_FILE = CACHE_DIR / "embeddings_cache.json"

if CACHE_FILE.exists():
    with CACHE_FILE.open("r", encoding="utf-8") as f:
        _EMBED_CACHE = json.load(f)
else:
    _EMBED_CACHE = {}

def _save_cache():
    with CACHE_FILE.open("w", encoding="utf-8") as f:
        json.dump(_EMBED_CACHE, f)

def embed(text: str):
    """
    Returns the vector embedding for the given text.
    Uses local cache or fetches from LLM provider.
    """
    if not text:
        return [0.0] * 768

    key = text.strip().lower()
    if key in _EMBED_CACHE:
        return _EMBED_CACHE[key]

    try:
        vec = get_embedding(text)
    except Exception as e:
        print(f"⚠ Embedding error for '{text}', using fallback: {e}")
        random.seed(key)  
        vec = [random.uniform(0.0, 0.05) for _ in range(768)]

    _EMBED_CACHE[key] = vec
    _save_cache()
    return vec

# Common Locality Coordinates for J&K Districts
LOCALITY_COORDS = {
    "kupwara":   [34.4322, 74.1239],
    "pulwama":   [33.9858, 75.0131],
    "ganderbal": [34.2169, 74.7717],
    "anantnag":  [33.7286, 75.1481],
    "kathua":    [32.3864, 75.5172],
    "budgam":    [33.9400, 74.6386],
    "ramban":    [33.2464, 75.1936],
    "doda":      [33.1017, 75.6661],
    "samba":     [32.5603, 75.1111],
    "rajouri":   [33.3717, 74.3147],
    "bandipora": [34.5092, 74.6867],
    "poonch":    [33.7669, 74.8847],
    "udhampur":  [32.9164, 75.1353],
    "reasi":     [33.2669, 74.8272],
    "kulgam":    [33.6450, 75.0178],
    "shopian":   [33.7169, 74.8358],
    "baramulla": [34.2021, 74.3483],
    "kishtwar":  [33.5296, 76.0146],
    "jammu":     [32.7266, 74.8570],
    "srinagar":  [34.0837, 74.7973],
    "unknown":   [33.0000, 75.0000],
}
