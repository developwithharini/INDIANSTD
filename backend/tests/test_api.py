import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.fallback.rule_fallback import rule_based_extract
from app.services.regulatory.rules_engine import evaluate_regulatory_status

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]

def test_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "active_procurements_count" in data

def test_list_standards():
    response = client.get("/api/v1/standards")
    assert response.status_code == 200
    stds = response.json()
    assert isinstance(stds, list)
    assert len(stds) > 0

def test_rule_based_extraction():
    text = "Procurement of 500 units Outdoor LED Street Lighting Luminaires IP66 per IS 10322"
    req = rule_based_extract(text, "en")
    assert "LED" in req.product or "Lighting" in req.category
    assert req.category == "Street Lighting"

def test_procurement_analysis_flow():
    payload = {
        "title": "Municipal Street Lighting Test",
        "requirement_text": "We require 500 outdoor LED street lights for city roads with IP66 protection and 10kV surge protection. Standard IS 10322:1985 mentioned.",
        "language": "en"
    }
    response = client.post("/api/v1/procurements/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "request_id" in data
    assert len(data["recommendations"]) > 0
    assert data["readiness"]["overall_score"] > 0
    # Verify tender auditor flagged outdated reference
    finding_titles = [f["title"] for f in data["findings"]]
    assert any("Outdated Standard Reference" in t for t in finding_titles)

def test_graph_data():
    response = client.get("/api/v1/procurements/req_test/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
