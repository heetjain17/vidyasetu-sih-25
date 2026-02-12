import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    # Replace with valid test credentials for Supabase test project
    test_email = "testuser@example.com"
    test_password = "testpassword123"

    # Register user (should handle already registered case gracefully)
    response = client.post("/auth/register", json={"email": test_email, "password": test_password})
    assert response.status_code in (200, 400)  # 400 if already registered

    # Login user
    response = client.post("/auth/login", json={"email": test_email, "password": test_password})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
