"""
Tests for Drone & UAV Radiometric Thermal Orthomosaic Service and Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.drone_service import (
    drone_service,
    calibrate_radiometric_thermal,
)

client = TestClient(app)


def test_calibrate_radiometric_thermal():
    """Verify radiometric formula LST = ((DN * scale) - 273.15) / (emissivity ** 0.25)."""
    # Test DN=8000, scale=0.04 -> 320 Kelvin -> 46.85°C unadjusted
    # With emissivity=1.0: 46.85°C
    temp_perfect_emissivity = calibrate_radiometric_thermal(8000, emissivity=1.0, calibration_scale=0.04)
    assert temp_perfect_emissivity == pytest.approx(46.85, rel=1e-2)

    # With emissivity=0.95: should slightly increase surface temperature due to emissivity compensation
    temp_real_emissivity = calibrate_radiometric_thermal(8000, emissivity=0.95, calibration_scale=0.04)
    assert temp_real_emissivity > temp_perfect_emissivity

    # Zero or negative DN safety check
    assert calibrate_radiometric_thermal(0) == 0.0
    assert calibrate_radiometric_thermal(-10) == 0.0


def test_list_missions():
    """Verify listing UAV missions with optional GCC Zone filter."""
    missions = drone_service.list_missions()
    assert len(missions) >= 3
    assert any("T. Nagar" in m["target_zone"] for m in missions)

    filtered = drone_service.list_missions(zone="Zone 9")
    assert len(filtered) >= 1
    assert "Zone 9" in filtered[0]["target_zone"]


def test_generate_gcp_signed_upload_url():
    """Verify mock GCP Cloud Storage V4 signed URL format."""
    res = drone_service.generate_gcp_signed_upload_url(
        filename="chennai_ortho_test.tif",
        bucket_name="chennai-heatscape-drone-tiles",
        expires_in_seconds=1800,
    )
    assert "signed_upload_url" in res
    assert "https://storage.googleapis.com/chennai-heatscape-drone-tiles" in res["signed_upload_url"]
    assert "GoogleAccessId=" in res["signed_upload_url"]
    assert res["http_method"] == "PUT"
    assert res["expires_in_seconds"] == 1800


def test_ingest_orthomosaic_metadata():
    """Verify processing of UAV flight with calibrated hotspots."""
    result = drone_service.ingest_orthomosaic_metadata(
        mission_id="UAV-TEST-001",
        pilot_callsign="GARUDA-TEST",
        target_zone="Zone 1 (Thiruvottiyur)",
        bbox=[80.29, 13.15, 80.31, 13.17],
        gcp_storage_uri="gs://chennai-heatscape-drone-tiles/test.tif",
        raw_dn_samples=[7900, 8100, 8200],
        mean_emissivity=0.96,
    )
    assert result["mission_id"] == "UAV-TEST-001"
    assert result["flight_status"] == "PROCESSED"
    assert len(result["micro_hotspots"]) > 0
    assert result["max_lst_celsius"] >= result["min_lst_celsius"]
    assert any("Reflective Cool Painted Roof" in h["surface_material"] for h in result["micro_hotspots"])


def test_drone_api_endpoints():
    """Verify HTTP API endpoints for drone missions, upload URL, and calibration."""
    # 1. GET /api/v1/drone/missions
    r = client.get("/api/v1/drone/missions")
    assert r.status_code == 200
    data = r.json()
    assert "missions" in data
    assert len(data["missions"]) > 0

    # 2. POST /api/v1/drone/upload-url
    payload_url = {
        "filename": "flight_test_01.tif",
        "content_type": "image/tiff",
        "bucket_name": "chennai-heatscape-drone-tiles",
        "expires_in_seconds": 3600,
    }
    r_url = client.post("/api/v1/drone/upload-url", json=payload_url)
    assert r_url.status_code == 200
    res_url = r_url.json()
    assert "signed_upload_url" in res_url

    # 3. POST /api/v1/drone/calibrate-pixel
    payload_cal = {
        "digital_number": 8100,
        "emissivity": 0.95,
        "calibration_scale": 0.04,
    }
    r_cal = client.post("/api/v1/drone/calibrate-pixel", json=payload_cal)
    assert r_cal.status_code == 200
    res_cal = r_cal.json()
    assert "calibrated_celsius" in res_cal
    assert res_cal["calibrated_celsius"] > 40.0

    # 4. POST /api/v1/drone/ingest-ortho
    payload_ingest = {
        "mission_id": "UAV-API-TEST-001",
        "pilot_callsign": "PILOT-API-1",
        "target_zone": "Zone 8 (Anna Nagar)",
        "bbox": [80.20, 13.08, 80.22, 13.10],
        "gcp_storage_uri": "gs://chennai-heatscape-drone-tiles/uploads/annanagar.tif",
        "raw_dn_samples": [7850, 7950, 8150],
        "mean_emissivity": 0.96,
    }
    r_ingest = client.post("/api/v1/drone/ingest-ortho", json=payload_ingest)
    assert r_ingest.status_code == 200
    res_ingest = r_ingest.json()
    assert res_ingest["mission_id"] == "UAV-API-TEST-001"
    assert "micro_hotspots" in res_ingest


def test_calibrate_radiometric_various_materials():
    """Verify material emissivity impact on calibrated surface temperature."""
    dn = 8200
    # Higher emissivity (water 0.99) yields lower required surface temperature
    temp_water = calibrate_radiometric_thermal(dn, emissivity=0.99)
    # Lower emissivity (metal 0.90) yields higher required surface temperature
    temp_metal = calibrate_radiometric_thermal(dn, emissivity=0.90)
    assert temp_metal > temp_water


def test_drone_missions_filter_empty():
    """Verify filtering by non-existent zone returns empty list."""
    empty_res = drone_service.list_missions(zone="Zone 99 (NonExistent)")
    assert empty_res == []


def test_drone_pixel_extreme_flag():
    """Verify that is_extreme_heat is correctly set based on 45.0°C threshold."""
    # Hot pixel: DN=8200 -> ~54°C -> is_extreme_heat=True
    r_hot = client.post("/api/v1/drone/calibrate-pixel", json={"digital_number": 8200, "emissivity": 0.95})
    assert r_hot.status_code == 200
    assert r_hot.json()["is_extreme_heat"] is True

    # Cool pixel: DN=7200 -> ~14°C -> is_extreme_heat=False
    r_cool = client.post("/api/v1/drone/calibrate-pixel", json={"digital_number": 7200, "emissivity": 0.95})
    assert r_cool.status_code == 200
    assert r_cool.json()["is_extreme_heat"] is False


def test_drone_service_default_dn_samples():
    """Verify fallback to default representative DN samples when None is passed."""
    res = drone_service.ingest_orthomosaic_metadata(
        mission_id="UAV-DEFAULT-TEST",
        pilot_callsign="GARUDA-DEFAULT",
        target_zone="Zone 5 (Royapuram)",
        bbox=[80.28, 13.08, 80.30, 13.10],
        gcp_storage_uri="gs://chennai-heatscape-drone-tiles/default.tif",
        raw_dn_samples=None,
    )
    assert res["samples_processed_count"] > 0
    assert res["flight_status"] == "PROCESSED"

