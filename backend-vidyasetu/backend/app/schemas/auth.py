"""
Authentication schemas.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """User role enum matching database constraint"""
    STUDENT = "STUDENT"
    PARENT = "PARENT"
    COLLEGE = "COLLEGE"


class RegisterRequest(BaseModel):
    """Request body for user registration"""
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT


class LoginRequest(BaseModel):
    """Request body for user login"""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Response after successful authentication"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    role: UserRole
    user_id: str
