"""
Parent-Student Link Management Endpoints.
Allows parents to connect with students using invite codes.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime

from app.dependencies.db_dependency import get_supabase_client
from app.dependencies.auth_dependency import (
    get_current_user, 
    get_student_user, 
    get_parent_user,
    CurrentUser
)
from app.schemas.auth import UserRole
from app.schemas.links import ConnectRequest

router = APIRouter()


# ============================================================
# Parent Endpoints
# ============================================================

@router.post("/connect", summary="Connect with student using invite code")
def connect_with_student(
    request: ConnectRequest,
    user: CurrentUser = Depends(get_parent_user),
    supabase = Depends(get_supabase_client)
):
    """
    Parent connects with a student using their invite code.
    Creates a PENDING link that the student must accept.
    """
    invite_code = request.invite_code.upper().strip()
    
    # Find student with this invite code
    student_result = supabase.table("StudentProfiles").select(
        "user_id, invite_code_expires_at"
    ).eq("invite_code", invite_code).single().execute()
    
    if not student_result.data:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    student_id = student_result.data["user_id"]
    expires_at = student_result.data.get("invite_code_expires_at")
    
    # Check if code is expired
    if expires_at:
        expire_time = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if datetime.utcnow().replace(tzinfo=expire_time.tzinfo) > expire_time:
            raise HTTPException(status_code=400, detail="Invite code has expired")
    
    # Check if link already exists
    existing_result = supabase.table("ParentStudentLinks").select("id, status").eq(
        "parent_id", user.user_id
    ).eq("student_id", student_id).maybe_single().execute()
    
    existing_data = existing_result.data if existing_result else None
    
    if existing_data:
        status_val = existing_data["status"]
        if status_val == "ACCEPTED":
            raise HTTPException(status_code=400, detail="You are already linked with this student")
        else:
            # Update existing link to ACCEPTED (for PENDING or REJECTED)
            supabase.table("ParentStudentLinks").update({
                "status": "ACCEPTED"
            }).eq("id", existing_data["id"]).execute()
            
            # Clear invite code
            supabase.table("StudentProfiles").update({
                "invite_code": None,
                "invite_code_expires_at": None
            }).eq("user_id", student_id).execute()
            
            return {"message": "Connected with student successfully", "status": "ACCEPTED"}
    
    # Create new link with ACCEPTED status (direct connection)
    link_result = supabase.table("ParentStudentLinks").insert({
        "parent_id": user.user_id,
        "student_id": student_id,
        "status": "ACCEPTED",
        "requested_at": datetime.utcnow().isoformat()
    }).execute()
    
    if not link_result.data:
        raise HTTPException(status_code=500, detail="Failed to create connection")
    
    # Clear the invite code (one-time use)
    supabase.table("StudentProfiles").update({
        "invite_code": None,
        "invite_code_expires_at": None
    }).eq("user_id", student_id).execute()
    
    return {
        "message": "Connected with student successfully",
        "link_id": link_result.data[0]["id"],
        "status": "ACCEPTED"
    }


@router.get("/children", summary="Get linked students (for parents)")
def get_linked_students(
    user: CurrentUser = Depends(get_parent_user),
    supabase = Depends(get_supabase_client)
):
    """Get all students linked to this parent."""
    links_result = supabase.table("ParentStudentLinks").select(
        "id, student_id, status, requested_at, responded_at"
    ).eq("parent_id", user.user_id).execute()
    
    if not links_result.data:
        return {"children": [], "message": "No linked students yet"}
    
    children = []
    for link in links_result.data:
        student_id = link["student_id"]
        student = supabase.table("StudentProfiles").select("full_name").eq("user_id", student_id).single().execute()
        user_data = supabase.table("Users").select("email").eq("u_id", student_id).single().execute()
        
        children.append({
            "link_id": link["id"],
            "student_id": student_id,
            "student_name": student.data.get("full_name") if student.data else None,
            "student_email": user_data.data.get("email") if user_data.data else None,
            "status": link["status"],
            "linked_at": link.get("responded_at")
        })
    
    return {"children": children}


@router.get("/children/{student_id}/recommendations", summary="Get student's recommendations")
def get_student_recommendations(
    student_id: str,
    user: CurrentUser = Depends(get_parent_user),
    supabase = Depends(get_supabase_client)
):
    """Get a linked student's recommendations. Only works if the link is ACCEPTED."""
    link = supabase.table("ParentStudentLinks").select("status").eq(
        "parent_id", user.user_id
    ).eq("student_id", student_id).single().execute()
    
    if not link.data:
        raise HTTPException(status_code=404, detail="No link found with this student")
    
    if link.data["status"] != "ACCEPTED":
        raise HTTPException(status_code=403, detail=f"Link not accepted. Current status: {link.data['status']}")
    
    recommendations = supabase.table("Recommendations").select("*").eq(
        "user_id", student_id
    ).order("created_at", desc=True).limit(1).execute()
    
    if not recommendations.data:
        return {"message": "No recommendations found for this student", "recommendations": None}
    
    student = supabase.table("StudentProfiles").select("full_name, grade, school_name").eq("user_id", student_id).single().execute()
    
    return {
        "student": student.data if student.data else {},
        "recommendations": recommendations.data[0]
    }


