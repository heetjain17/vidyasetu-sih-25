from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def predict():
    return {"message": "Prediction endpoint stub"}
