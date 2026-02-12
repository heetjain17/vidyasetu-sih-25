"""
Parent-Student link schemas.
"""
from pydantic import BaseModel
from typing import Optional


class ConnectRequest(BaseModel):
    """Request to connect parent with student using invite code"""
    invite_code: str


class LinkResponse(BaseModel):
    """Response for a parent-student link"""
    id: str
    parent_id: str
    student_id: str
    status: str
    requested_at: str
    responded_at: Optional[str] = None


class LinkedStudentResponse(BaseModel):
    """Response for a linked student (parent view)"""
    link_id: str
    student_id: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    status: str
    linked_at: Optional[str] = None


class PendingRequestResponse(BaseModel):
    """Response for a pending link request (student view)"""
    link_id: str
    parent_id: str
    parent_name: Optional[str] = None
    parent_relationship: Optional[str] = None
    requested_at: str
