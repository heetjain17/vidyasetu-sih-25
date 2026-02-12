
from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """User role enum matching database constraint"""
    STUDENT = "STUDENT"
    PARENT = "PARENT"
    COLLEGE = "COLLEGE"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT  # Default to student


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    role: UserRole  # Include role in response
    user_id: str  # Include user ID for frontend
