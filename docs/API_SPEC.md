# HeatScape: REST API Specification (v1)

Base URL: `/api/v1`

All responses follow standard HTTP status codes:
- `200 OK`: Request succeeded.
- `400 Bad Request`: Validation failure.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unhandled backend exception.

---

## 1. Heat & Trajectories Endpoints

### 1.1 `GET /api/v1/heat/cells/geojson`
Returns an RFC 7946 GeoJSON `FeatureCollection` streaming 100m grid polygons projected in EPSG:4326 for direct rendering in MapLibre GL JS.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `min_anomaly` | float | No | null | Filter cells with `mean_anomaly_celsius >= min_anomaly` |
| `state` | string | No | null | Filter by trajectory state: `PERSISTENT`, `EMERGING`, `TEMPORARY`, `IMPROVING`, `WATCH` |
| `ward_id` | string | No | null | Administrative ward identifier (e.g. `WARD_114`) |
| `bbox` | string | No | null | Bounding box filter `minLon,minLat,maxLon,maxLat` |
| `limit` | int | No | 2000 | Maximum number of cells to stream |

#### Response (`application/geo+json`)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "CHE_012_045",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[80.2100, 13.0400], [80.2110, 13.0400], [80.2110, 13.0410], [80.2100, 13.0410], [80.2100, 13.0400]]
        ]
      },
      "properties": {
        "cell_id": "CHE_012_045",
        "ward_id": "WARD_114",
        "zone_id": "ZONE_09",
        "population": 1420,
        "population_density_sqkm": 14200.0,
        "building_density": 0.65,
        "impervious_fraction": 0.82,
        "tree_canopy_fraction": 0.08,
        "state": "EMERGING",
        "mean_anomaly": 2.45,
        "trend_slope": 0.042,
        "recurrence": 0.72,
        "confidence": 0.88,
        "regime_shift": 1.0
      }
    }
  ]
}
```

---

### 1.2 `GET /api/v1/heat/cells/{cell_id}/history`
Fetches the complete 36-month chronological longitudinal observation time series for a single analytical grid cell.

#### Path Parameters
- `cell_id` (string): e.g., `CHE_012_045`

#### Response (`application/json`)
```json
{
  "cell_id": "CHE_012_045",
  "total_observations": 36,
  "history": [
    {
      "observation_date": "2023-01-15T00:00:00Z",
      "lst_celsius": 34.2,
      "ndvi": 0.18,
      "air_temp_2m": 29.5,
      "relative_humidity_2m": 68.0,
      "seasonal_baseline_lst": 31.8,
      "contextual_anomaly_celsius": 2.4,
      "spatial_anomaly_celsius": 1.9,
      "cloud_mask_qa": "VALID"
    }
  ]
}
```

---

### 1.3 `GET /api/v1/heat/cells/{cell_id}/explain`
Retrieves TreeSHAP local attribution ("Why Hot?") and temporal feature drift attribution ("Why Now?") for a specific cell.

#### Path Parameters
- `cell_id` (string): e.g., `CHE_012_045`

#### Response (`application/json`)
```json
{
  "cell_id": "CHE_012_045",
  "why_hot": {
    "base_value_celsius": 32.1,
    "predicted_lst_celsius": 36.4,
    "shap_values": [
      { "feature": "impervious_fraction", "value": 0.82, "contribution_celsius": 2.15 },
      { "feature": "building_density", "value": 0.65, "contribution_celsius": 1.42 },
      { "feature": "tree_canopy_fraction", "value": 0.08, "contribution_celsius": 0.95 },
      { "feature": "water_distance_m", "value": 1850.0, "contribution_celsius": 0.28 },
      { "feature": "elevation_m", "value": 8.5, "contribution_celsius": -0.50 }
    ],
    "primary_driver": "impervious_fraction"
  },
  "why_now": {
    "regime_shift_detected": true,
    "regime_shift_estimated_date": "2024-04-15T00:00:00Z",
    "ndvi_drift": -0.14,
    "lst_drift_celsius": 1.85,
    "spatial_anomaly_drift_celsius": 1.22,
    "diagnosis": "Rapid Urban Densification / Vegetation Loss"
  }
}
```

---

### 1.4 `GET /api/v1/heat/kpi`
Returns aggregate summary statistics across all analytical grid cells for executive GCC dashboards.

#### Response (`application/json`)
```json
{
  "total_cells": 1200,
  "persistent_count": 240,
  "emerging_count": 240,
  "temporary_count": 180,
  "improving_count": 120,
  "watch_count": 420,
  "exposed_population": 485000,
  "mean_city_anomaly": 1.35,
  "max_observed_anomaly": 4.12
}
```

---

## 2. Optimization & Interventions Endpoints

### 2.1 `GET /api/v1/interventions/types`
Returns the standardized catalog of urban cooling interventions.

#### Response (`application/json`)
```json
[
  {
    "id": "COOL_ROOF",
    "name": "High-Albedo Cool Roof Coating",
    "category": "Passive Albedo",
    "unit_name": "sq_m",
    "unit_cost_inr_low": 120.0,
    "unit_cost_inr_high": 180.0,
    "cooling_effect_per_unit_low": 0.0018,
    "cooling_effect_per_unit_high": 0.0035,
    "evidence_grade": "A",
    "maintenance_overhead_annual_inr": 15.0
  },
  {
    "id": "URBAN_CANOPY",
    "name": "Native Urban Forest Canopy Planting",
    "category": "Nature-Based Solutions",
    "unit_name": "tree_count",
    "unit_cost_inr_low": 2500.0,
    "unit_cost_inr_high": 4000.0,
    "cooling_effect_per_unit_low": 0.045,
    "cooling_effect_per_unit_high": 0.085,
    "evidence_grade": "A",
    "maintenance_overhead_annual_inr": 300.0
  },
  {
    "id": "COOL_PAVEMENT",
    "name": "Permeable Reflective Pavement",
    "category": "Pavement Modification",
    "unit_name": "sq_m",
    "unit_cost_inr_low": 450.0,
    "unit_cost_inr_high": 750.0,
    "cooling_effect_per_unit_low": 0.0012,
    "cooling_effect_per_unit_high": 0.0028,
    "evidence_grade": "B",
    "maintenance_overhead_annual_inr": 45.0
  },
  {
    "id": "SHADE_CANOPY",
    "name": "Transit Hub Modular Shade Canopy",
    "category": "Engineered Shading",
    "unit_name": "canopy_count",
    "unit_cost_inr_low": 45000.0,
    "unit_cost_inr_high": 70000.0,
    "cooling_effect_per_unit_low": 0.35,
    "cooling_effect_per_unit_high": 0.65,
    "evidence_grade": "B",
    "maintenance_overhead_annual_inr": 3500.0
  }
]
```

---

### 2.2 `POST /api/v1/optimize`
Invokes the Google OR-Tools Mixed-Integer Linear Programming solver.

#### Request Body (`application/json`)
```json
{
  "budget_inr": 5000000.0,
  "mode": "EXPECTED",
  "target_wards": null,
  "max_cells": 50
}
```

#### Response (`application/json`)
```json
{
  "status": "OPTIMAL",
  "mode": "EXPECTED",
  "allocated_budget_inr": 5000000.0,
  "total_cost_inr": 4982500.0,
  "total_risk_reduction_score": 18450.2,
  "population_protected": 89400,
  "allocations_count": 34,
  "portfolio": [
    {
      "cell_id": "CHE_012_045",
      "ward_id": "WARD_114",
      "state": "EMERGING",
      "population": 1420,
      "interventions": [
        {
          "type_id": "COOL_ROOF",
          "quantity": 2400.0,
          "unit_name": "sq_m",
          "cost_inr": 360000.0,
          "cooling_effect_celsius": 0.64
        },
        {
          "type_id": "URBAN_CANOPY",
          "quantity": 35.0,
          "unit_name": "tree_count",
          "cost_inr": 113750.0,
          "cooling_effect_celsius": 2.28
        }
      ],
      "cell_total_cost_inr": 473750.0
    }
  ]
}
```

---

## 3. Data Pipelines & Lifecycle Endpoints

### 3.1 `POST /api/v1/pipelines/seed`
Idempotently triggers the generation and seeding of the 1,200 Chennai analytical cells and 36 monthly observations.
- Response: `{"status": "SUCCESS", "cells_seeded": 1200, "observations_seeded": 43200}`

### 3.2 `POST /api/v1/pipelines/recalculate`
Triggers full recomputation of Mann-Kendall trends, Sen's slope, PELT change points, and state probability vectors.
- Response: `{"status": "SUCCESS", "trajectories_recalculated": 1200}`
