"""
Career Hub API endpoints.
Provides access to study materials and career roadmaps.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.db_service import (
    fetch_study_materials,
    fetch_all_study_materials,
    fetch_career_roadmaps,
    fetch_all_career_roadmaps,
    fetch_career_roadmap_by_id,
)

router = APIRouter(prefix="/career-hub", tags=["career-hub"])


# ============================================================
# Study Materials (Courses) Endpoints
# ============================================================

@router.get("/courses", summary="Get study materials with pagination")
def get_courses(
    search: Optional[str] = Query(None, description="Search courses by name"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    Get paginated list of study materials (courses).
    Supports search by course name.
    """
    skip = (page - 1) * limit
    materials, total = fetch_study_materials(search=search, skip=skip, limit=limit)
    
    return {
        "data": materials,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0,
    }


@router.get("/courses/all", summary="Get all study materials")
def get_all_courses():
    """Get all study materials without pagination."""
    materials = fetch_all_study_materials()
    return {"data": materials, "total": len(materials)}


# ============================================================
# Career Roadmaps Endpoints
# ============================================================

@router.get("/roadmaps", summary="Get career roadmaps with pagination")
def get_roadmaps(
    search: Optional[str] = Query(None, description="Search by course name"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    Get paginated list of career roadmaps.
    Each roadmap shows: Courses, Industry, Government Exams, Company names, Higher Education.
    """
    skip = (page - 1) * limit
    roadmaps, total = fetch_career_roadmaps(search=search, skip=skip, limit=limit)
    
    return {
        "data": roadmaps,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total > 0 else 0,
    }


@router.get("/roadmaps/all", summary="Get all career roadmaps")
def get_all_roadmaps():
    """Get all career roadmaps without pagination."""
    roadmaps = fetch_all_career_roadmaps()
    return {"data": roadmaps, "total": len(roadmaps)}


@router.get("/roadmaps/{roadmap_id}", summary="Get single career roadmap")
def get_roadmap(roadmap_id: int):
    """Get a single career roadmap by ID."""
    roadmap = fetch_career_roadmap_by_id(roadmap_id)
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    return roadmap


# ============================================================
# Scholarships Endpoints
# ============================================================

@router.get("/scholarships", summary="Get scholarships")
def get_scholarships():
    """
    Get all scholarships from the database.
    """
    from app.dependencies.db_dependency import get_supabase_client
    
    supabase = get_supabase_client()
    result = supabase.table("Scholarship").select("*").order("id").execute()
    
    if not result.data:
        return {"data": [], "total": 0}
    
    scholarships = []
    for row in result.data:
        scholarships.append({
            "id": row.get("id"),
            "scheme": row.get("Scheme", ""),
            "eligibility": row.get("Eligibility", ""),
            "benefit": row.get("Benefit", ""),
            "link": row.get("Link", ""),
        })
    
    return {"data": scholarships, "total": len(scholarships)}
