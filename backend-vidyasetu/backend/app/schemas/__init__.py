"""
Pydantic schemas for all API endpoints.
Organized by domain/feature.
"""

# Re-export all schemas for easy importing
from app.schemas.auth import (
    UserRole,
    RegisterRequest,
    LoginRequest,
    AuthResponse,
)

from app.schemas.profile import (
    StudentProfileUpdate,
    StudentProfileResponse,
    ParentProfileUpdate,
    ParentProfileResponse,
    CollegeProfileUpdate,
    CollegeProfileResponse,
)

from app.schemas.recommendation import (
    ScoresSchema,
    StudentActualSchema,
    StudentPreferencesSchema,
    RecommenderRequest,
    TranslateRequest,
)

from app.schemas.links import (
    ConnectRequest,
    LinkResponse,
    LinkedStudentResponse,
    PendingRequestResponse,
)

from app.schemas.timeline import (
    WhatsAppSyncRequest,
    CalendarSyncRequest,
)

from app.schemas.feedback import FeedbackCreate

from app.schemas.college_admin import (
    ProfileUpdate,
    CollegeUpdate,
    LinkCollegeRequest,
    AddCourseRequest,
    FacilitiesUpdate,
)

from app.schemas.chatbot_futuristic import (
    FuturisticCareerRequest,
    FuturisticCareerItem,
    FuturisticCareerResponse,
)
