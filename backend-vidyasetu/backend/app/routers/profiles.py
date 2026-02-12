"""
Profile management endpoints for Students, Parents, and Colleges.
Each role has their own profile CRUD operations.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime

from app.dependencies.db_dependency import get_supabase_client
from app.dependencies.auth_dependency import (
    get_current_user, 
    get_student_user, 
    get_parent_user, 
    get_college_user,
    CurrentUser
)
from app.schemas.auth import UserRole
from app.schemas.profile import (
    StudentProfileUpdate,
    StudentProfileResponse,
    ParentProfileUpdate,
    ParentProfileResponse,
    CollegeProfileUpdate,
    CollegeProfileResponse,
)

router = APIRouter()


# ============================================================
# Student Profile Endpoints
# ============================================================

@router.get("/student", response_model=StudentProfileResponse, summary="Get student profile")
def get_student_profile(
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """Get the current student's profile."""
    result = supabase.table("StudentProfiles").select("*").eq("user_id", user.user_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return result.data


@router.put("/student", response_model=StudentProfileResponse, summary="Update student profile")
def update_student_profile(
    profile: StudentProfileUpdate,
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """Update the current student's profile."""
    update_data = profile.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    # Check if profile is complete
    required_fields = ["full_name", "gender", "locality", "category"]
    existing = supabase.table("StudentProfiles").select("*").eq("user_id", user.user_id).single().execute()
    
    if existing.data:
        merged = {**existing.data, **update_data}
        is_complete = all(merged.get(f) for f in required_fields)
        update_data["is_profile_complete"] = is_complete
    
    result = supabase.table("StudentProfiles").update(update_data).eq("user_id", user.user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return result.data[0]


@router.post("/student/invite-code", summary="Generate invite code for parent linking")
def generate_invite_code(
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """
    Generate a 6-character invite code for parent linking.
    Code expires in 24 hours.
    """
    import secrets
    from datetime import timedelta
    
    code = secrets.token_hex(3).upper()
    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()
    
    result = supabase.table("StudentProfiles").update({
        "invite_code": code,
        "invite_code_expires_at": expires_at
    }).eq("user_id", user.user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return {
        "invite_code": code,
        "expires_at": expires_at,
        "message": "Share this code with your parent. It expires in 24 hours."
    }


# ============================================================
# Parent Profile Endpoints
# ============================================================

@router.get("/parent", response_model=ParentProfileResponse, summary="Get parent profile")
def get_parent_profile(
    user: CurrentUser = Depends(get_parent_user),
    supabase = Depends(get_supabase_client)
):
    """Get the current parent's profile."""
    result = supabase.table("ParentProfiles").select("*").eq("user_id", user.user_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Parent profile not found")
    
    return result.data


@router.put("/parent", response_model=ParentProfileResponse, summary="Update parent profile")
def update_parent_profile(
    profile: ParentProfileUpdate,
    user: CurrentUser = Depends(get_parent_user),
    supabase = Depends(get_supabase_client)
):
    """Update the current parent's profile."""
    update_data = profile.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    # If awareness_quiz is submitted, mark profile as complete
    if update_data.get("awareness_quiz"):
        update_data["is_profile_complete"] = True
    
    result = supabase.table("ParentProfiles").update(update_data).eq("user_id", user.user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Parent profile not found")
    
    return result.data[0]


# ============================================================
# College Profile Endpoints
# ============================================================

@router.get("/college", response_model=CollegeProfileResponse, summary="Get college profile")
def get_college_profile(
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """Get the current college's profile."""
    result = supabase.table("CollegeProfiles").select("*").eq("user_id", user.user_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="College profile not found")
    
    return result.data


@router.put("/college", response_model=CollegeProfileResponse, summary="Update college profile")
def update_college_profile(
    profile: CollegeProfileUpdate,
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """Update the current college's profile."""
    update_data = profile.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    required_fields = ["college_name", "contact_name", "contact_email"]
    existing = supabase.table("CollegeProfiles").select("*").eq("user_id", user.user_id).single().execute()
    
    if existing.data:
        merged = {**existing.data, **update_data}
        is_complete = all(merged.get(f) for f in required_fields)
        update_data["is_profile_complete"] = is_complete
    
    result = supabase.table("CollegeProfiles").update(update_data).eq("user_id", user.user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="College profile not found")
    
    return result.data[0]


# ============================================================
# Generic Profile Endpoint (auto-detects role)
# ============================================================

@router.get("/me", summary="Get current user's profile based on role")
def get_my_profile(
    user: CurrentUser = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get the current user's profile.
    Automatically returns the correct profile type based on user role.
    """
    if user.role == UserRole.STUDENT:
        result = supabase.table("StudentProfiles").select("*").eq("user_id", user.user_id).single().execute()
        table = "StudentProfiles"
    elif user.role == UserRole.PARENT:
        result = supabase.table("ParentProfiles").select("*").eq("user_id", user.user_id).single().execute()
        table = "ParentProfiles"
    elif user.role == UserRole.COLLEGE:
        result = supabase.table("CollegeProfiles").select("*").eq("user_id", user.user_id).single().execute()
        table = "CollegeProfiles"
    else:
        raise HTTPException(status_code=400, detail="Unknown role")
    
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Profile not found in {table}")
    
    return {
        "role": user.role.value,
        "email": user.email,
        "profile": result.data
    }
