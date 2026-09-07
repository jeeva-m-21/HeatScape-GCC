"""Unit and API integration tests for Earth Observation Satellite Ingestion Service."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ingest_service import (
    SatelliteIngestService,
    calculate_ndvi,
    calculate_lst_from_radiance,
)

client = TestClient(app)


def test_ndvi_calculation():
    """Verify NDVI formula across vegetated and non-vegetated surfaces."""
    # Dense vegetation: High NIR (0.6), Low Red (0.1) -> NDVI = 0.5 / 0.7 = 0.714
    dense_veg = calculate_ndvi(0.6, 0.1)
    assert 0.7 <= dense_veg <= 0.75

    # Urban concrete / bare soil: Similar NIR (0.2) and Red (0.2) -> NDVI ~ 0.0
    urban_surface = calculate_ndvi(0.2, 0.2)
    assert -0.05 <= urban_surface <= 0.05

    # Water body: Absorbs NIR (0.05), reflects slight blue/red (0.1) -> NDVI < 0
    water = calculate_ndvi(0.05, 0.1)
    assert water < 0.0


def test_lst_from_radiance():
    """Verify Landsat-9 TIRS Band 10 radiative transfer equation."""
    # Typical TOA spectral radiance for Chennai summer: ~11.5 W/(m2*sr*um)
    lst = calculate_lst_from_radiance(11.5, surface_emissivity=0.97)
    assert 35.0 <= lst <= 50.0

    # Zero or invalid radiance fallback
    lst_zero = calculate_lst_from_radiance(0.0)
    assert lst_zero == 30.0


def test_satellite_status_metadata():
    """Verify satellite constellation status and revisit schedules."""
    status = SatelliteIngestService.get_satellite_status()
    assert "recent_acquisitions" in status
    assert len(status["recent_acquisitions"]) >= 2
    assert "upcoming_overpasses" in status
    assert len(status["upcoming_overpasses"]) >= 2

    l9 = status["recent_acquisitions"][0]
    assert "Landsat-9" in l9["satellite"]
    assert l9["orbit_path"] == 142
    assert l9["orbit_row"] == 51
    assert l9["cloud_cover_pct"] < 15.0


def test_trigger_simulated_overpass():
    """Verify automated satellite overpass acquisition and cell updates."""
    result = SatelliteIngestService.trigger_simulated_overpass()
    assert "ingest_id" in result
    assert "scene_id" in result
    assert result["spatial_coverage"]["cells_updated"] == 1200
    assert result["new_emerging_hotspots_detected"] >= 1
    assert "radiometric_summary" in result
    assert result["radiometric_summary"]["mean_surface_temp_c"] > 35.0


def test_sensors_vs_satellite_correlation():
    """Verify cross-validation between satellite LST and 842 IoT ground sensors."""
    report = SatelliteIngestService.get_sensors_vs_satellite_correlation()
    assert report["sample_nodes_evaluated"] == 842
    assert report["pearson_correlation_r2"] >= 0.90
    assert report["mean_absolute_error_c"] < 1.0
    assert len(report["corridor_pairs"]) == 8


def test_api_ingest_endpoints():
    """Integration tests for FastAPI /api/v1/ingest endpoints."""
    # 1. Satellite status endpoint
    res_status = client.get("/api/v1/ingest/satellite-status")
    assert res_status.status_code == 200
    data_status = res_status.json()
    assert "recent_acquisitions" in data_status

    # 2. Trigger overpass endpoint
    res_overpass = client.post("/api/v1/ingest/trigger-overpass")
    assert res_overpass.status_code == 200
    data_overpass = res_overpass.json()
    assert data_overpass["spatial_coverage"]["cells_updated"] == 1200

    # 3. Sensors vs satellite correlation endpoint
    res_corr = client.get("/api/v1/ingest/sensors-vs-satellite")
    assert res_corr.status_code == 200
    data_corr = res_corr.json()
    assert data_corr["pearson_correlation_r2"] > 0.90
