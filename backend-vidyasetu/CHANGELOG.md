
# Changelog



## [0.1.4] - 2025-11-26
### Added
- CRUD API endpoints for users table (`routers/users.py`)
- Read-only API endpoints for careers, college list, courses, course-college, roadmap, and college facilities (`routers/data.py`)
- Registered new routers in `main.py`
- Updated README and API documentation for new endpoints

## [0.1.3] - 2025-11-25
### Added
- Example authentication test (`tests/test_auth.py`) using FastAPI TestClient and pytest
- CORS configuration via `dependencies/cors.py` and FastAPI middleware
- Created `dependencies/auth_dependency.py` for JWT-based authentication
- Created `dependencies/db_dependency.py` for Supabase client injection
- Modularized routers (`routers/health.py`, `routers/predict.py`)
- Updated README and CHANGELOG to document test setup and authentication test example

## [0.1.2] - 2025-11-24
### Added
- Created `tests/` directory for unit/integration tests
- Added example health check test using FastAPI TestClient and pytest

## [0.1.1] - 2025-11-23
### Changed
- Moved auth Pydantic schemas to `auth/schemas.py`
- Updated `auth/__init__.py` with docstring
- Removed `auth/security.py` (Supabase handles all auth logic)

## [0.1.0] - 2025-11-23
### Added
- Initial FastAPI backend project structure
- Modular app layout: auth, models, dependencies, services, routers, ml_models
- requirements.txt with FastAPI, SQLAlchemy, JWT, ONNX, and more
- Placeholder files for all modules
- Main FastAPI entrypoint with router includes
