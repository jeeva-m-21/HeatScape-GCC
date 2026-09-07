"""Unit and API integration tests for A* Shaded Cool Pedestrian Routing Service."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.routing_service import CoolRoutingService, haversine_distance_meters

client = TestClient(app)


def test_haversine_distance():
    """Verify metric great-circle calculation between known Chennai landmarks."""
    # Distance between Panagal Park (13.0401, 80.2310) and T. Nagar Bus Stand (13.0350, 80.2320) ~600m
    dist = haversine_distance_meters(13.0401, 80.2310, 13.0350, 80.2320)
    assert 500 < dist < 800


def test_grid_graph_construction():
    """Verify nodes, edges, and thermal anomaly assignment."""
    nodes, adj = CoolRoutingService._build_chennai_grid_graph()
    assert len(nodes) == 81  # 9x9 grid
    assert len(adj) == 81

    # Check that high heat nodes have higher anomaly and lower canopy
    usman_hub = nodes.get("R4_C4")
    assert usman_hub is not None
    assert usman_hub.anomaly_c > 3.0
    assert usman_hub.canopy_pct < 10.0

    # Check park nodes
    park_node = nodes.get("R4_C2")
    assert park_node is not None
    assert park_node.anomaly_c < 0.0
    assert park_node.canopy_pct > 50.0


def test_cool_vs_direct_route_optimization():
    """Verify that the Cool Route yields lower thermal exposure and higher canopy cover."""
    res = CoolRoutingService.find_routes(
        origin_lat=13.0360,
        origin_lon=80.2280,
        dest_lat=13.0440,
        dest_lon=80.2360,
    )

    assert "direct_route" in res
    assert "cool_route" in res
    assert "comparison_summary" in res

    direct = res["direct_route"]
    cool = res["cool_route"]

    # Cool route should have lower or equal average thermal anomaly than direct route
    assert cool["avg_anomaly_c"] <= direct["avg_anomaly_c"]

    # Cool route should have higher or equal canopy coverage
    assert cool["canopy_coverage_pct"] >= direct["canopy_coverage_pct"]

    # GeoJSON validity
    assert cool["geojson"]["type"] == "Feature"
    assert cool["geojson"]["geometry"]["type"] == "LineString"
    assert len(cool["geojson"]["geometry"]["coordinates"]) >= 2


def test_routing_api_endpoints():
    """Integration test for FastAPI /api/v1/routing endpoints."""
    # 1. Cool path calculation
    payload = {
        "origin_lat": 13.0365,
        "origin_lon": 80.2285,
        "dest_lat": 13.0440,
        "dest_lon": 80.2355,
        "prioritize_shade": True,
    }
    res_path = client.post("/api/v1/routing/cool-path", json=payload)
    assert res_path.status_code == 200
    data_path = res_path.json()
    assert "comparison_summary" in data_path
    assert "direct_route" in data_path
    assert "cool_route" in data_path

    # 2. Refuges endpoint
    res_refuges = client.get("/api/v1/routing/refuges")
    assert res_refuges.status_code == 200
    data_ref = res_refuges.json()
    assert data_ref["total_refuges"] >= 5

    # 3. Sample corridors endpoint
    res_corr = client.get("/api/v1/routing/sample-corridors")
    assert res_corr.status_code == 200
    data_corr = res_corr.json()
    assert len(data_corr["corridors"]) >= 3
