# app/ — Application Module

## Structure

| Module | Purpose |
|---|---|
| `main.py` | FastAPI entry point, router registration, CORS |
| `auth/` | JWT auth: register, login, OAuth, roles |
| `routers/` | HTTP endpoint handlers (one file per feature) |
| `services/` | Business logic (recommender, chatbot, db access) |
| `utils/` | Pure utility functions (scoring, math, embeddings) |
| `schemas/` | All Pydantic request/response models |
| `dependencies/` | FastAPI dependency injection (auth, db) |
| `ml_models/` | ONNX model file for internal ML inference |
