"""Unit and API integration tests for 3D Terrain, Sea Breeze, and Street Canyon microclimate services."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.terrain_service import TerrainService

client = TestClient(app)


def test_elevation_at_point():
    """Verify Chennai coastal vs inland and topographic hill elevation."""
    # Coastline at Marina
    marina_elev = TerrainService.get_elevation_at_point(13.0500, 80.2820)
    assert 1.0 <= marina_elev <= 6.0

    # St. Thomas Mount summit
    mount_elev = TerrainService.get_elevation_at_point(12.9960, 80.1940)
    assert mount_elev >= 45.0  # Prominent hill

    # Pallavaram Ridge summit
    pallavaram_elev = TerrainService.get_elevation_at_point(12.9650, 80.1550)
    assert pallavaram_elev >= 80.0  # Ridge feature

    # Porur inland
    porur_elev = TerrainService.get_elevation_at_point(13.0350, 80.1550)
    assert porur_elev > marina_elev  # Westward elevation gradient


def test_sea_breeze_penetration():
    """Verify Bay of Bengal sea breeze cooling and marine layer intrusion."""
    # Coastal point during peak afternoon (14:00)
    coastal_sb = TerrainService.calculate_sea_breeze_penetration(
        lat=13.0500, lon=80.2800, coastal_wind_speed_ms=4.0, hour_of_day=14
    )
    assert coastal_sb["is_sea_breeze_active"] is True
    assert coastal_sb["status"] == "ACTIVE_SEA_BREEZE_ZONE"
    assert coastal_sb["cooling_relief_c"] >= 1.5
    assert coastal_sb["humidity_boost_pct"] > 5.0
    assert "IST" in coastal_sb["front_arrival_time"]

    # Nighttime condition (23:00) - sea breeze inactive
    night_sb = TerrainService.calculate_sea_breeze_penetration(
        lat=13.0500, lon=80.2800, coastal_wind_speed_ms=4.0, hour_of_day=23
    )
    assert night_sb["cooling_relief_c"] < 0.5


def test_transect_profile():
    """Verify high-resolution cross-sectional transect extraction."""
    transect = TerrainService.get_transect_profile(transect_id="coastal-to-inland", steps=30)
    assert transect["transect_id"] == "coastal-to-inland"
    assert len(transect["profile_points"]) == 31
    assert transect["total_distance_km"] > 10.0
    assert transect["max_sea_breeze_relief_c"] > 0.0

    # Ensure profile distances are monotonically non-decreasing
    dists = [p["cumulative_dist_km"] for p in transect["profile_points"]]
    assert all(dists[i] <= dists[i + 1] for i in range(len(dists) - 1))


def test_street_canyon_microclimate():
    """Verify Oke street canyon aspect ratio, sky view factor, and entrapment."""
    # Deep canyon (T. Nagar commercial street: H=30m, W=12m -> H/W = 2.5)
    deep_canyon = TerrainService.analyze_street_canyon(
        building_height_m=30.0,
        street_width_m=12.0,
        canyon_orientation_deg=0.0,
        ambient_wind_speed_ms=3.5,
        ambient_wind_dir_deg=90.0,  # Perpendicular wind
    )
    assert deep_canyon["flow_regime"] == "SKIMMING_FLOW"
    assert deep_canyon["sky_view_factor"] < 0.30
    assert deep_canyon["thermal_entrapment_index"] > 60.0
    assert len(deep_canyon["recommended_interventions"]) > 0

    # Wide boulevard (Marina promenade: H=8m, W=32m -> H/W = 0.25)
    wide_boulevard = TerrainService.analyze_street_canyon(
        building_height_m=8.0,
        street_width_m=32.0,
        canyon_orientation_deg=0.0,
        ambient_wind_speed_ms=3.5,
        ambient_wind_dir_deg=90.0,
    )
    assert wide_boulevard["flow_regime"] == "ISOLATED_ROUGHNESS"
    assert wide_boulevard["sky_view_factor"] > 0.75
    assert wide_boulevard["thermal_entrapment_index"] < deep_canyon["thermal_entrapment_index"]


def test_3d_terrain_mesh():
    """Verify 3D terrain grid mesh generation."""
    mesh = TerrainService.generate_3d_terrain_grid(grid_rows=10, grid_cols=10)
    assert mesh["grid_dimensions"]["total_nodes"] == 100
    assert len(mesh["nodes"]) == 100
    first_node = mesh["nodes"][0]
    assert "elevation_m" in first_node
    assert "sea_breeze_cooling_c" in first_node
    assert "surface_temp_adjusted_c" in first_node


def test_terrain_api_endpoints():
    """Verify all HTTP endpoints for terrain service."""
    # 1. Elevation point
    resp = client.get("/api/v1/terrain/elevation?lat=13.04&lon=80.23")
    assert resp.status_code == 200
    assert "elevation_m" in resp.json()

    # 2. Transects list
    resp = client.get("/api/v1/terrain/transects")
    assert resp.status_code == 200
    assert len(resp.json()["transects"]) >= 3

    # 3. Transect detail
    resp = client.get("/api/v1/terrain/transects/coastal-to-inland?steps=20")
    assert resp.status_code == 200
    assert len(resp.json()["profile_points"]) == 21

    # 4. Custom transect
    resp = client.post(
        "/api/v1/terrain/transect/custom",
        json={
            "start_lat": 13.08,
            "start_lon": 80.28,
            "end_lat": 13.00,
            "end_lon": 80.20,
            "steps": 15,
        },
    )
    assert resp.status_code == 200
    assert len(resp.json()["profile_points"]) == 16

    # 5. Sea breeze
    resp = client.get("/api/v1/terrain/sea-breeze?lat=13.04&lon=80.24&hour_of_day=14")
    assert resp.status_code == 200
    assert "cooling_relief_c" in resp.json()

    # 6. Street canyon analysis
    resp = client.post(
        "/api/v1/terrain/street-canyon/analyze",
        json={
            "building_height_m": 24.0,
            "street_width_m": 14.0,
            "canyon_orientation_deg": 45.0,
            "ambient_wind_speed_ms": 3.2,
            "ambient_wind_dir_deg": 90.0,
        },
    )
    assert resp.status_code == 200
    assert resp.json()["flow_regime"] in ["ISOLATED_ROUGHNESS", "WAKE_INTERFERENCE", "SKIMMING_FLOW"]

    # 7. 3D Terrain mesh
    resp = client.get("/api/v1/terrain/mesh-3d?rows=8&cols=8")
    assert resp.status_code == 200
    assert resp.json()["grid_dimensions"]["total_nodes"] == 64
