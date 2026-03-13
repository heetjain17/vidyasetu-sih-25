"""
Tests for Pydantic schema validation — no network calls.
Validates that schemas accept, reject, and coerce values correctly.
"""
import pytest
from pydantic import ValidationError
from app.schemas.recommendation import (
    ScoresSchema, StudentActualSchema, StudentPreferencesSchema, RecommenderRequest
)
from app.schemas.timeline import WhatsAppSyncRequest, CalendarSyncRequest
from app.schemas.feedback import FeedbackCreate
from app.schemas.auth import UserRole, RegisterRequest


# ---- RecommenderRequest ----

def test_scores_schema_valid():
    s = ScoresSchema(
        Logical_reasoning=200, Quantitative_reasoning=300,
        Analytical_reasoning=400, Verbal_reasoning=250,
        Spatial_reasoning=150, Creativity=300, Enter=280
    )
    assert s.Logical_reasoning == 200


def test_scores_schema_negative_rejected():
    with pytest.raises(ValidationError):
        ScoresSchema(
            Logical_reasoning=-10, Quantitative_reasoning=300,
            Analytical_reasoning=400, Verbal_reasoning=250,
            Spatial_reasoning=150, Creativity=300, Enter=280
        )


def test_preferences_range_enforced():
    with pytest.raises(ValidationError):
        StudentPreferencesSchema(
            Importance_Locality=6,  # > 5
            Importance_Financial=3,
            Importance_Eligibility=2,
            Importance_Events_hobbies=3,
            Importance_Quality=5
        )


def test_preferences_zero_valid():
    p = StudentPreferencesSchema(
        Importance_Locality=0, Importance_Financial=0,
        Importance_Eligibility=0, Importance_Events_hobbies=0,
        Importance_Quality=0
    )
    assert p.Importance_Locality == 0


# ---- Timeline Schemas ----

def test_whatsapp_sync_valid():
    r = WhatsAppSyncRequest(phone_number="+919876543210", exam_id="jee1", exam_name="JEE Main")
    assert r.phone_number == "+919876543210"


def test_calendar_sync_invalid_email():
    with pytest.raises(ValidationError):
        CalendarSyncRequest(email="not-an-email", exam_id="x", exam_name="X", events=[])


# ---- Feedback Schema ----

def test_feedback_create_valid():
    f = FeedbackCreate(role="STUDENT", recommendations_useful="Yes", recommendations_accurate="Somewhat")
    assert f.suggestions is None


# ---- Auth Schema ----

def test_user_role_enum():
    assert UserRole("STUDENT") == UserRole.STUDENT
    assert UserRole("PARENT") == UserRole.PARENT
    assert UserRole("COLLEGE") == UserRole.COLLEGE


def test_user_role_invalid():
    with pytest.raises(ValueError):
        UserRole("ADMIN")


def test_register_request_valid():
    r = RegisterRequest(email="test@test.com", password="pass1234", role=UserRole.STUDENT)
    assert r.role == UserRole.STUDENT
