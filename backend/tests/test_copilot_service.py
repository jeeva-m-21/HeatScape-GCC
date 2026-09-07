"""Unit and API integration tests for HeatScape AI Copilot & Natural Language Query Engine."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.copilot_service import CopilotService

client = TestClient(app)


def test_parse_spatial_filters_temperature_and_canopy():
    """Verify natural language extraction of numeric thermal and canopy thresholds."""
    query = "Find all cells with surface temperature over 42.5 and canopy under 6%"
    filters = CopilotService.parse_spatial_filters(query)

    assert filters["min_surface_temp_c"] == 42.5
    assert filters["max_canopy_fraction"] == 0.06


def test_parse_spatial_filters_neighborhood_and_ward():
    """Verify neighborhood geo-resolution, ward ID matching, and trajectory status."""
    query = "Show all emerging hotspots in T. Nagar"
    filters = CopilotService.parse_spatial_filters(query)

    assert filters["target_neighborhood"] == "T. Nagar"
    assert filters["ward_id"] == "117"
    assert filters["zone"] == "Zone X"
    assert filters["trajectory_state"] == "EMERGING"
    assert "center" in filters
    assert len(filters["center"]) == 2


def test_copilot_grap_policy_advisory():
    """Verify grounded GCC Graded Response Action Plan (GRAP) Stage 2 advisory."""
    resp = CopilotService.answer_query("What are the mandatory work stoppage rules for Orange Alert?")

    assert "Stage 2: Orange Alert" in resp["reply"]
    assert "12:00 PM and 3:00 PM" in resp["reply"]
    assert len(resp["referenced_policies"]) >= 2
    assert any(a["action"] == "NAVIGATE_EOC" for a in resp["suggested_actions"])


def test_copilot_street_canyon_query():
    """Verify microclimate aerodynamic explanations and intervention suggestions."""
    resp = CopilotService.answer_query("Why is Usman Road experiencing severe skimming flow and heat entrapment?")

    assert "Skimming Flow" in resp["reply"]
    assert "Aspect Ratio" in resp["reply"]
    assert "Sky View Factor" in resp["reply"]
    assert len(resp["suggested_actions"]) > 0


def test_copilot_api_endpoints():
    """Verify HTTP endpoints for copilot query and sample prompts."""
    # 1. Query endpoint
    res = client.post(
        "/api/v1/copilot/query",
        json={
            "message": "Show cells with temp > 41 and canopy < 5% in Teynampet",
            "context": {"current_route": "/explorer"},
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert data["spatial_filters"]["min_surface_temp_c"] == 41.0
    assert data["spatial_filters"]["target_neighborhood"] == "Teynampet"
    assert len(data["suggested_actions"]) > 0

    # 2. Sample prompts endpoint
    res_prompts = client.get("/api/v1/copilot/sample-prompts")
    assert res_prompts.status_code == 200
    prompts = res_prompts.json()["sample_prompts"]
    assert len(prompts) >= 4
    assert all("prompt" in p for p in prompts)
