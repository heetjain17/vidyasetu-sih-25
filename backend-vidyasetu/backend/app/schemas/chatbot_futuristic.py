"""Futuristic career generator Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import List, Optional


class FuturisticCareerRequest(BaseModel):
    """Request model for futuristic career generation."""
    interests: str = Field(..., description="User's interests or query about future careers")
    hobbies: Optional[List[str]] = Field(default=None)
    skills: Optional[List[str]] = Field(default=None)
    location: Optional[str] = Field(default="India")
    current_field: Optional[str] = Field(default=None)
    num_careers: Optional[int] = Field(default=4, ge=1, le=10)

    model_config = {
        "json_schema_extra": {
            "example": {
                "interests": "artificial intelligence and robotics",
                "hobbies": ["coding", "gaming"],
                "skills": ["Python", "Machine Learning"],
                "location": "Jammu",
                "current_field": "Computer Science",
                "num_careers": 4
            }
        }
    }


class FuturisticCareerItem(BaseModel):
    """Individual futuristic career suggestion."""
    title: str
    description: Optional[str] = None
    why_suitable: Optional[str] = None
    skills_needed: Optional[List[str]] = None
    getting_started: Optional[List[str]] = None
    future_demand: Optional[str] = None
    salary_potential: Optional[str] = None


class FuturisticCareerResponse(BaseModel):
    """Response model for futuristic career generation."""
    success: bool
    careers: List[FuturisticCareerItem] = []
    answer_text: Optional[str] = None
    note: Optional[str] = None
    error: Optional[str] = None
