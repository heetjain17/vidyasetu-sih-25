"""
User management endpoints.
Note: Direct Users table CRUD is deprecated. Use auth/register instead.
These endpoints are kept for admin/debugging purposes only.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.dependencies.db_dependency import get_supabase_client
from app.dependencies.auth_dependency import get_current_user, CurrentUser
from app.schemas.auth import UserRole

router = APIRouter()


class UserCreate(BaseModel):
    """Schema for creating a user directly (admin only)"""
    email: EmailStr
    role: UserRole = UserRole.STUDENT


class UserOut(BaseModel):
    """Response schema for user data"""
    u_id: str
    email: str
    role: str
    created_at: Optional[str] = None


@router.post("/", response_model=UserOut, summary="Create user (admin)")
def create_user(user: UserCreate, supabase=Depends(get_supabase_client)):
    """
    Create a user directly in the Users table.
    Note: For normal registration, use /auth/register instead.
    This endpoint does NOT create Supabase Auth entry.
    """
    import uuid
    
    user_id = str(uuid.uuid4())
    result = supabase.table("Users").insert({
        "u_id": user_id,
        "email": user.email,
        "role": user.role.value
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create user")
    
    return result.data[0]


@router.get("/", response_model=List[UserOut], summary="List all users (admin)")
def list_users(supabase=Depends(get_supabase_client)):
    """List all users in the database."""
    result = supabase.table("Users").select("*").execute()
    return result.data or []


@router.get("/me", response_model=UserOut, summary="Get current user")
def get_current_user_info(
    user: CurrentUser = Depends(get_current_user),
    supabase=Depends(get_supabase_client)
):
    """Get the current authenticated user's info."""
    result = supabase.table("Users").select("*").eq("u_id", user.user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data


@router.get("/{user_id}", response_model=UserOut, summary="Get user by ID")
def get_user(user_id: str, supabase=Depends(get_supabase_client)):
    """Get a specific user by their ID."""
    result = supabase.table("Users").select("*").eq("u_id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data


@router.delete("/{user_id}", summary="Delete user (admin)")
def delete_user(user_id: str, supabase=Depends(get_supabase_client)):
    """Delete a user by ID. This will cascade delete all related data."""
    result = supabase.table("Users").delete().eq("u_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found or not deleted")
    return {"message": "User deleted"}
