  # db_service.py - Database service layer for recommendations
# Fetches all data from Supabase

from app.dependencies.db_dependency import get_supabase_client
from typing import Optional


def get_supabase():
    """Get Supabase client instance"""
    return get_supabase_client()


def fetch_riasec_careers() -> list:
    """
    Fetch all careers with RIASEC scores from the database.
    Returns a list of dicts with career data.
    """
    supabase = get_supabase()
    
    result = supabase.table("RIASEC").select("*").execute()
    
    if not result.data:
        return []
    
    # Map to expected format
    careers = []
    for row in result.data:
        career = {
            "Title": row.get("Title", ""),
            "Realistic": float(row.get("Realistic", 0) or 0),
            "Investigative": float(row.get("Investigative", 0) or 0),
            "Artistic": float(row.get("Artistic", 0) or 0),
            "Social": float(row.get("Social", 0) or 0),
            "Enterprising": float(row.get("Enterprising", 0) or 0),
            "Conventional": float(row.get("Conventional", 0) or 0),
            "Description": row.get("desc", ""),
        }
        careers.append(career)
    
    return careers


def fetch_career_to_course_mapping() -> dict:
    """
    Fetch career to course mappings from database.
    Returns a dict like: {"Career Name": ["Course1", "Course2", ...], ...}
    """
    supabase = get_supabase()
    
    result = supabase.table("CareerToCourse").select("careers, courses").execute()
    
    if not result.data:
        return {}
    
    # Build the mapping dictionary
    career_course_dict = {}
    for row in result.data:
        career = row.get("careers") 
        course = row.get("courses")
        
        if not career or not course:
            continue
            
        if career not in career_course_dict:
            career_course_dict[career] = []
        
        if course not in career_course_dict[career]:
            career_course_dict[career].append(course)
    
    return career_course_dict


def fetch_course_to_college_mapping() -> dict:
    """
    Fetch course to college mappings from database.
    Returns a dict like: {"Course Name": ["College1", "College2", ...], ...}
    """
    supabase = get_supabase()
    
    result = supabase.table("CourseToCollege").select("courses, colleges").execute()
    
    if not result.data:
        return {}
    
    # Build the mapping dictionary
    course_college_dict = {}
    for row in result.data:
        course = row.get("courses")
        college = row.get("colleges")
        
        if not course or not college:
            continue
            
        if course not in course_college_dict:
            course_college_dict[course] = []
        
        if college not in course_college_dict[course]:
            course_college_dict[course].append(college)
    
    return course_college_dict


def fetch_college_data(college_names: Optional[list] = None) -> list:
    """
    Fetch college details from CollegeList table.
    """
    supabase = get_supabase()
    
    query = supabase.table("CollegeList").select("*")
    
    if college_names:
        query = query.in_("Name", college_names)
    
    result = query.execute()
    
    if not result.data:
        return []
    
    # Map database fields to expected field names
    colleges = []
    for row in result.data:
        for_girls_val = row.get("For_girls", False)
        if isinstance(for_girls_val, str):
            for_girls = for_girls_val.lower() == "true"
        else:
            for_girls = bool(for_girls_val) if for_girls_val is not None else False
        
        college = {
            "Name": row.get("Name", ""),
            "District": row.get("District", ""),
            "State": row.get("State", ""),
            "Website": row.get("Website", ""),
            "Year Of Establishment": row.get("Year Of Establishment"),
            "Location": row.get("Location", ""),
            "College Type": row.get("College Type", ""),
            "Management": row.get("Manegement", ""),  # Note: typo in DB column
            "University Name": row.get("University Name", ""),
            "For_girls": for_girls,
            "Aishe Code": row.get("Aishe Code", ""),
        }
        colleges.append(college)
    
    return colleges


def fetch_all_college_names() -> list:
    """Fetch all college names from the database"""
    supabase = get_supabase()
    
    result = supabase.table("CollegeList").select("Name").execute()
    
    if not result.data:
        return []
    
    return [row["Name"] for row in result.data if row.get("Name")]


# ============================================================
# College Explorer Functions
# ============================================================

