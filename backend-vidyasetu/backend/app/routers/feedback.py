"""
Feedback API endpoint.
Stores user feedback about recommendations.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.dependencies.db_dependency import get_supabase_client
from app.dependencies.auth_dependency import get_current_user, CurrentUser

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackCreate(BaseModel):
    role: str  # Student / Parent / SPOC
    recommendations_useful: str  # Yes / Somewhat / No
    recommendations_accurate: str  # Yes / Somewhat / No
    suggestions: Optional[str] = None


@router.post("/", summary="Submit feedback")
def submit_feedback(
    feedback: FeedbackCreate,
    user: CurrentUser = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """Submit user feedback about recommendations."""
    
    feedback_data = {
        "user_id": user.user_id,
        "role": feedback.role,
        "recommendations_useful": feedback.recommendations_useful,
        "recommendations_accurate": feedback.recommendations_accurate,
        "suggestions": feedback.suggestions,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("Feedback").insert(feedback_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to submit feedback")
    
    return {"message": "Feedback submitted successfully", "id": result.data[0].get("id")}


@router.get("/my", summary="Get my feedback")
def get_my_feedback(
    user: CurrentUser = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """Get current user's submitted feedback."""
    
    result = supabase.table("Feedback").select("*").eq("user_id", user.user_id).order("created_at", desc=True).execute()
    
    return {"data": result.data or []}
