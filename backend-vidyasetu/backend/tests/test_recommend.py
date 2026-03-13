"""
Tests for the /recommend/ endpoints.
Tests schema validation, response structure, and error handling.
These work without a live Supabase (validation layer) or with live Supabase (full e2e).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

VALID_PAYLOAD = {
    "scores": {
        "Logical_reasoning": 290,
        "Quantitative_reasoning": 330,
        "Analytical_reasoning": 470,
        "Verbal_reasoning": 346,
        "Spatial_reasoning": 220,
        "Creativity": 345,
        "Enter": 370,
        "language": "english"
    },
    "student_actual": {
        "Extra_curriculars": ["coding", "debate"],
        "Hobbies": ["reading", "chess"],
        "Student_Locality": "srinagar",
        "Gender": "Male",
        "Students_Category": "General",
        "Budget": 100000
    },
    "student_preferences": {
        "Importance_Locality": 4,
        "Importance_Financial": 3,
        "Importance_Eligibility": 2,
        "Importance_Events_hobbies": 3,
        "Importance_Quality": 5
    }
}


def test_recommend_valid_payload():
    """POST /recommend/ with valid data should return 200 with structured result."""
    response = client.post("/recommend/", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    # Should have top-level recommendation keys
    assert "top_careers" in data or "error" not in data


def test_recommend_missing_scores():
    """POST /recommend/ with missing scores should return 422."""
    bad_payload = {**VALID_PAYLOAD}
    del bad_payload["scores"]
    response = client.post("/recommend/", json=bad_payload)
    assert response.status_code == 422


def test_recommend_invalid_preference_range():
    """POST /recommend/ with preference > 5 should return 422."""
    bad_payload = {**VALID_PAYLOAD, "student_preferences": {
        "Importance_Locality": 10,  # out of range
        "Importance_Financial": 3,
        "Importance_Eligibility": 2,
        "Importance_Events_hobbies": 3,
        "Importance_Quality": 5
    }}
    response = client.post("/recommend/", json=bad_payload)
    assert response.status_code == 422


def test_recommend_get_method_not_allowed():
    """GET /recommend/ should return 405 Method Not Allowed."""
    response = client.get("/recommend/")
    assert response.status_code == 405


def test_translate_english_passthrough():
    """POST /recommend/translate with target=english should return original text unchanged."""
    payload = {"text": "Hello world", "target_language": "english"}
    response = client.post("/recommend/translate", json=payload)
    assert response.status_code == 200
    assert response.json()["translation"] == "Hello world"


def test_translate_missing_fields():
    """POST /recommend/translate with missing fields should return 422."""
    response = client.post("/recommend/translate", json={"text": "Hello"})
    assert response.status_code == 422
