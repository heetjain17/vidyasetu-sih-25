
from dotenv import load_dotenv, find_dotenv
import os
import pathlib

# Load .env robustly before importing application modules that rely on env vars
# (like modules that construct Supabase clients at import time).
dotenv_path = find_dotenv()
if not dotenv_path:
    dotenv_path = pathlib.Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path)

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.routers import predict, health, recommend, colleges, roadmaps, timeline, discussion_forum
from app.routers import users, data
from app.routers import profiles, links, college_admin, chatbot, career_hub, feedback  # New routers
from app.auth.router import router as auth_router
from app.dependencies.cors import configure_cors

# ============================================================
# FastAPI App with Swagger UI Auth Configuration
# ============================================================
app = FastAPI(
    title="Margadarshaka API",
    description="""
    Career Guidance Platform API with Multi-Role Authentication.
    
    ## Roles
    - **STUDENT**: Take assessments, get recommendations, manage profile
    - **PARENT**: Link to students, view their recommendations
    - **COLLEGE**: Manage college profile (coming soon)
    
    ## Authentication
    1. Register/Login to get an access token
    2. Click "Authorize" button and enter: `Bearer <your_token>`
    3. All protected endpoints will now work
    """,
    version="2.0.0",
)

# Configure CORS
configure_cors(app)


# ============================================================
# Custom OpenAPI Schema with JWT Bearer Auth
# ============================================================
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Add JWT Bearer security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token from /auth/login or /auth/register"
        }
    }
    
    # Apply security globally (optional - can also be per-endpoint)
    openapi_schema["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# ============================================================
# Routers
# ============================================================

# Auth routes (public)
app.include_router(auth_router, prefix="/auth", tags=["🔐 Authentication"])

# Profile routes (role-based)
app.include_router(profiles.router, prefix="/profile", tags=["👤 Profiles"])

# Parent-Student Links
app.include_router(links.router, prefix="/links", tags=["🔗 Parent-Student Links"])

# Existing routes
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(data.router, prefix="/data", tags=["data"])
app.include_router(predict.router, prefix="/predict", tags=["predict"])
app.include_router(recommend.router, prefix="/recommend", tags=["🎯 Recommendations"])
app.include_router(colleges.router, tags=["🏫 Colleges"])
app.include_router(roadmaps.router, tags=["roadmaps"])
app.include_router(timeline.router, tags=["timeline"])
app.include_router(discussion_forum.router, tags=["forum"])
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(college_admin.router, tags=["🏫 College Admin"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["💬 Chatbot"])
app.include_router(career_hub.router, tags=["📚 Career Hub"])
app.include_router(feedback.router, tags=["📝 Feedback"])


@app.get("/", tags=["root"])
def root():
    return {
        "message": "Margadarshaka API is running",
        "docs": "/docs",
        "version": "2.0.0"
    }
