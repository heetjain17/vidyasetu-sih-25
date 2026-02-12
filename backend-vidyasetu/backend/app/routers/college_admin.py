# college_admin.py - College Administration API endpoints
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies.auth_dependency import get_college_user, CurrentUser
from app.dependencies.db_dependency import get_supabase_client

router = APIRouter(prefix="/college-admin", tags=["🏫 College Admin"])


# ============================================================
# Pydantic Models
# ============================================================

class ProfileUpdate(BaseModel):
    contact_name: Optional[str] = None
    designation: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class CollegeUpdate(BaseModel):
    website: Optional[str] = None
    location: Optional[str] = None


class LinkCollegeRequest(BaseModel):
    aishe_code: Optional[str] = None
    college_name: Optional[str] = None


class AddCourseRequest(BaseModel):
    course_name: str


# ============================================================
# Profile Endpoints
# ============================================================

@router.get("/profile", summary="Get college profile with linked college data")
def get_profile(
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get the college profile for the current user.
    Returns profile data from CollegeProfiles and linked college data from CollegeList.
    """
    # Fetch CollegeProfiles
    profile_result = supabase.table("CollegeProfiles").select("*").eq("user_id", user.user_id).maybe_single().execute()
    profile = profile_result.data if profile_result else None
    
    if not profile:
        raise HTTPException(status_code=404, detail="College profile not found")
    
    college_name = profile.get("college_name")
    college_data = None
    courses = []
    
    # If linked to a college, fetch the college data
    if college_name:
        college_result = supabase.table("CollegeList").select("*").eq("Name", college_name).maybe_single().execute()
        college_data = college_result.data if college_result else None
        
        # Fetch courses offered
        courses_result = supabase.table("CourseToCollege").select("courses").eq("colleges", college_name).execute()
        if courses_result.data:
            courses = list(set(row["courses"] for row in courses_result.data if row.get("courses")))
            courses.sort()
    
    return {
        "profile": {
            "college_name": profile.get("college_name"),
            "aishe_code": profile.get("aishe_code"),
            "contact_name": profile.get("contact_name"),
            "designation": profile.get("designation"),
            "contact_email": profile.get("contact_email"),
            "contact_phone": profile.get("contact_phone"),
            "is_verified": profile.get("is_verified", False),
            "is_profile_complete": profile.get("is_profile_complete", False),
        },
        "college_data": college_data,
        "courses": courses,
        "is_linked": bool(college_name)
    }


@router.put("/profile", summary="Update college profile contact info")
def update_profile(
    data: ProfileUpdate,
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Update contact information in CollegeProfiles.
    """
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = supabase.table("CollegeProfiles").update(update_data).eq("user_id", user.user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile updated", "updated_fields": list(update_data.keys())}


@router.post("/link-college", summary="Link profile to an existing college")
def link_college(
    data: LinkCollegeRequest,
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Link the college profile to an existing college in CollegeList.
    Can search by AISHE code or college name.
    """
    if not data.aishe_code and not data.college_name:
        raise HTTPException(status_code=400, detail="Provide either aishe_code or college_name")
    
    # Search for college
    if data.aishe_code:
        result = supabase.table("CollegeList").select("Name").eq("Aishe Code", data.aishe_code).maybe_single().execute()
    else:
        result = supabase.table("CollegeList").select("Name").eq("Name", data.college_name).maybe_single().execute()
    
    college = result.data if result else None
    
    if not college:
        raise HTTPException(status_code=404, detail="College not found in database")
    
    college_name = college["Name"]
    
    # Check if college is already linked to another user
    existing = supabase.table("CollegeProfiles").select("user_id").eq("college_name", college_name).maybe_single().execute()
    if existing and existing.data and existing.data["user_id"] != user.user_id:
        raise HTTPException(status_code=400, detail="This college is already linked to another account")
    
    # Update profile with college name
    supabase.table("CollegeProfiles").update({
        "college_name": college_name,
        "aishe_code": data.aishe_code
    }).eq("user_id", user.user_id).execute()
    
    return {"message": "College linked successfully", "college_name": college_name}


# ============================================================
# Course Management Endpoints
# ============================================================

@router.get("/courses", summary="List courses offered by college")
def get_courses(
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get all courses offered by the linked college.
    """
    # Get college name from profile
    profile = supabase.table("CollegeProfiles").select("college_name").eq("user_id", user.user_id).maybe_single().execute()
    
    if not profile or not profile.data or not profile.data.get("college_name"):
        raise HTTPException(status_code=400, detail="No college linked. Please link a college first.")
    
    college_name = profile.data["college_name"]
    
    # Fetch courses
    result = supabase.table("CourseToCollege").select("courses").eq("colleges", college_name).execute()
    
    courses = []
    if result.data:
        courses = list(set(row["courses"] for row in result.data if row.get("courses")))
        courses.sort()
    
    return {
        "courses": courses,
        "total": len(courses),
        "college_name": college_name
    }


@router.post("/courses", summary="Add a course to college")
def add_course(
    data: AddCourseRequest,
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Add a course to the college.
    - Validates course exists in Courses table
    - Creates mapping in CourseToCollege
    """
    # Get college name from profile
    profile = supabase.table("CollegeProfiles").select("college_name").eq("user_id", user.user_id).maybe_single().execute()
    
    if not profile or not profile.data or not profile.data.get("college_name"):
        raise HTTPException(status_code=400, detail="No college linked. Please link a college first.")
    
    college_name = profile.data["college_name"]
    course_name = data.course_name.strip()
    
    # Validate course exists in Courses table
    course_check = supabase.table("Courses").select("Courses").eq("Courses", course_name).maybe_single().execute()
    
    if not course_check or not course_check.data:
        raise HTTPException(status_code=404, detail=f"Course '{course_name}' not found in database. Please add it first.")
    
    # Check if mapping already exists
    existing = supabase.table("CourseToCollege").select("id").eq("colleges", college_name).eq("courses", course_name).maybe_single().execute()
    
    if existing and existing.data:
        raise HTTPException(status_code=400, detail="This course is already offered by your college")
    
    # Create mapping
    supabase.table("CourseToCollege").insert({
        "colleges": college_name,
        "courses": course_name
    }).execute()
    
    return {"message": "Course added successfully", "course": course_name}


@router.delete("/courses/{course_name}", summary="Remove a course from college")
def remove_course(
    course_name: str,
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Remove a course from the college.
    Only removes the mapping, not the course itself.
    """
    # Get college name from profile
    profile = supabase.table("CollegeProfiles").select("college_name").eq("user_id", user.user_id).maybe_single().execute()
    
    if not profile or not profile.data or not profile.data.get("college_name"):
        raise HTTPException(status_code=400, detail="No college linked")
    
    college_name = profile.data["college_name"]
    
    # Delete mapping
    result = supabase.table("CourseToCollege").delete().eq("colleges", college_name).eq("courses", course_name).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Course mapping not found")
    
    return {"message": "Course removed", "course": course_name}


@router.get("/available-courses", summary="List all available courses")
def get_available_courses(
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get all courses from Courses table for dropdown.
    """
    result = supabase.table("Courses").select("Courses").execute()
    
    courses = []
    if result.data:
        courses = [row["Courses"] for row in result.data if row.get("Courses")]
        courses.sort()
    
    return {"courses": courses, "total": len(courses)}


@router.get("/search-colleges", summary="Search colleges by name or AISHE code")
def search_colleges(
    q: str,
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Search for colleges to link. Returns matching colleges.
    """
    # Search by name (partial match)
    result = supabase.table("CollegeList").select("Name, \"Aishe Code\", District").ilike("Name", f"%{q}%").limit(10).execute()
    
    colleges = []
    if result.data:
        for row in result.data:
            colleges.append({
                "name": row.get("Name"),
                "aishe_code": row.get("Aishe Code"),
                "district": row.get("District")
            })
    
    return {"colleges": colleges}


# ============================================================
# Facilities Management Endpoints
# ============================================================

class FacilitiesUpdate(BaseModel):
    has_library: Optional[bool] = None
    has_hostel: Optional[bool] = None
    has_cafeteria: Optional[bool] = None
    has_sports_ground: Optional[bool] = None
    has_gym: Optional[bool] = None
    has_medical_facility: Optional[bool] = None
    has_wifi: Optional[bool] = None
    has_computer_lab: Optional[bool] = None
    has_auditorium: Optional[bool] = None
    has_parking: Optional[bool] = None
    hostel_capacity: Optional[int] = None
    library_books_count: Optional[int] = None
    annual_fees_general: Optional[float] = None
    annual_fees_ews: Optional[float] = None
    hostel_fees: Optional[float] = None
    scholarship_available: Optional[bool] = None
    scholarship_amount: Optional[float] = None


@router.get("/facilities", summary="Get college facilities")
def get_facilities(
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get facilities for the linked college.
    """
    # Get college name from profile
    profile = supabase.table("CollegeProfiles").select("college_name").eq("user_id", user.user_id).maybe_single().execute()
    
    if not profile or not profile.data or not profile.data.get("college_name"):
        raise HTTPException(status_code=400, detail="No college linked. Please link a college first.")
    
    college_name = profile.data["college_name"]
    
    # Fetch facilities
    result = supabase.table("CollegeFacilities").select("*").eq("college_name", college_name).maybe_single().execute()
    
    if result and result.data:
        return {"facilities": result.data, "college_name": college_name}
    
    # Return empty defaults if no facilities record exists
    return {
        "facilities": {
            "has_library": False,
            "has_hostel": False,
            "has_cafeteria": False,
            "has_sports_ground": False,
            "has_gym": False,
            "has_medical_facility": False,
            "has_wifi": False,
            "has_computer_lab": False,
            "has_auditorium": False,
            "has_parking": False,
            "hostel_capacity": None,
            "library_books_count": None,
            "annual_fees_general": None,
            "annual_fees_ews": None,
            "hostel_fees": None,
            "scholarship_available": False,
            "scholarship_amount": None
        },
        "college_name": college_name,
        "is_new": True
    }


@router.put("/facilities", summary="Update college facilities")
def update_facilities(
    data: FacilitiesUpdate,
    user: CurrentUser = Depends(get_college_user),
    supabase = Depends(get_supabase_client)
):
    """
    Update facilities for the linked college.
    Creates a new record if none exists.
    """
    # Get college name from profile
    profile = supabase.table("CollegeProfiles").select("college_name").eq("user_id", user.user_id).maybe_single().execute()
    
    if not profile or not profile.data or not profile.data.get("college_name"):
        raise HTTPException(status_code=400, detail="No college linked. Please link a college first.")
    
    college_name = profile.data["college_name"]
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # Check if record exists
    existing = supabase.table("CollegeFacilities").select("id").eq("college_name", college_name).maybe_single().execute()
    
    if existing and existing.data:
        # Update existing
        supabase.table("CollegeFacilities").update(update_data).eq("college_name", college_name).execute()
    else:
        # Create new
        update_data["college_name"] = college_name
        supabase.table("CollegeFacilities").insert(update_data).execute()
    
    return {"message": "Facilities updated", "updated_fields": list(update_data.keys())}

