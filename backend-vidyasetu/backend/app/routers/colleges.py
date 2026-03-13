# colleges.py - College listing API endpoints
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.db_service import (
    fetch_all_colleges,
    search_colleges,
    fetch_college_by_name,
    fetch_courses_for_college,
    fetch_unique_districts,
)

router = APIRouter(prefix="/colleges")


@router.get("/")
async def list_colleges(
    district: Optional[str] = Query(None, description="Filter by district"),
    location: Optional[str] = Query(None, description="Filter by location (Urban/Rural)"),
    for_girls: Optional[bool] = Query(None, description="Filter for women's colleges"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Items per page"),
):
    """
    List all colleges with optional filters and pagination.
    """
    skip = (page - 1) * limit
    
    colleges, total = fetch_all_colleges(
        district=district,
        location=location,
        for_girls=for_girls,
        skip=skip,
        limit=limit
    )
    
    total_pages = (total + limit - 1) // limit  # ceiling division
    
    return {
        "colleges": colleges,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }


@router.get("/search")
async def search(
    q: str = Query(..., min_length=2, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=50, description="Items per page"),
):
    """
    Search colleges by name with pagination.
    """
    skip = (page - 1) * limit
    colleges, total = search_colleges(q, skip=skip, limit=limit)
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "colleges": colleges,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
    }



@router.get("/districts")
async def get_districts():
    """
    Get all unique districts for filter dropdown.
    """
    districts = fetch_unique_districts()
    
    return {"districts": districts}


@router.get("/{college_name}")
async def get_college_details(college_name: str):
    """
    Get detailed information about a specific college including courses offered.
    """
    college = fetch_college_by_name(college_name)
    
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    
    courses = fetch_courses_for_college(college_name)
    college["courses_offered"] = courses
    college["total_courses"] = len(courses)
    
    return college
