"""
Recommendation and quiz schemas.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ScoresSchema(BaseModel):
    """Aptitude test scores (7 dimensions)"""
    Logical_reasoning: float = Field(..., ge=0)
    Quantitative_reasoning: float = Field(..., ge=0)
    Analytical_reasoning: float = Field(..., ge=0)
    Verbal_reasoning: float = Field(..., ge=0)
    Spatial_reasoning: float = Field(..., ge=0)
    Creativity: float = Field(..., ge=0)
    Enter: float = Field(..., ge=0)
    language: Optional[str] = Field("english")


class StudentActualSchema(BaseModel):
    """Student's actual profile data for college matching"""
    Extra_curriculars: List[str] = Field(default=[])
    Hobbies: List[str] = Field(default=[])
    Student_Locality: str = Field(...)
    Gender: str = Field(...)
    Students_Category: str = Field(...)
    Budget: float = Field(..., ge=0)


class StudentPreferencesSchema(BaseModel):
    """Student's preference weights (0-5 scale)"""
    Importance_Locality: float = Field(..., ge=0, le=5)
    Importance_Financial: float = Field(..., ge=0, le=5)
    Importance_Eligibility: float = Field(..., ge=0, le=5)
    Importance_Events_hobbies: float = Field(..., ge=0, le=5)
    Importance_Quality: float = Field(..., ge=0, le=5)


class RecommenderRequest(BaseModel):
    """Request body for recommendations"""
    scores: ScoresSchema
    student_actual: StudentActualSchema
    student_preferences: StudentPreferencesSchema

    class Config:
        json_schema_extra = {
            "example": {
                "scores": {
                    "Logical_reasoning": 290,
                    "Quantitative_reasoning": 330,
                    "Analytical_reasoning": 470,
                    "Verbal_reasoning": 346,
                    "Spatial_reasoning": 220,
                    "Creativity": 345,
                    "Enter": 370,
                    "language": "english"
                },
                "student_actual": {
                    "Extra_curriculars": ["coding", "debate"],
                    "Hobbies": ["reading", "chess"],
                    "Student_Locality": "srinagar",
                    "Gender": "Male",
                    "Students_Category": "General",
                    "Budget": 100000
                },
                "student_preferences": {
                    "Importance_Locality": 4,
                    "Importance_Financial": 3,
                    "Importance_Eligibility": 2,
                    "Importance_Events_hobbies": 3,
                    "Importance_Quality": 5
                }
            }
        }


class TranslateRequest(BaseModel):
    """Request body for translation"""
    text: str = Field(..., description="Text to translate")
    target_language: str = Field(..., description="Target language: hindi, urdu, or kashmiri")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "This career matches your analytical skills.",
                "target_language": "hindi"
            }
        }
