# CORS configuration for FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware

def configure_cors(app):
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]
    
    if not allowed_origins:
        allowed_origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
