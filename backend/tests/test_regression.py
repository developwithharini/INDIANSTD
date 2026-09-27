import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_exact_is_number_override():
    response = client.post("/api/v1/analyze", data={"text": "Requirement for IS 9748 fasteners"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0
    top_rec = data["recommendations"][0]
    assert "9748" in top_rec["standard_number"]
    assert top_rec["applicability_score"] == 100.0

def test_gymnastic_landing_mat_abstention():
    response = client.post("/api/v1/analyze", data={"text": "gymnastic landing mat"})
    assert response.status_code == 200
    data = response.json()
    # Should abstain: recommendations list is empty because score < 45.0 threshold
    assert len(data["recommendations"]) == 0
    # Why Not contains closest candidates for review
    assert len(data["why_not"]) > 0

def test_valid_product_match():
    response = client.post("/api/v1/analyze", data={"text": "Metallic slide fasteners for aviation purpose"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) > 0
    top_rec = data["recommendations"][0]
    assert top_rec["applicability_score"] >= 50.0
