"""Unit and integration tests for Heatwave Early Warning & GCC GRAP Engine."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.heatwave_service import HeatwaveService, calculate_apparent_heat_index

client = TestClient(app)


def test_apparent_heat_index_calculation():
    """Verify Steadman apparent heat index formula under tropical humidity."""
    # At 35°C and 70% humidity, apparent heat index should feel significantly higher (>= 40°C)
    hi = calculate_apparent_heat_index(35.0, 70.0)
    assert hi >= 40.0
    assert isinstance(hi, float)

    # Moderate conditions: 28°C and 50% humidity
    hi_mod = calculate_apparent_heat_index(28.0, 50.0)
    assert 28.0 <= hi_mod <= 32.0


def test_imd_alert_classification():
    """Verify IMD alert level classifications: GREEN, YELLOW, ORANGE, RED."""
    # Normal temperature (< 40°C)
    green = HeatwaveService.classify_imd_alert(38.0, 1)
    assert green["alert_level"] == "GREEN"
    assert green["severity_code"] == 1

    # Heat Watch (40°C - 42.9°C, 1 day)
    yellow = HeatwaveService.classify_imd_alert(41.5, 1)
    assert yellow["alert_level"] == "YELLOW"
    assert yellow["severity_code"] == 2

    # Severe Heat (43°C - 44.9°C or 40°C+ for 2+ consecutive days)
    orange_single = HeatwaveService.classify_imd_alert(43.5, 1)
    assert orange_single["alert_level"] == "ORANGE"
    assert orange_single["severity_code"] == 3

    orange_consecutive = HeatwaveService.classify_imd_alert(41.0, 2)
    assert orange_consecutive["alert_level"] == "ORANGE"

    # Extreme Heat (>= 45°C or severe heatwave for 3+ consecutive days)
    red_high = HeatwaveService.classify_imd_alert(45.2, 1)
    assert red_high["alert_level"] == "RED"
    assert red_high["severity_code"] == 4

    red_consecutive = HeatwaveService.classify_imd_alert(43.5, 3)
    assert red_consecutive["alert_level"] == "RED"


def test_7day_forecast_structure():
    """Verify 7-day rolling forecast data structure and metadata."""
    forecast = HeatwaveService.get_7day_forecast()
    assert "daily_forecasts" in forecast
    assert len(forecast["daily_forecasts"]) == 7
    assert "vulnerable_zones" in forecast
    assert len(forecast["vulnerable_zones"]) >= 5

    # Check properties of daily predictions
    first_day = forecast["daily_forecasts"][0]
    assert "date" in first_day
    assert "max_temp_c" in first_day
    assert "apparent_heat_index_c" in first_day
    assert "imd_alert" in first_day
    assert "action_summary" in first_day


def test_grap_stages_and_mandates():
    """Verify GCC Graded Response Action Plan (GRAP) stage transitions."""
    # Stage 0: Advisory
    stage0 = HeatwaveService.get_grap_status(forced_stage=0)
    assert stage0["current_stage"] == 0
    assert stage0["cooling_shelters_count"] == 0

    # Stage 2: Orange emergency
    stage2 = HeatwaveService.get_grap_status(forced_stage=2)
    assert stage2["current_stage"] == 2
    assert "WORK SUSPENSION" in stage2["labor_mandate"]
    assert stage2["misting_trucks_count"] >= 8
    assert len(stage2["departmental_actions"]) >= 4

    # Stage 3: Red crisis
    stage3 = HeatwaveService.get_grap_status(forced_stage=3)
    assert stage3["current_stage"] == 3
    assert stage3["cooling_shelters_count"] >= 100


def test_dispatch_manifest_generation():
    """Verify fleet dispatch manifest for misting trucks and cooling shelters."""
    manifest = HeatwaveService.generate_dispatch_manifest()
    assert "dispatch_id" in manifest
    assert "active_misting_vehicles" in manifest
    assert len(manifest["active_misting_vehicles"]) >= 5
    assert "emergency_cooling_shelters" in manifest
    assert len(manifest["emergency_cooling_shelters"]) >= 4

    # Check vehicle specs
    truck = manifest["active_misting_vehicles"][0]
    assert "registration" in truck
    assert truck["capacity_liters"] >= 10000
    assert "Anna Salai" in truck["target_corridor"]

    # Check shelter specs
    shelter = manifest["emergency_cooling_shelters"][0]
    assert shelter["is_open_24_7"] is True
    assert shelter["capacity_persons"] > 0
    assert shelter["current_occupancy"] <= shelter["capacity_persons"]


def test_api_heatwave_endpoints():
    """Integration tests for FastAPI /api/v1/heatwave endpoints."""
    # 1. Forecast endpoint
    res_fc = client.get("/api/v1/heatwave/forecast")
    assert res_fc.status_code == 200
    data_fc = res_fc.json()
    assert len(data_fc["daily_forecasts"]) == 7

    # 2. GRAP Status endpoint (default stage 2)
    res_grap = client.get("/api/v1/heatwave/grap-status?stage=2")
    assert res_grap.status_code == 200
    data_grap = res_grap.json()
    assert data_grap["current_stage"] == 2
    assert "departmental_actions" in data_grap

    # 3. Dispatch Manifest endpoint
    res_disp = client.post("/api/v1/heatwave/dispatch-manifest")
    assert res_disp.status_code == 200
    data_disp = res_disp.json()
    assert "active_misting_vehicles" in data_disp

    # 4. Shelters endpoint
    res_shelters = client.get("/api/v1/heatwave/shelters")
    assert res_shelters.status_code == 200
    data_shelters = res_shelters.json()
    assert "shelters" in data_shelters
    assert data_shelters["total_capacity"] > 0
