"""
DEPRECATED: predict.py
This endpoint is a stub. The ML-based prediction logic has been
consolidated into the /recommend/ pipeline (recommender_db.py).
"""
from fastapi import APIRouter

router = APIRouter()

@router.post("/", summary="[Deprecated] ML prediction stub", deprecated=True)
def predict():
    """
    This endpoint is deprecated. Use POST /recommend/ instead.
    """
    return {"message": "This endpoint is deprecated. Use POST /recommend/ for recommendations."}
