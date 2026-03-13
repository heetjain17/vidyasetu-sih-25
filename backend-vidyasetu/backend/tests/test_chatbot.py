"""
Tests for the /chatbot/ REST endpoint.
The WebSocket endpoint is excluded (requires live WS client).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_chatbot_rest_greeting():
    """POST /chatbot/ask with a greeting should return 200 with an answer."""
    response = client.post("/chatbot/ask", json={"question": "hello"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data


def test_chatbot_rest_education_query():
    """POST /chatbot/ask with an education query should return 200."""
    response = client.post("/chatbot/ask", json={"question": "What colleges are in Srinagar?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data


def test_chatbot_missing_question():
    """POST /chatbot/ask with no question field should return 422."""
    response = client.post("/chatbot/ask", json={})
    assert response.status_code == 422


def test_chatbot_health():
    """GET /chatbot/health should return provider and qdrant status."""
    response = client.get("/chatbot/health")
    assert response.status_code == 200
    data = response.json()
    # HealthResponse has qdrant and ai_provider fields
    assert "qdrant" in data
    assert "ai_provider" in data
