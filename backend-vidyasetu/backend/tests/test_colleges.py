"""
Tests for the /colleges/ endpoints.
All endpoints are public — no auth required.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_colleges_default():
    """GET /colleges/ should return paginated college list."""
    response = client.get("/colleges/")
    assert response.status_code == 200
    data = response.json()
    assert "colleges" in data
    assert "total" in data
    assert "page" in data
    assert "total_pages" in data


def test_list_colleges_pagination():
    """GET /colleges/?page=1&limit=5 should return at most 5 results."""
    response = client.get("/colleges/?page=1&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["colleges"]) <= 5
    assert data["page"] == 1
    assert data["limit"] == 5


def test_list_colleges_filter_district():
    """GET /colleges/?district=srinagar should filter by district."""
    response = client.get("/colleges/?district=srinagar")
    assert response.status_code == 200
    data = response.json()
    assert "colleges" in data


def test_search_colleges():
    """GET /colleges/search?q=gc should return matching colleges."""
    response = client.get("/colleges/search?q=gc")
    assert response.status_code == 200
    data = response.json()
    assert "colleges" in data


def test_search_colleges_too_short():
    """GET /colleges/search?q=a (less than 2 chars) should return 422."""
    response = client.get("/colleges/search?q=a")
    assert response.status_code == 422


def test_get_districts():
    """GET /colleges/districts should return list of districts."""
    response = client.get("/colleges/districts")
    assert response.status_code == 200
    data = response.json()
    assert "districts" in data
    assert isinstance(data["districts"], list)


def test_college_not_found():
    """GET /colleges/nonexistent-college-xyz should return 404."""
    response = client.get("/colleges/nonexistent-college-xyz-99999")
    assert response.status_code == 404
