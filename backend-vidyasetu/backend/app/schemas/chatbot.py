"""
Chatbot Pydantic Schemas
Request/Response models for the chatbot API and WebSocket.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    question: str
    user_id: Optional[str] = None  # For future context/history


class StreamMessage(BaseModel):
    """WebSocket message for streaming responses."""
    type: Literal["token", "complete", "error"]
    content: Optional[str] = None
    answer: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = None


class CollegeCard(BaseModel):
    """College information card."""
    college: str
    district: Optional[str] = None
    hostel: Optional[str] = None
    fees: Optional[str] = None
    course: Optional[str] = None


class CareerCard(BaseModel):
    """Career information card."""
    career: str
    courses: List[str] = []
    colleges: List[str] = []


class ChatResponse(BaseModel):
    """Response model for REST chat endpoint."""
    answer: str
    sources: Optional[List[Dict[str, Any]]] = None
    colleges: Optional[List[CollegeCard]] = None
    career_cards: Optional[List[CareerCard]] = None


class HealthResponse(BaseModel):
    """Health check response."""
    qdrant: str
    openai: str
