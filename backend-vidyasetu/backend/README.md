# Backend - Margadarshaka API

## Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   │
│   ├── auth/                   # Authentication module
│   │   ├── __init__.py
│   │   └── router.py           # Auth endpoints (/auth/*)
│   │
│   ├── schemas/                # Pydantic schemas (request/response models)
│   │   ├── __init__.py         # Re-exports all schemas
│   │   ├── auth.py             # UserRole, RegisterRequest, AuthResponse
│   │   ├── profile.py          # Student/Parent/College profile schemas
│   │   ├── recommendation.py   # Quiz scores, recommender schemas
│   │   ├── links.py            # Parent-student link schemas
│   │   └── forum.py            # Discussion forum schemas
│   │
│   ├── routers/                # API route handlers
│   │   ├── profiles.py         # Profile CRUD (/profile/*)
│   │   ├── links.py            # Parent-student links (/links/*)
│   │   ├── recommend.py        # Recommendations (/recommend/*)
│   │   ├── colleges.py         # College search (/colleges/*)
│   │   ├── discussion_forum.py # Forum (/forum/*)
│   │   ├── roadmaps.py         # Career roadmaps
│   │   ├── timeline.py         # Exam timeline
│   │   ├── users.py            # User CRUD
│   │   ├── data.py             # Data endpoints
│   │   ├── predict.py          # ML predictions
│   │   └── health.py           # Health check
│   │
│   ├── services/               # Business logic & external services
│   │   ├── recommender_db.py   # Main recommendation engine
│   │   ├── recommender2_db.py  # College scoring logic
│   │   ├── db_service.py       # Database utilities
│   │   ├── discussion_forum_service.py
│   │   └── google_calendar.py  # Calendar integration
│   │
│   ├── utils/                  # Utility functions
│   │   ├── translation.py      # Language translation
│   │   ├── llm_client.py       # LLM API client
│   │   ├── explain_career_api.py
│   │   ├── explain_college_*.py
│   │   ├── score_model2.py     # College scoring
│   │   └── model1_utils.py     # RIASEC calculations
│   │
│   ├── dependencies/           # FastAPI dependencies
│   │   ├── auth_dependency.py  # get_current_user, require_role
│   │   ├── db_dependency.py    # get_supabase_client
│   │   └── cors.py             # CORS configuration
│   │
│   ├── models/                 # Data models (if using ORM)
│   │
│   ├── ml_models/              # ML model files
│   │
│   └── cache/                  # Cache files
│
├── .env                        # Environment variables
├── requirements.txt            # Python dependencies
└── database_schema.sql         # SQL schema for Supabase
```

## API Documentation

Visit `http://localhost:8000/docs` for Swagger UI.

### Authentication

1. **Register**: `POST /auth/register` with `{email, password, role}`
2. **Login**: `POST /auth/login` → Returns `{access_token, role, user_id}`
3. Use token: Add header `Authorization: Bearer <token>`

### User Roles

| Role      | Description                           |
| --------- | ------------------------------------- |
| `STUDENT` | Take assessments, get recommendations |
| `PARENT`  | Link to students, view their data     |
| `COLLEGE` | Manage college profile                |

### Key Endpoints

| Endpoint                                   | Role    | Description                    |
| ------------------------------------------ | ------- | ------------------------------ |
| `POST /recommend/full`                     | Student | Get & save recommendations     |
| `GET /profile/me`                          | Any     | Get profile based on role      |
| `POST /profile/student/invite-code`        | Student | Generate parent linking code   |
| `POST /links/connect`                      | Parent  | Connect using invite code      |
| `GET /links/children/{id}/recommendations` | Parent  | View student's recommendations |

## Running Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
SUPABASE_JWT_SECRET=<jwt-secret-from-supabase>
GROQ_API_KEY=<for-llm-explanations>
```
