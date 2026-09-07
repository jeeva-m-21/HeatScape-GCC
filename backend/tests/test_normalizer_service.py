"""Unit and API integration tests for Universal Open Dataset Normalizer & OGC API."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.dataset_normalizer import DatasetNormalizerService

client = TestClient(app)


def test_alias_resolution():
    """Verify fuzzy matching and alias resolution for common open dataset column names."""
    assert DatasetNormalizerService.resolve_field_name("LST") == "surface_temp_c"
    assert DatasetNormalizerService.resolve_field_name("temperature_2m") == "surface_temp_c"
    assert DatasetNormalizerService.resolve_field_name("band10_celsius") == "surface_temp_c"
    assert DatasetNormalizerService.resolve_field_name("RH") == "relative_humidity_pct"
    assert DatasetNormalizerService.resolve_field_name("dewpoint_spread") == "relative_humidity_pct"
    assert DatasetNormalizerService.resolve_field_name("veg_index") == "ndvi"
    assert DatasetNormalizerService.resolve_field_name("tree_cover") == "canopy_pct"
    assert DatasetNormalizerService.resolve_field_name("ward_no") == "ward_id"
    assert DatasetNormalizerService.resolve_field_name("unrelated_xyz_column") is None


def test_temperature_kelvin_conversion():
    """Verify Kelvin to Celsius auto-conversion and realistic bounding."""
    # Kelvin conversion: 315.15 K -> 42.0°C
    t_c = DatasetNormalizerService.normalize_temperature(315.15)
    assert t_c == 42.0

    # Normal Celsius: 38.6°C remains 38.6°C
    t_normal = DatasetNormalizerService.normalize_temperature(38.6)
    assert t_normal == 38.6

    # Unrealistic outlier rejected
    assert DatasetNormalizerService.normalize_temperature(-50.0) is None
    assert DatasetNormalizerService.normalize_temperature(120.0) is None


def test_humidity_fractional_conversion():
    """Verify fractional humidity (0.0 - 1.0) converted to percentage (0 - 100)."""
    # Fractional humidity (e.g. from ERA5 / NASA POWER)
    h_pct = DatasetNormalizerService.normalize_humidity(0.72)
    assert h_pct == 72.0

    # Standard percentage
    h_standard = DatasetNormalizerService.normalize_humidity(68.5)
    assert h_standard == 68.5


def test_chennai_bbox_filtering():
    """Verify Chennai bounding box validation."""
    # Point inside Chennai (T. Nagar: 13.04, 80.23)
    assert DatasetNormalizerService.is_in_chennai(13.04, 80.23) is True

    # Point outside Chennai (e.g. London, Delhi, Bangalore)
    assert DatasetNormalizerService.is_in_chennai(51.50, -0.12) is False
    assert DatasetNormalizerService.is_in_chennai(28.61, 77.20) is False


def test_geojson_feature_collection_normalization():
    """Verify full normalization of an arbitrary external GeoJSON FeatureCollection."""
    raw_payload = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [80.2482, 13.0425]},
                "properties": {
                    "LST": 316.35,  # Kelvin (should convert to ~43.2°C)
                    "RH": 0.68,     # Fraction (should convert to 68%)
                    "NDVI": 0.14,
                    "ward_no": "118",
                    "tree_cover": 8.5,
                },
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [80.2337, 13.0401]},
                "properties": {
                    "surface_temp": 44.2,  # Celsius
                    "humidity": 62.0,
                    "veg_index": 0.08,
                    "ward": "Ward 117",
                },
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [77.2090, 28.6139]},  # Delhi (out of bounds)
                "properties": {"LST": 310.0},
            },
        ],
    }

    result = DatasetNormalizerService.normalize_dataset(raw_payload)
    assert result["ingest_status"] == "SUCCESS"
    assert result["total_records_received"] == 3
    assert result["records_normalized"] == 2
    assert result["records_rejected"] == 1  # 1 out of bounds record rejected

    # Check converted properties
    first_feat = result["features"][0]["properties"]
    assert first_feat["surface_temp_celsius"] == 43.2
    assert first_feat["relative_humidity_pct"] == 68.0
    assert first_feat["ndvi"] == 0.14


def test_ogc_api_endpoints():
    """Integration tests for OGC API - Features endpoints."""
    # 1. Landing page
    res_landing = client.get("/api/v1/ogc")
    assert res_landing.status_code == 200
    data_landing = res_landing.json()
    assert "conformance" in str(data_landing["links"])

    # 2. Conformance declaration
    res_conf = client.get("/api/v1/ogc/conformance")
    assert res_conf.status_code == 200
    data_conf = res_conf.json()
    assert any("ogcapi-features" in c for c in data_conf["conformsTo"])

    # 3. Collections catalog
    res_colls = client.get("/api/v1/ogc/collections")
    assert res_colls.status_code == 200
    data_colls = res_colls.json()
    assert len(data_colls["collections"]) >= 3

    # 4. Collection items endpoint
    res_items = client.get("/api/v1/ogc/collections/heat-cells-100m/items?limit=10")
    assert res_items.status_code == 200
    data_items = res_items.json()
    assert data_items["type"] == "FeatureCollection"
    assert len(data_items["features"]) == 10

    # 5. Normalize endpoint
    sample_input = {
        "records": [
            {"lat": 13.042, "lon": 80.245, "temp": 39.4, "rh": 64.0},
            {"lat": 13.038, "lon": 80.231, "temp": 41.5, "rh": 60.0},
        ]
    }
    res_norm = client.post("/api/v1/ogc/normalize", json=sample_input)
    assert res_norm.status_code == 200
    data_norm = res_norm.json()
    assert data_norm["records_normalized"] == 2
    assert data_norm["mean_surface_temp_celsius"] > 38.0
