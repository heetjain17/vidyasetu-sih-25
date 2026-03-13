# utils/ — Utility Functions

Pure functions — no FastAPI or DB dependencies. Import freely from services.

| File | Purpose |
|---|---|
| `riasec_utils.py` | Converts aptitude scores → normalized RIASEC vector |
| `scoring_logic.py` | College match scoring: locality, financial, eligibility, cultural, quality |
| `math_utils.py` | `haversine()` distance and `cosine_similarity()` |
| `embedding_utils.py` | Text → vector embedding with local cache + J&K geo-coordinates |
| `recommendation_helpers.py` | Maps careers → courses and courses → colleges |
| `llm_client.py` | Unified LLM text + embedding client (OpenAI primary, Ollama fallback) |
| `explain_career_api.py` | Batched LLM career explanation generator |
| `explain_career_helper.py` | Extracts dominant RIASEC traits for prompts |
| `explain_college_helper.py` | Formats college scoring info for prompts |
| `explain_college_multi.py` | Batched LLM college explanation generator |
| `translation.py` | Hindi/Urdu/Kashmiri translation service |
