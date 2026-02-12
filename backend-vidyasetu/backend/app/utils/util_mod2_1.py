import math
import re
import os
from dotenv import load_dotenv
load_dotenv()

from .llm_client import get_embedding  

_token_re = re.compile(r"[^\w\s]")  



import json
from pathlib import Path

# Use absolute path relative to the app directory
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
    """Write cache to disk only when new embeddings are added."""
    with CACHE_FILE.open("w", encoding="utf-8") as f:
        json.dump(_EMBED_CACHE, f)


def embed(text: str):
    if not text:
        return [0.0] * 768

    key = text.strip().lower()

    if key in _EMBED_CACHE:
        return _EMBED_CACHE[key]

    try:
        # Using local Ollama embedding
        vec = get_embedding(text)

    except Exception as e:
        print("⚠ Ollama embedding error, using fallback:", e)
        import random
        random.seed(key)  
        vec = [random.uniform(0.0, 0.05) for _ in range(768)]

    _EMBED_CACHE[key] = vec
    _save_cache()
    return vec


def cosine_similarity(a, b):
    length = max(len(a), len(b))
    dot = 0.0
    na = 0.0
    nb = 0.0
    for i in range(length):
        ai = a[i] if i < len(a) else 0.0
        bi = b[i] if i < len(b) else 0.0
        dot += ai * bi
        na += ai * ai
        nb += bi * bi
    denom = math.sqrt(na) * math.sqrt(nb) or 1.0
    return dot / denom


def student_events_text(student: dict) -> str:
    extras = ", ".join(student.get("Extra_curriculars", []) or [])
    hobbies = ", ".join(student.get("Hobbies", []) or [])
    return f"The student participates in {extras}. Their hobbies include {hobbies}."


def student_locality_text(student: dict) -> str:
    loc = student.get("Student_Locality", "") or ""
    return f"The student lives in {loc}."


def college_locality_text(college: dict) -> str:
    loc = college.get("Locality") or college.get("District") or ""
    hostel_raw = str(
        college.get("Hostel")
        or college.get("Hostel facility Yes / No")
        or "No"
    ).lower().strip()

    has_hostel = hostel_raw in ["yes", "true", "1", "y"]
    hostel_text = "Hostel is available." if has_hostel else "Hostel is not available."
    return f"The college is located in {loc}. {hostel_text}"


def normalize_student_will_vector(will_vector: dict) -> dict:
    values = [float(v) if v is not None else 0.0 for v in will_vector.values()]
    total = sum(values)

    if total == 0:
        equal = 1.0 / len(values) if values else 0.0
        return {k: round(equal, 4) for k in will_vector.keys()}

    normalized = {}
    for k, v in will_vector.items():
        val = float(v) if v is not None else 0.0
        normalized[k] = round(val / total, 4)
    return normalized


def college_to_vector(college_scores_list):
    return [float(v) if v is not None else 0.0 for v in college_scores_list]


def student_will_to_vector(norm: dict):
    return [
        float(norm.get("Importance_Locality", 0.0)),
        float(norm.get("Importance_Financial", 0.0)),
        float(norm.get("Importance_Eligibility", 0.0)),
        float(norm.get("Importance_Events_hobbies", 0.0)),
        float(norm.get("Importance_Quality", 0.0)),
    ]



LOCALITY_COORDS = {
    "kupwara":   [34.432222, 74.123889],
    "pulwama":   [33.985833, 75.013056],
    "ganderbal": [34.216944, 74.771667],
    "anantnag":  [33.728611, 75.148056],
    "kathua":    [32.386389, 75.517222],
    "budgam":    [33.94,     74.638611],
    "ramban":    [33.246389, 75.193611],
    "doda":      [33.101667, 75.666111],
    "samba":     [32.560278, 75.111111],
    "rajouri":   [33.371667, 74.314722],
    "bandipora": [34.509167, 74.686667],
    "poonch":    [33.766944, 74.884722],
    "udhampur":  [32.916389, 75.135278],
    "reasi":     [33.266944, 74.827222],
    "kulgam":    [33.645,    75.017778],
    "shopian":   [33.716944, 74.835833],
    "baramulla": [34.202148, 74.348259],
    "kishtwar":  [33.52958,  76.01462],
    "unknown":   [0.0,       0.0],
}