def fetch_all_colleges(
    district: str = None,
    location: str = None,
    for_girls: bool = None,
    skip: int = 0,
    limit: int = 20
) -> tuple[list, int]:
    """
    Fetch all colleges with optional filters and pagination.
    Returns (colleges, total_count).
    """
    supabase = get_supabase()
    
    # First get total count
    count_query = supabase.table("CollegeList").select("*", count="exact")
    if district:
        count_query = count_query.eq("District", district)
    if location:
        count_query = count_query.eq("Location", location)
    if for_girls is not None:
        count_query = count_query.eq("For_girls", for_girls)
    
    count_result = count_query.execute()
    total = count_result.count or 0
    
    # Then get paginated data
    query = supabase.table("CollegeList").select("*")
    
    if district:
        query = query.eq("District", district)
    if location:
        query = query.eq("Location", location)
    if for_girls is not None:
        query = query.eq("For_girls", for_girls)
    
    result = query.order("Name").range(skip, skip + limit - 1).execute()
    
    if not result.data:
        return [], total
    
    colleges = []
    for row in result.data:
        for_girls_val = row.get("For_girls", False)
        if isinstance(for_girls_val, str):
            for_girls_bool = for_girls_val.lower() == "true"
        else:
            for_girls_bool = bool(for_girls_val) if for_girls_val is not None else False
        
        colleges.append({
            "name": row.get("Name", ""),
            "district": row.get("District", ""),
            "state": row.get("State", ""),
            "location": row.get("Location", ""),
            "year_of_establishment": row.get("Year Of Establishment"),
            "college_type": row.get("College Type", ""),
            "for_girls": for_girls_bool,
            "website": row.get("Website", ""),
        })
    
    return colleges, total


def search_colleges(query: str, skip: int = 0, limit: int = 20) -> tuple[list, int]:
    """Search colleges by name with pagination. Returns (colleges, total_count)."""
    supabase = get_supabase()
    
    # Get total count
    count_result = supabase.table("CollegeList").select("*", count="exact").ilike("Name", f"%{query}%").execute()
    total = count_result.count or 0
    
    # Get paginated results
    result = supabase.table("CollegeList").select("*").ilike("Name", f"%{query}%").range(skip, skip + limit - 1).execute()
    
    if not result.data:
        return [], total
    
    colleges = []
    for row in result.data:
        for_girls_val = row.get("For_girls", False)
        if isinstance(for_girls_val, str):
            for_girls_bool = for_girls_val.lower() == "true"
        else:
            for_girls_bool = bool(for_girls_val) if for_girls_val is not None else False
        
        colleges.append({
            "name": row.get("Name", ""),
            "district": row.get("District", ""),
            "state": row.get("State", ""),
            "location": row.get("Location", ""),
            "year_of_establishment": row.get("Year Of Establishment"),
            "college_type": row.get("College Type", ""),
            "for_girls": for_girls_bool,
            "website": row.get("Website", ""),
        })
    
    return colleges, total


def fetch_college_by_name(name: str) -> dict:
    """Fetch a single college by exact name with full details."""
    supabase = get_supabase()
    
    result = supabase.table("CollegeList").select("*").eq("Name", name).execute()
    
    if not result.data:
        return None
    
    row = result.data[0]
    for_girls_val = row.get("For_girls", False)
    if isinstance(for_girls_val, str):
        for_girls_bool = for_girls_val.lower() == "true"
    else:
        for_girls_bool = bool(for_girls_val) if for_girls_val is not None else False
    
    return {
        "name": row.get("Name", ""),
        "aishe_code": row.get("Aishe Code", ""),
        "district": row.get("District", ""),
        "state": row.get("State", ""),
        "website": row.get("Website", ""),
        "year_of_establishment": row.get("Year Of Establishment"),
        "location": row.get("Location", ""),
        "college_type": row.get("College Type", ""),
        "management": row.get("Manegement", ""),  # typo in DB
        "university_name": row.get("University Name", ""),
        "for_girls": for_girls_bool,
    }


def fetch_courses_for_college(college_name: str) -> list:
    """Fetch all courses offered by a college."""
    supabase = get_supabase()
    
    result = supabase.table("CourseToCollege").select("courses").eq("colleges", college_name).execute()
    
    if not result.data:
        return []
    
    # Get unique courses
    courses = list(set(row["courses"] for row in result.data if row.get("courses")))
    courses.sort()
    
    return courses


def fetch_unique_districts() -> list:
    """Fetch all unique districts for filter dropdown."""
    supabase = get_supabase()
    
    result = supabase.table("CollegeList").select("District").execute()
    
    if not result.data:
        return []
    
    districts = list(set(row["District"] for row in result.data if row.get("District")))
    districts.sort()
    
    return districts


# ============================================================
# Roadmap Template Functions
# ============================================================

def fetch_all_roadmap_templates() -> list:
    """
    Fetch all roadmap templates from the database.
    Returns a list of roadmap template dicts.
    """
    supabase = get_supabase()
    
    result = supabase.table("RoadmapTemplates").select("*").execute()
    
    if not result.data:
        return []
    
    return result.data


