"""College admin Pydantic schemas."""
from pydantic import BaseModel
from typing import Optional


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
