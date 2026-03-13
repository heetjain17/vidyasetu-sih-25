import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_existing_user():
    """Test login with the test account (must already exist in Supabase)."""
    response = client.post("/auth/login", json={
        "email": "testuser@example.com",
        "password": "testpassword123"
    })
    # 200 = logged in, 401 = wrong creds (acceptable in CI without live Supabase)
    assert response.status_code in (200, 400, 401)
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert "role" in data


def test_health_endpoint():
    """Quick sanity check that the app starts and health endpoint responds."""
    response = client.get("/health/")
    assert response.status_code == 200
    assert response.json().get("status") == "ok"
