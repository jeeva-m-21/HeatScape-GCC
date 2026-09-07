"""
Unit and integration tests for Compound Multi-Hazard Risk & Sponge Infrastructure Service.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.hazard_service import hazard_service

client = TestClient(app)


def test_compute_compound_risk_bounds_and_ranking():
    """Verify that CCRI values stay strictly within [0.0, 1.0] and are sorted descending."""
    results = hazard_service.compute_compound_risk(weight_heat=0.6, weight_flood=0.4, sponge_mitigation_factor=0.2)
    assert len(results) >= 10
    
    # Check bounds and descending order
    for i in range(len(results) - 1):
        r1 = results[i]["compound_risk_index"]
        r2 = results[i + 1]["compound_risk_index"]
        assert 0.0 <= r1 <= 1.0
        assert r1 >= r2, f"Index {i} ({r1}) is less than index {i+1} ({r2})"

    # High-density coastal zones (e.g. Royapuram / Tondiarpet) should have high risk
    royapuram = next((z for z in results if "Royapuram" in z["zone_name"]), None)
    assert royapuram is not None
    assert royapuram["compound_risk_index"] > 0.70
    assert royapuram["risk_tier"] == "CRITICAL_COMPOUND_HOTSPOT"


def test_compute_compound_risk_sponge_discount():
    """Verify that increasing sponge mitigation factor decreases net compound risk."""
    risk_low_sponge = hazard_service.compute_compound_risk(sponge_mitigation_factor=0.0)
    risk_high_sponge = hazard_service.compute_compound_risk(sponge_mitigation_factor=0.4)

    # Compare mean risk
    mean_low = sum(z["compound_risk_index"] for z in risk_low_sponge) / len(risk_low_sponge)
    mean_high = sum(z["compound_risk_index"] for z in risk_high_sponge) / len(risk_high_sponge)
    assert mean_high < mean_low


def test_calculate_sponge_co_benefits_math():
    """Verify physical and monetary calculations for sponge capital deployment."""
    res = hazard_service.calculate_sponge_co_benefits(
        budget_crores=50.0,
        miyawaki_fraction=0.40,
        bioswale_fraction=0.35,
        cool_roof_fraction=0.25,
    )
    assert res["budget_allocated_crores"] == 50.0
    impacts = res["physical_impacts"]
    assert impacts["net_heat_mitigation_celsius"] > 0.5
    assert impacts["stormwater_retention_capacity_m3"] > 500000

    econ = res["economic_co_benefits"]
    assert econ["benefit_cost_ratio"] > 1.2
    assert econ["total_monetary_resilience_benefit_crores"] > res["budget_allocated_crores"]
    assert "policy_brief" in res


def test_hazard_api_endpoints():
    """Verify HTTP API endpoints for compound hazard risk and sponge co-benefits."""
    # 1. GET /api/v1/hazard/zones
    r_zones = client.get("/api/v1/hazard/zones?weight_heat=0.5&weight_flood=0.5")
    assert r_zones.status_code == 200
    data_zones = r_zones.json()
    assert "zones" in data_zones
    assert data_zones["total_zones"] >= 10
    assert data_zones["weight_heat"] == 0.5

    # 2. POST /api/v1/hazard/sponge-co-benefits
    payload = {
        "budget_crores": 30.0,
        "miyawaki_fraction": 0.5,
        "bioswale_fraction": 0.3,
        "cool_roof_fraction": 0.2,
    }
    r_bcr = client.post("/api/v1/hazard/sponge-co-benefits", json=payload)
    assert r_bcr.status_code == 200
    res_bcr = r_bcr.json()
    assert res_bcr["budget_allocated_crores"] == 30.0
    assert "benefit_cost_ratio" in res_bcr["economic_co_benefits"]

    # 3. GET /api/v1/hazard/zone/5 (Royapuram)
    r_single = client.get("/api/v1/hazard/zone/5")
    assert r_single.status_code == 200
    zone5 = r_single.json()
    assert zone5["zone_id"] == 5
    assert "critical_assets" in zone5

    # 4. GET /api/v1/hazard/zone/999 (Non-existent -> 404)
    r_404 = client.get("/api/v1/hazard/zone/999")
    assert r_404.status_code == 404
