from fastapi import APIRouter, HTTPException, Depends
from app.dependencies.db_dependency import get_supabase_client
from typing import List

router = APIRouter()

def get_table_data(table: str, supabase):
    try:
        result = supabase.table(table).select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/careers")
def read_careers(supabase=Depends(get_supabase_client)):
    return get_table_data("RIASEC", supabase)

@router.get("/college-list")
def read_college_list(supabase=Depends(get_supabase_client)):
    return get_table_data("CollegeList", supabase)

@router.get("/courses")
def read_courses(supabase=Depends(get_supabase_client)):
    return get_table_data("Courses", supabase)

@router.get("/course-college")
def read_course_college(supabase=Depends(get_supabase_client)):
    return get_table_data("CourseToCollege", supabase)

@router.get("/roadmap")
def read_roadmap(supabase=Depends(get_supabase_client)):
    return get_table_data("RoadmapTemplates", supabase)

@router.get("/college-facilities")
def read_college_facilities(supabase=Depends(get_supabase_client)):
    return get_table_data("CollegeFacilities", supabase)