"""
Tests for public data endpoints: /data/ and /roadmaps/.
No auth required.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ---- /data/ endpoints ----

def test_data_careers():
    response = client.get("/data/careers")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_data_college_list():
    response = client.get("/data/college-list")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_data_courses():
    response = client.get("/data/courses")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_data_course_college():
    response = client.get("/data/course-college")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_data_roadmap():
    response = client.get("/data/roadmap")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ---- /roadmaps/ endpoints ----

def test_roadmaps_list():
    response = client.get("/roadmaps/")
    assert response.status_code == 200
    data = response.json()
    assert "roadmaps" in data
    assert isinstance(data["roadmaps"], list)


def test_roadmap_not_found():
    response = client.get("/roadmaps/999999")
    assert response.status_code == 404
