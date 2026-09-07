import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "HEALTHY"}


def test_heat_kpi_endpoint():
    resp = client.get("/api/v1/heat/kpi")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_cells"] == 1200
    assert data["emerging_count"] > 0
    assert data["persistent_count"] > 0
    assert data["exposed_population"] > 0


def test_geojson_cells_streaming():
    resp = client.get("/api/v1/heat/cells/geojson?limit=10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 10

    first_feat = data["features"][0]
    assert first_feat["type"] == "Feature"
    assert "cell_id" in first_feat["properties"]
    assert "mean_anomaly" in first_feat["properties"]
    assert first_feat["geometry"]["type"] == "Polygon"


def test_interventions_catalog():
    resp = client.get("/api/v1/interventions/types")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 4
    type_ids = [it["id"] for it in data]
    assert "COOL_ROOF" in type_ids
    assert "URBAN_CANOPY" in type_ids


def test_optimization_endpoint():
    payload = {
        "budget_inr": 2000000.0,
        "mode": "EXPECTED",
        "max_cells": 20
    }
    resp = client.post("/api/v1/interventions/optimize", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ["OPTIMAL", "FEASIBLE"]
    assert data["total_cost_inr"] <= 2000000.0
    assert data["allocations_count"] > 0


def test_cell_explain_endpoint():
    # First get a cell_id from geojson
    cells_resp = client.get("/api/v1/heat/cells/geojson?limit=1")
    cell_id = cells_resp.json()["features"][0]["properties"]["cell_id"]

    resp = client.get(f"/api/v1/heat/cells/{cell_id}/explain")
    assert resp.status_code == 200
    data = resp.json()
    assert data["cell_id"] == cell_id
    assert "why_hot" in data
    assert "why_now" in data
    assert len(data["why_hot"]["shap_values"]) >= 5


def test_tender_manifest_endpoint():
    payload = {
        "budget_inr": 2500000.0,
        "mode": "EXPECTED",
        "equity_weight": 0.6,
        "contiguity_priority": True,
        "max_cells": 15
    }
    resp = client.post("/api/v1/interventions/tender-manifest", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "tender_id" in data
    assert "council_resolution_ref" in data
    assert len(data["items"]) > 0
    assert data["subtotal_inr"] > 0
    assert data["statutory_gst_inr"] > 0
    assert data["grand_total_inr"] > data["subtotal_inr"]
    assert "Greater Chennai Corporation" in data["authority"]


def test_sensors_endpoint():
    resp = client.get("/api/v1/sensors/live")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_nodes_online"] == 842
    assert len(data["corridors"]) > 0
    assert "apparent_heat_index_c" in data["corridors"][0]

    resp_corr = client.get("/api/v1/sensors/corridors")
    assert resp_corr.status_code == 200
    assert len(resp_corr.json()) >= 3


def test_compare_scenarios_endpoint():
    payload = {
        "budget_inr": 3000000.0,
        "mode": "EXPECTED",
        "equity_weight": 0.5,
        "max_cells": 15
    }
    resp = client.post("/api/v1/interventions/compare-scenarios", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "strategy_a" in data
    assert "strategy_b" in data
    assert "delta_cooling_celsius" in data
    assert data["strategy_a"]["total_cost_inr"] <= 3000000.0
    assert data["strategy_b"]["total_cost_inr"] <= 3000000.0


def test_council_brief_endpoint():
    payload = {
        "budget_inr": 5000000.0,
        "mode": "EXPECTED",
        "equity_weight": 0.6,
        "max_cells": 15
    }
    resp = client.post("/api/v1/interventions/council-brief", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "brief_id" in data
    assert "executive_summary" in data
    assert "key_recommendations" in data
    assert len(data["key_recommendations"]) >= 3


