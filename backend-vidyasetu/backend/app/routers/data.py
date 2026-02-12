from fastapi import APIRouter, HTTPException, Depends
from app.dependencies.db_dependency import get_supabase_client
from typing import List

router = APIRouter()

def get_table_data(table: str, supabase):
    result = supabase.table(table).select("*").execute()
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"]["message"])
    return result["data"]

@router.get("/careers")
def read_careers(supabase=Depends(get_supabase_client)):
    return get_table_data("careers", supabase)

@router.get("/college-list")
def read_college_list(supabase=Depends(get_supabase_client)):
    return get_table_data("college_list", supabase)

@router.get("/courses")
def read_courses(supabase=Depends(get_supabase_client)):
    return get_table_data("courses", supabase)

@router.get("/course-college")
def read_course_college(supabase=Depends(get_supabase_client)):
    return get_table_data("course_college", supabase)

@router.get("/roadmap")
def read_roadmap(supabase=Depends(get_supabase_client)):
    return get_table_data("roadmap", supabase)

@router.get("/college-facilities")
def read_college_facilities(supabase=Depends(get_supabase_client)):
    return get_table_data("college_facilities", supabase)