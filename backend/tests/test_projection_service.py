"""Unit and API integration tests for CMIP6 Climate Projections & Council Resolution Dossiers."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.projection_service import ProjectionService

client = TestClient(app)


def test_cmip6_projections_ssp245_vs_ssp585():
    """Verify CMIP6 decadal warming rates and monthly time series structure."""
    proj_ssp245 = ProjectionService.get_projections(pathway="SSP2_45", start_year=2020, end_year=2030)
    proj_ssp585 = ProjectionService.get_projections(pathway="SSP5_85", start_year=2020, end_year=2030)

    # 11 years * 12 months = 132 points
    assert len(proj_ssp585["monthly_time_series"]) == 132
    assert len(proj_ssp585["annual_summaries"]) == 11
    assert len(proj_ssp585["ward_forecasts"]) >= 3

    # Verification of SSP5-8.5 having higher projected 2030 peak than SSP2-4.5
    ssp585_2030 = [p for p in proj_ssp585["annual_summaries"] if p["year"] == 2030][0]
    ssp245_2030 = [p for p in proj_ssp245["annual_summaries"] if p["year"] == 2030][0]
    assert ssp585_2030["annual_mean_temp_c"] > ssp245_2030["annual_mean_temp_c"]
    assert ssp585_2030["extreme_heat_days"] >= ssp245_2030["extreme_heat_days"]


def test_council_resolution_structure():
    """Verify legislative resolution formatting, budget allocation, and digital signature."""
    res = ProjectionService.generate_council_resolution(budget_inr=500000000.0)

    assert res["resolution_id"].startswith("GCC-RES-")
    assert "Commissioner" in res["issuing_authority"]
    assert "Ripon Building" in res["municipal_seat"]
    assert len(res["approved_interventions"]) >= 3
    assert res["total_budget_inr"] == 500000000.0
    assert res["digital_signature_stamp"]["verified"] is True


def test_scenarios_api_endpoints():
    """Verify HTTP REST endpoints for projections and council brief generation."""
    # 1. Projections
    res = client.get("/api/v1/scenarios/climate-projections?pathway=SSP5_85")
    assert res.status_code == 200
    data = res.json()
    assert "monthly_time_series" in data
    assert "annual_summaries" in data

    # 2. Council resolution GET
    res_get = client.get("/api/v1/scenarios/council-resolution?budget_inr=600000000")
    assert res_get.status_code == 200
    assert res_get.json()["total_budget_inr"] == 600000000.0

    # 3. Council resolution POST
    res_post = client.post(
        "/api/v1/scenarios/council-resolution/generate",
        json={"budget_inr": 450000000.0, "selected_strategy": "BALANCED"},
    )
    assert res_post.status_code == 200
    assert res_post.json()["total_budget_inr"] == 450000000.0