def fetch_roadmap_by_id(roadmap_id: int) -> dict:
    """
    Fetch a single roadmap template by ID.
    Returns the roadmap dict or None if not found.
    """
    supabase = get_supabase()
    
    result = supabase.table("RoadmapTemplates").select("*").eq("id", roadmap_id).execute()
    
    if not result.data:
        return None
    

# ============================================================
# Timeline Functions
# ============================================================

def fetch_timeline_events() -> list:
    """
    Fetch all exams with their timeline events.
    Returns nested structure from JSON file (temporary override).
    """
    import json
    import os
    
    # Path to the JSON file
    json_path = os.path.join(os.path.dirname(__file__), "../../data/timeline_structure.json")
    
    try:
        with open(json_path, 'r') as f:
            timeline_data = json.load(f)
        return timeline_data
    except Exception as e:
        return []


# ============================================================
# Study Materials Functions
# ============================================================

def fetch_study_materials(
    search: str = None,
    skip: int = 0,
    limit: int = 20
) -> tuple[list, int]:
    """
    Fetch study materials (courses) with optional search and pagination.
    Returns (materials, total_count).
    """
    supabase = get_supabase()
    
    # Get total count
    count_query = supabase.table("StudyMaterials").select("*", count="exact")
    if search:
        count_query = count_query.ilike("courses", f"%{search}%")
    count_result = count_query.execute()
    total = count_result.count or 0
    
    # Get paginated data
    query = supabase.table("StudyMaterials").select("*")
    if search:
        query = query.ilike("courses", f"%{search}%")
    
    result = query.order("courses").range(skip, skip + limit - 1).execute()
    
    if not result.data:
        return [], total
    
    materials = []
    for row in result.data:
        materials.append({
            "courses": row.get("courses", ""),
            "link": row.get("link", ""),
            "duration": row.get("duration", ""),
            "materials": row.get("materials", ""),
        })
    
    return materials, total


def fetch_all_study_materials() -> list:
    """Fetch all study materials without pagination."""
    supabase = get_supabase()
    
    result = supabase.table("StudyMaterials").select("*").order("courses").execute()
    
    if not result.data:
        return []
    
    return [
        {
            "courses": row.get("courses", ""),
            "link": row.get("link", ""),
            "duration": row.get("duration", ""),
            "materials": row.get("materials", ""),
        }
        for row in result.data
    ]


# ============================================================
# Career Roadmaps Functions
# ============================================================

def fetch_career_roadmaps(
    search: str = None,
    skip: int = 0,
    limit: int = 20
) -> tuple[list, int]:
    """
    Fetch career roadmaps with optional search and pagination.
    Returns (roadmaps, total_count).
    """
    supabase = get_supabase()
    
    # Get total count
    count_query = supabase.table("career_roadmaps_new").select("*", count="exact")
    if search:
        count_query = count_query.ilike("Courses", f"%{search}%")
    count_result = count_query.execute()
    total = count_result.count or 0
    
    # Get paginated data
    query = supabase.table("career_roadmaps_new").select("*")
    if search:
        query = query.ilike("Courses", f"%{search}%")
    
    result = query.order("id").range(skip, skip + limit - 1).execute()
    
    if not result.data:
        return [], total
    
    roadmaps = []
    for row in result.data:
        roadmaps.append({
            "id": row.get("id"),
            "courses": row.get("Courses", ""),
            "industry": row.get("Industry", ""),
            "government_exams": row.get("Government Exams", ""),
            "company_names": row.get("Company names", ""),
            "higher_education": row.get("Higher Education", ""),
        })
    
    return roadmaps, total


def fetch_all_career_roadmaps() -> list:
    """Fetch all career roadmaps without pagination."""
    supabase = get_supabase()
    
    result = supabase.table("career_roadmaps_new").select("*").order("id").execute()
    
    if not result.data:
        return []
    
    return [
        {
            "id": row.get("id"),
            "courses": row.get("Courses", ""),
            "industry": row.get("Industry", ""),
            "government_exams": row.get("Government Exams", ""),
            "company_names": row.get("Company names", ""),
            "higher_education": row.get("Higher Education", ""),
        }
        for row in result.data
    ]


def fetch_career_roadmap_by_id(roadmap_id: int) -> dict:
    """Fetch a single career roadmap by ID."""
    supabase = get_supabase()
    
    result = supabase.table("career_roadmaps_new").select("*").eq("id", roadmap_id).execute()
    
    if not result.data:
        return None
    
    row = result.data[0]
    return {
        "id": row.get("id"),
        "courses": row.get("Courses", ""),
        "industry": row.get("Industry", ""),
        "government_exams": row.get("Government Exams", ""),
        "company_names": row.get("Company names", ""),
        "higher_education": row.get("Higher Education", ""),
    }
