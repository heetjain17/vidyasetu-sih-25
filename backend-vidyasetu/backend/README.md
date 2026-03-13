# 🎓 Margadarshaka API: Comprehensive Career Guidance Platform

Margadarshaka is a state-of-the-art career guidance and college recommendation platform designed for students in Jammu & Kashmir. It leverages psychometric assessments (RIASEC), machine learning-based matching, and an AI-powered RAG chatbot to provide personalized academic pathways.

---

## 🏗️ System Architecture

### 📁 Core Directory Structure
```
backend/
├── app/
│   ├── main.py                 # FastAPI Entry Point (Routes & Middleware)
│   ├── auth/                   # JWT & Role-Based Access Control (RBAC)
│   ├── routers/                # API Endpoints (Profiles, Forum, Career Hub, etc.)
│   ├── services/               # Unified Business Logic
│   │   ├── recommender_db.py   # Consolidated RIASEC & Matching Engine
│   │   ├── chatbot_service.py  # Unified RAG Chatbot (OpenAI + Ollama Fallback)
│   │   └── db_service.py       # Supabase CRUD Layer
│   ├── utils/                  # Refined Utility Architecture
│   │   ├── scoring_logic.py    # Eligibility, Quality & Locality Scoring
│   │   ├── embedding_utils.py  # Vector Embedding & Geo-Caching
│   │   ├── riasec_utils.py     # Aptitude to RIASEC Mapping
│   │   └── math_utils.py       # Haversine & Cosine Similarity
│   ├── dependencies/           # Auth & DB Injection
│   └── schemas/                # Pydantic Structural Models
├── .env                        # System Configurations
└── requirements.txt            # Python Ecosystem
```

---

## 🚀 Key Modules & Features

### 🎯 1. Smart Recommendation Engine
Uses a 3-stage pipeline to find the perfect career and college:
1.  **Aptitude Mapping**: Converts raw test scores into a normalized RIASEC vector (Realistic, Investigative, Artistic, Social, Enterprising, Conventional).
2.  **Career Correlation**: Maps RIASEC profiles to high-demand careers using vector similarity.
3.  **Heuristic College Scoring**: Scores colleges across 5 dimensions:
    - **Locality**: Haversine distance-based matching (Prefers closer schools/hostels).
    - **Financial**: Budget vs. Effective Fee (Fee - Scholarship).
    - **Eligibility**: Category-based seat availability and gender-specific filtering.
    - **Quality**: Placement rates, package averages, and infrastructure facilities.
    - **Cultural**: Hobby & Extra-curricular matching.

### 💬 2. Unified RAG Chatbot
A resilient AI assistant capable of answering complex academic queries.
-   **Dual-Provider Strategy**: Automatically uses OpenAI (GPT-4o-mini) with a fallback to local Ollama (Llama 3).
-   **Semantic Search**: Uses Qdrant vector database to retrieve hyper-local knowledge about J&K colleges.
-   **Guardrails**: Built-in validation to prevent hallucinations and ensure pedagogical safety.

### 📚 3. Career Hub & Forum
-   **Career Roadmaps**: Detailed academic paths including industry trends and government exams.
-   **Study Materials**: Curated resources for various competitive paths.
-   **Discussion Forum**: Community-driven Q&A with integrated AI support for unanswered questions.

---

## 🔐 Security & Roles

Margadarshaka uses **JWT Bearer Authentication** with strict Role-Based Access Control:

| Role | Permissions |
| :--- | :--- |
| **`STUDENT`** | Take assessments, get recs, post in forum, manage profile. |
| **`PARENT`** | Link to multiple student accounts, monitor performance/recommendations. |
| **`COLLEGE`** | Update college facilities, placement data, and event flags. |

---

## 🔐 API Quick Reference

### 🔑 Authentication
- `POST /auth/register` - Create a new account.
- `POST /auth/login` - Obtain access token.

### 🎯 Recommendations
- `POST /recommend/` - Public matching (Input: Quiz scores).
- `POST /recommend/full` - Authenticated matching (Saves results to DB).
- `GET /recommend/saved` - Retrieve history.

### 💬 Chatbot
- `WS /chatbot/ws` - WebSocket real-time streaming RAG.
- `POST /chatbot/` - Non-streaming REST fallback.

### 👤 Profiles & Links
- `GET /profile/me` - Auto-detect role and return data.
- `POST /profile/student/invite-code` - Generate code for parent linking.
- `POST /links/connect` - Link parent to student.

---

## 🛠️ Local Setup

1.  **Clone & Navigate**:
    ```bash
    cd backend
    ```
2.  **Environment Setup**:
    Create a `.env` file from the following template:
    ```env
    SUPABASE_URL=...
    SUPABASE_KEY=...
    OPENAI_API_KEY=...
    QDRANT_URL=...
    QDRANT_API_KEY=...
    ```
3.  **Run Development Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    Access Interactive Docs at: `http://localhost:8000/docs`

---
*© 2024 Margadarshaka - Empowering the Youth of J&K.*
