
# codeblooded-ml-backend

Backend for Margadarsaka — FastAPI-based ML backend

## Project Structure


```
backend/
├─ app/
│   ├─ auth/            # Authentication module (Supabase integration, schemas, router)
│   ├─ models/          # SQLAlchemy DB models (placeholder)
│   ├─ dependencies/    # FastAPI dependencies (CORS, DB, auth)
│   ├─ services/        # Business logic (user_service, inference_service)
│   ├─ ml_models/       # ML artifacts (model.onnx, preprocessor.json)
│   ├─ routers/         # API routers (predict.py, health.py)
│   ├─ main.py          # FastAPI entrypoint
│   └─ __init__.py      # App package init
└─ tests/               # Unit and integration tests (test_health.py, test_auth.py)
```


## Features
- Modular FastAPI app structure
- Supabase authentication and user management
- Full CRUD API for users table (create, read, update, delete)
- Read-only API endpoints for careers, college list, courses, course-college, roadmap, and college facilities
- Pydantic schemas for request/response validation
- ML model inference endpoints (predict router stub)
- Health check endpoint (health router stub)
- CORS configuration for frontend-backend integration
- Example tests with pytest and FastAPI TestClient

## Testing

Tests are located in the `tests/` directory. Example tests include health check and authentication tests using FastAPI TestClient and pytest.

To run all tests:

```bash
pytest
```

### Example: Authentication Test

See `tests/test_auth.py` for an example of how to test registration and login endpoints with FastAPI TestClient. This test covers user registration (handles already registered case) and login, asserting that a valid access token is returned.

## Getting Started

1. Install dependencies:
	```bash
	cd backend
	pip install -r requirements.txt
	```
2. Run the server:
	```bash
	uvicorn app.main:app --reload
	```

- All authentication logic uses Supabase (no local password/JWT logic)

## API Endpoints
- `/auth/*` — Authentication (register, login, OAuth, signout)
- `/users/*` — CRUD operations for users table
- `/data/careers` — Read all careers
- `/data/college-list` — Read all colleges
- `/data/courses` — Read all courses
- `/data/course-college` — Read all course-college mappings
- `/data/roadmap` — Read all roadmaps
- `/data/college-facilities` — Read all college facilities
- Pydantic schemas for auth moved to `auth/schemas.py`
- `auth/security.py` removed (no longer needed)
- `auth/__init__.py` updated with package docstring

## Contributing
See [CHANGELOG.md](CHANGELOG.md) for updates.

## Contributing
See [CHANGELOG.md](CHANGELOG.md) for updates.

---
*Created: 23 Nov 2025*
