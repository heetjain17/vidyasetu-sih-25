from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from typing import List, Optional
from functools import wraps
import os

from app.schemas.auth import UserRole
from app.dependencies.db_dependency import get_supabase_client

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")  # Set this in your .env from Supabase settings


class CurrentUser:
    """Current authenticated user with role information"""
    def __init__(self, user_id: str, email: str, role: UserRole):
        self.user_id = user_id
        self.email = email
        self.role = role
    
    def __repr__(self):
        return f"CurrentUser(user_id={self.user_id}, email={self.email}, role={self.role})"


def get_current_user(request: Request, supabase=Depends(get_supabase_client)) -> CurrentUser:
    """
    Dependency to get the current authenticated user from JWT token.
    Returns CurrentUser object with user_id, email, and role.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Missing or invalid token"
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        user_id = payload.get("sub")
        email = payload.get("email")
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Invalid token: {str(e)}"
        )
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token: missing user ID"
        )
    
    # Fetch role from Users table
    try:
        result = supabase.table("Users").select("role").eq("u_id", user_id).single().execute()
        if result.data:
            role_str = result.data.get("role", "STUDENT")
            role = UserRole(role_str)
        else:
            # User exists in auth but not in Users table - create entry
            role = UserRole.STUDENT
    except Exception:
        role = UserRole.STUDENT
    
    return CurrentUser(user_id=user_id, email=email, role=role)


def require_role(*allowed_roles: UserRole):
    """
    Dependency factory that restricts access to specific roles.
    
    Usage:
        @router.get("/students-only")
        def students_only(user: CurrentUser = Depends(require_role(UserRole.STUDENT))):
            return {"message": f"Hello, student {user.email}"}
        
        @router.get("/multi-role")
        def multi_role(user: CurrentUser = Depends(require_role(UserRole.STUDENT, UserRole.PARENT))):
            return {"message": f"Hello, {user.role}"}
    """
    async def role_checker(
        request: Request,
        supabase=Depends(get_supabase_client)
    ) -> CurrentUser:
        current_user = get_current_user(request, supabase)
        
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {[r.value for r in allowed_roles]}, your role: {current_user.role.value}"
            )
        
        return current_user
    
    return role_checker


# Convenience dependencies for common role checks
def get_student_user(
    request: Request,
    supabase=Depends(get_supabase_client)
) -> CurrentUser:
    """Dependency that only allows STUDENT role"""
    current_user = get_current_user(request, supabase)
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Students only."
        )
    return current_user


def get_parent_user(
    request: Request,
    supabase=Depends(get_supabase_client)
) -> CurrentUser:
    """Dependency that only allows PARENT role"""
    current_user = get_current_user(request, supabase)
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Parents only."
        )
    return current_user


def get_college_user(
    request: Request,
    supabase=Depends(get_supabase_client)
) -> CurrentUser:
    """Dependency that only allows COLLEGE role"""
    current_user = get_current_user(request, supabase)
    if current_user.role != UserRole.COLLEGE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Colleges only."
        )
    return current_user