@router.get("/children/{student_id}/profile", summary="Get student's profile")
def get_student_profile(
    student_id: str,
    user: CurrentUser = Depends(get_parent_user),
    supabase = Depends(get_supabase_client)
):
    """Get a linked student's profile. Only works if the link is ACCEPTED."""
    link = supabase.table("ParentStudentLinks").select("status").eq(
        "parent_id", user.user_id
    ).eq("student_id", student_id).maybe_single().execute()
    
    link_data = link.data if link else None
    
    if not link_data:
        raise HTTPException(status_code=404, detail="No link found with this student")
    
    if link_data["status"] != "ACCEPTED":
        raise HTTPException(status_code=403, detail=f"Link not accepted. Current status: {link_data['status']}")
    
    profile = supabase.table("StudentProfiles").select(
        "full_name, gender, locality, category, grade, board, school_name, hobbies, extracurriculars"
    ).eq("user_id", student_id).maybe_single().execute()
    
    profile_data = profile.data if profile else None
    
    if not profile_data:
        return {"message": "No profile found for this student", "profile": None}
    
    return {"profile": profile_data}


# ============================================================
# Student Endpoints
# ============================================================

@router.get("/pending", summary="Get pending link requests (for students)")
def get_pending_requests(
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """Get all pending link requests for this student."""
    links = supabase.table("ParentStudentLinks").select(
        "id, parent_id, requested_at"
    ).eq("student_id", user.user_id).eq("status", "PENDING").execute()
    
    if not links.data:
        return {"pending_requests": [], "message": "No pending requests"}
    
    requests = []
    for link in links.data:
        parent = supabase.table("ParentProfiles").select("full_name, relationship").eq("user_id", link["parent_id"]).single().execute()
        requests.append({
            "link_id": link["id"],
            "parent_id": link["parent_id"],
            "parent_name": parent.data.get("full_name") if parent.data else None,
            "parent_relationship": parent.data.get("relationship") if parent.data else None,
            "requested_at": link["requested_at"]
        })
    
    return {"pending_requests": requests}


@router.post("/{link_id}/accept", summary="Accept parent link request")
def accept_link_request(
    link_id: str,
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """Student accepts a parent's link request."""
    link = supabase.table("ParentStudentLinks").select("*").eq("id", link_id).eq("student_id", user.user_id).single().execute()
    
    if not link.data:
        raise HTTPException(status_code=404, detail="Link request not found")
    
    if link.data["status"] != "PENDING":
        raise HTTPException(status_code=400, detail=f"Cannot accept link with status: {link.data['status']}")
    
    supabase.table("ParentStudentLinks").update({
        "status": "ACCEPTED",
        "responded_at": datetime.utcnow().isoformat()
    }).eq("id", link_id).execute()
    
    return {"message": "Link request accepted", "status": "ACCEPTED"}


@router.post("/{link_id}/reject", summary="Reject parent link request")
def reject_link_request(
    link_id: str,
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """Student rejects a parent's link request."""
    link = supabase.table("ParentStudentLinks").select("*").eq("id", link_id).eq("student_id", user.user_id).single().execute()
    
    if not link.data:
        raise HTTPException(status_code=404, detail="Link request not found")
    
    if link.data["status"] != "PENDING":
        raise HTTPException(status_code=400, detail=f"Cannot reject link with status: {link.data['status']}")
    
    supabase.table("ParentStudentLinks").update({
        "status": "REJECTED",
        "responded_at": datetime.utcnow().isoformat()
    }).eq("id", link_id).execute()
    
    return {"message": "Link request rejected", "status": "REJECTED"}


@router.delete("/{link_id}", summary="Revoke/remove a link")
def revoke_link(
    link_id: str,
    user: CurrentUser = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """Revoke an existing link. Can be done by either parent or student."""
    link = supabase.table("ParentStudentLinks").select("*").eq("id", link_id).single().execute()
    
    if not link.data:
        raise HTTPException(status_code=404, detail="Link not found")
    
    if link.data["parent_id"] != user.user_id and link.data["student_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="You are not part of this link")
    
    supabase.table("ParentStudentLinks").delete().eq("id", link_id).execute()
    
    return {"message": "Link removed successfully"}


@router.get("/my-parents", summary="Get linked parents (for students)")
def get_linked_parents(
    user: CurrentUser = Depends(get_student_user),
    supabase = Depends(get_supabase_client)
):
    """Get all parents linked to this student."""
    links = supabase.table("ParentStudentLinks").select(
        "id, parent_id, status, responded_at"
    ).eq("student_id", user.user_id).eq("status", "ACCEPTED").execute()
    
    if not links.data:
        return {"parents": [], "message": "No linked parents"}
    
    parents = []
    for link in links.data:
        parent = supabase.table("ParentProfiles").select("full_name, relationship, phone").eq("user_id", link["parent_id"]).single().execute()
        parents.append({
            "link_id": link["id"],
            "parent_id": link["parent_id"],
            "parent_name": parent.data.get("full_name") if parent.data else None,
            "relationship": parent.data.get("relationship") if parent.data else None,
            "linked_at": link.get("responded_at")
        })
    
    return {"parents": parents}
