import pytest
import os
import json
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_diagnostics_status_endpoint():
    response = client.get("/api/v1/diagnostics/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "standards_count" in data
    assert data["embedding_model"] == "BAAI/bge-m3"
    assert data["reranker_model"] == "BAAI/bge-reranker-v2-m3"

def test_trace_generation_and_retrieval():
    # Submit analysis request as form data
    res = client.post("/api/v1/analyze", data={"text": "ergonomic executive work chairs with lumbar support and durability requirements"})
    assert res.status_code == 200
    res_data = res.json()
    analysis_id = res_data["analysis_id"]

    # Fetch trace via debug endpoint
    trace_res = client.get(f"/api/v1/analyses/{analysis_id}/trace?debug=true")
    assert trace_res.status_code == 200
    trace_data = trace_res.json()

    # Validate 8 major pipeline stages
    assert trace_data["analysis_id"] == analysis_id
    assert "requirement_extraction" in trace_data
    assert "bm25" in trace_data
    assert "dense" in trace_data
    assert "fusion" in trace_data
    assert "reranker" in trace_data
    assert "applicability" in trace_data
    assert "decision" in trace_data
    assert "timing" in trace_data

    # Validate timing trace
    timing = trace_data["timing"]
    assert timing["total_ms"] > 0

    # Validate decision stage
    decision = trace_data["decision"]
    assert "decision_state" in decision
    assert "primary_suspected_failure_stage" in decision

def test_trace_does_not_change_recommendation_results():
    payload = {"text": "industrial safety helmet with high impact resistance and chin strap"}
    
    # Run 1: Production Mode (DEBUG_RETRIEVAL_TRACE = False)
    settings.DEBUG_RETRIEVAL_TRACE = False
    res1 = client.post("/api/v1/analyze", data=payload).json()

    # Run 2: Debug Mode (DEBUG_RETRIEVAL_TRACE = True)
    settings.DEBUG_RETRIEVAL_TRACE = True
    res2 = client.post("/api/v1/analyze", data=payload).json()

    # Verify recommendations, ranks, and scores are 100% identical
    assert res1["decision_state"] == res2["decision_state"]
    assert res1["is_abstained"] == res2["is_abstained"]
    assert len(res1["recommendations"]) == len(res2["recommendations"])

    for r1, r2 in zip(res1["recommendations"], res2["recommendations"]):
        assert r1["standard_id"] == r2["standard_id"]
        assert r1["rank"] == r2["rank"]
        assert r1["applicability_score"] == r2["applicability_score"]
