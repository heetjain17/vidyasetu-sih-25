# scripts/ — Utility Scripts

## Scripts

### `create_embeddings.py`
Embeds the RAG knowledge base (colleges, courses, careers) into the **Qdrant** vector database using **OpenAI** embeddings.

**When to run:** Once initially, and whenever the JSON data files in `data/rag/` are updated.

**Requirements:**
- Qdrant running locally: `docker-compose up -d`
- `OPENAI_API_KEY` set in `.env`
- `QDRANT_URL` (default: `http://localhost:6333`)

```bash
conda activate vidyasetu-backend
python scripts/create_embeddings.py
```

---

### `populate_data.py`
Populates the Supabase database tables with initial data from the JSON files.

**When to run:** On first deployment or after a database reset.

**Requirements:**
- `SUPABASE_URL` and `SUPABASE_KEY` set in `.env`

```bash
conda activate vidyasetu-backend
python scripts/populate_data.py
```

---

## Data Files (`data/rag/`)
| File | Contents |
|---|---|
| `colleges.json` | All J&K colleges with district, fees, hostel info |
| `courses.json` | All available courses |
| `Career_to_course.json` | Career → course mappings |
| `Course_to_college.json` | Course → college mappings |
| `riasec_score_to_career_weights.json` | RIASEC aptitude weights used by recommender |
| `roadmaps.json` | Career roadmap templates |
