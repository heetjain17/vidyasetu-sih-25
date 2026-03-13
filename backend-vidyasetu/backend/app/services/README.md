# services/ — Business Logic Layer

| File | Purpose |
|---|---|
| `recommender_db.py` | Full recommendation pipeline (RIASEC → Career → College scoring) |
| `chatbot_service.py` | Unified RAG chatbot (OpenAI primary, Ollama fallback) |
| `chatbot_guardrails.py` | Input/output validation for the chatbot (anti-hallucination) |
| `db_service.py` | Supabase data fetching for careers, colleges, courses, roadmaps |
| `discussion_forum_service.py` | Forum CRUD + chatbot mention detection |
| `futuristic_career_generator.py` | GPT-powered emerging career suggestions |
| `google_calendar.py` | Google Calendar API integration for exam sync |

## Rules
- Services must not import from `routers/` — only from `utils/`, `dependencies/`, and each other.
- `db_service.py` is the **single source of truth** for all Supabase queries.
