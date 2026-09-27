import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "standards_count" in data

def test_metrics_check(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

def test_analyze_endpoint(client):
    response = client.post(
        "/api/v1/analyze",
        data={"text": "Procurement of 500 outdoor LED streetlight luminaires for municipal roads"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    assert data["score_version"] == "applicability_v1"

def test_standards_list(client):
    response = client.get("/api/v1/standards")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
