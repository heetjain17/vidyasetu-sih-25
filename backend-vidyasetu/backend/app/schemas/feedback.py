"""Feedback-related Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional


class FeedbackCreate(BaseModel):
    """Schema for creating a feedback submission."""
    role: str
    recommendations_useful: str  # Yes / Somewhat / No
    recommendations_accurate: str  # Yes / Somewhat / No
    suggestions: Optional[str] = None
