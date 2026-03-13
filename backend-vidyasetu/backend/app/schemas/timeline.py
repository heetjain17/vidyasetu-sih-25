"""Timeline-related Pydantic schemas."""
from pydantic import BaseModel, Field, EmailStr
from typing import List


class WhatsAppSyncRequest(BaseModel):
    """Request to subscribe to exam updates via WhatsApp."""
    phone_number: str = Field(..., description="WhatsApp number with country code", example="+919876543210")
    exam_id: str = Field(..., description="ID of the exam to subscribe to")
    exam_name: str = Field(..., description="Name of the exam")


class CalendarSyncRequest(BaseModel):
    """Request to sync exam schedule to Google Calendar."""
    email: EmailStr = Field(..., description="User's Google email address")
    exam_id: str = Field(..., description="ID of the exam to sync")
    exam_name: str = Field(..., description="Name of the exam")
    events: List[dict] = Field(..., description="List of events to add")
