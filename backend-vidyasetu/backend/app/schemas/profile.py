"""
Profile schemas for Students, Parents, and Colleges.
"""
from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# Student Profile Schemas
# ============================================================

class StudentProfileUpdate(BaseModel):
    """Schema for updating student profile"""
    full_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    locality: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    grade: Optional[str] = None
    board: Optional[str] = None
    school_name: Optional[str] = None
    budget: Optional[int] = None
    extracurriculars: Optional[List[str]] = None
    hobbies: Optional[List[str]] = None
    importance_locality: Optional[int] = None
    importance_financial: Optional[int] = None
    importance_eligibility: Optional[int] = None
    importance_events_hobbies: Optional[int] = None
    importance_quality: Optional[int] = None


class StudentProfileResponse(BaseModel):
    """Response schema for student profile"""
    id: str
    user_id: str
    full_name: Optional[str] = None
    gender: Optional[str] = None
    locality: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    grade: Optional[str] = None
    board: Optional[str] = None
    school_name: Optional[str] = None
    budget: Optional[int] = None
    extracurriculars: Optional[List[str]] = None
    hobbies: Optional[List[str]] = None
    importance_locality: Optional[int] = None
    importance_financial: Optional[int] = None
    importance_eligibility: Optional[int] = None
    importance_events_hobbies: Optional[int] = None
    importance_quality: Optional[int] = None
    is_profile_complete: bool = False
    invite_code: Optional[str] = None


# ============================================================
# Parent Profile Schemas
# ============================================================

class ParentProfileUpdate(BaseModel):
    """Schema for updating parent profile"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    awareness_quiz: Optional[dict] = None  # Stores quiz answers as JSON


class ParentProfileResponse(BaseModel):
    """Response schema for parent profile"""
    id: str
    user_id: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    awareness_quiz: Optional[dict] = None
    is_profile_complete: bool = False


# ============================================================
# College Profile Schemas
# ============================================================

class CollegeProfileUpdate(BaseModel):
    """Schema for updating college profile"""
    college_name: Optional[str] = None
    aishe_code: Optional[str] = None
    contact_name: Optional[str] = None
    designation: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class CollegeProfileResponse(BaseModel):
    """Response schema for college profile"""
    id: str
    user_id: str
    college_name: Optional[str] = None
    aishe_code: Optional[str] = None
    contact_name: Optional[str] = None
    designation: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_verified: bool = False
    is_profile_complete: bool = False
