# CORS configuration for FastAPI
from fastapi.middleware.cors import CORSMiddleware

def configure_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Change to your frontend domain in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
