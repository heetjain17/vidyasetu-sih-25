# 🎓 Margadarshaka Backend API
> **Robust, AI-driven career and college counseling engine tailored for J&K students.**

The Margadarshaka backend is a **FastAPI** application designed to power a highly complex recommendation pipeline, matching student psychological profiles (RIASEC) and preferences to the most suitable career pathways and colleges.

---

## 🚀 Quick Start (Development)

1. **Activate the Conda Environment**
   ```bash
   conda activate vidyasetu-backend
   ```
2. **Setup your environment variables**
   Ensure your `.env` file is populated (see the **Environment Variables** section below).
3. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```
   > The API will be available at `http://localhost:8000`. Swagger API docs are at `http://localhost:8000/docs`.

---

## 🛠️ System Architecture & Features

### 1. 🎯 Recommender Engine (`/recommend`)
- Calculates a 6-dimensional **RIASEC** psychological profile based on a 7-section aptitude test.
- Computes cosine similarity to score 100+ mapped careers.
- Filters and ranks colleges using a multi-factor weighting algorithm:
  - **Locality**: Proximity matching.
  - **Financial**: Budget constraints vs annual fees.
  - **Eligibility**: Stream constraints (Arts/Science/Commerce) vs College offerings.
  - **Cultural**: Hobby alignment using NLP text embeddings over college facility tags.
  - **Quality**: Heuristic ranking.
- Generates localized, AI-driven friendly explanations explaining *why* a college/career is a fit, available in English, Hindi, Urdu, and Kashmiri.

### 2. 💬 AI Chatbot & RAG System (`/chatbot`)
- A production-grade **Retrieval-Augmented Generation (RAG)** system using **Qdrant** as the vector database.
- Has an automated fallback mechanism: defaults to **OpenAI (GPT-4o-mini)** for high-quality generations, but gracefully degrades to local **Ollama** if API keys are missing or limits are hit.
- Answers hyper-local academic and college-specific queries by searching indexed J&K institutional data.
- Includes a **Futuristic Career Generator** predicting emerging roles (Next 5-20 years) based on current student skills and hobbies.

### 3. 👤 Role-Based Authorization
- Backed by **Supabase Auth**. Profiles are separated structurally:
  - **Student**: Core users taking assessments.
  - **Parent**: Guardian accounts; features a dedicated *Link system* to track multiple children.
  - **College Admin**: Institutional dashboards to broadcast events, update campus placement data, and respond to facility queries.

### 4. 📚 Community & Forums
- Interactive **Discussion Forums** with voting mechanics and predefined administrative tags.
- Built-in bot logic where `@AI` mentions trigger background tasks to Auto-Reply using the RAG knowledge base.
- Comprehensive **Career Hub** hosting study materials, scholarships, and career roadmap templates.

---

## ⚙️ Environment Variables (`.env`)

The backend requires a configured `.env` file located in the `backend/` root directory.

| Variable | Description | Default / Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase Project URL. | `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | Supabase Anon / Service Role Key. | `eyJh...` |
| `OPENAI_API_KEY` | Used for LLM Explanations, RAG, and Embeddings. | `sk-proj-...` |
| `OPENAI_MODEL` | The LLM model routing. | `gpt-4o-mini` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins for production security. | `http://localhost:3000,https://app.com` |
| `QDRANT_URL` | URL to the vector database. | `http://localhost:6333` |

---

## 🧪 Testing

The system enforces rigorous automated testing via `pytest`. The test suite uses a mocked Supabase layer where required to ensure fast, offline validation of models and business logic.

```bash
conda activate vidyasetu-backend
pytest tests/ -q
```

---

## 📂 Project Structure

- `app/main.py`: The ASGI FastAPI application entry point. Includes global Exception Handlers.
- `app/routers/`: All API endpoints, grouped by domain (`colleges.py`, `recommend.py`, `chatbot.py`, etc.).
- `app/services/`: Core business logic (Recommender Engines, LLM orchestration, RAG).
- `app/schemas/`: Pydantic Data Models enforcing strict request/response validation.
- `app/utils/`: Math functions, scoring logic, language translation utilities.
- `scripts/`: Standalone utilities (`create_embeddings.py` for Qdrant seeding, `populate_data.py`). See `scripts/README.md`.
- `tests/`: Extensive PyTest directory verifying endpoints and schemas.
