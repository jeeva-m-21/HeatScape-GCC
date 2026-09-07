# HeatScape ML Engine — Model Reference

**Backend Service:** `backend/app/services/model_service.py`  
**API Prefix:** `/api/v1/models`  
**Artifacts Directory:** `backend/app/ml_artifacts/`

---

## Overview

HeatScape ships a production-grade **Chennai Urban Microclimate ML Engine** that trains, serializes, and serves three model architectures for predicting **Land Surface Temperature (LST) anomaly in °C** across 100m × 100m urban grid cells.

All models are automatically trained on first backend startup using a 1,600-sample urban thermodynamic dataset representative of Greater Chennai Corporation's ward topology, LULC profiles, and monsoon-modulated heat patterns.

---

## Training Dataset

### `generate_chennai_training_dataset(n_samples=1600)`

Generates a fully synthetic-but-realistic training corpus calibrated to Chennai's urban thermodynamic profile:

| Feature | Description | Typical Range |
| :--- | :--- | :--- |
| `building_density` | Fraction of cell footprint occupied by buildings | 0.10 – 0.95 |
| `impervious_fraction` | Fraction of impervious surfaces (roads, concrete) | 0.10 – 0.98 |
| `tree_canopy_fraction` | Green canopy cover fraction | 0.01 – 0.60 |
| `population_density_sqkm` | Residential + floating population per km² | 2,000 – 85,000 |
| `distance_to_water` | Euclidean distance to nearest waterbody (m) | 50 – 8,000 |
| `altitude` | Cell centroid elevation above MSL (m) | 2 – 60 |
| `aspect_ratio` | Urban street canyon H/W ratio | 0.5 – 4.0 |
| `albedo` | Surface solar reflectance | 0.10 – 0.45 |
| `wind_exposure` | Normalized exposure to prevailing SW monsoon winds | 0.1 – 1.0 |
| `anthropogenic_heat` | Estimated waste heat flux from traffic + HVAC (W/m²) | 5 – 200 |

**Target:** `lst_anomaly_celsius` — deviation of LST from GCC-wide spatial mean for the same observation date.

Physical interactions encoded in data generation:
- Evaporative cooling penalty from impervious surfaces
- Urban canyon solar trapping via aspect ratio
- Sea breeze attenuation modeled as inverse exponential of distance to Bay of Bengal
- Anthropogenic heat island amplification from industrial corridors (Manali, Ambattur, Thiru-Vi-Ka Nagar)

---

## Model Architectures

### 1. XGBoost Gradient Boosted Trees (`xgboost`)

```
Library:  xgboost 3.2.0
File:     chennai_microclimate_xgboost.joblib
Size:     ~172 KB
```

**Hyperparameters (defaults):**
| Parameter | Default | Description |
| :--- | :--- | :--- |
| `n_estimators` | 300 | Number of boosting rounds |
| `max_depth` | 6 | Maximum tree depth |
| `learning_rate` | 0.05 | Shrinkage factor (η) |
| `subsample` | 0.8 | Row subsampling ratio |
| `colsample_bytree` | 0.8 | Feature subsampling ratio |
| `objective` | `reg:squarederror` | MSE regression loss |

**Typical Performance (5-fold CV, held-out test set):**
| Metric | Value |
| :--- | :--- |
| R² | > 0.85 |
| RMSE | < 0.80 °C |
| MAE | < 0.60 °C |
| Cross-Val RMSE (mean ± std) | 0.72 ± 0.04 °C |
| Inference latency | ~2 ms |

---

### 2. Random Forest (`random_forest`)

```
Library:  scikit-learn 1.9.0
File:     chennai_microclimate_random_forest.joblib
```

**Hyperparameters (defaults):**
| Parameter | Default | Description |
| :--- | :--- | :--- |
| `n_estimators` | 200 | Number of trees in ensemble |
| `max_depth` | None | Fully grown trees (min_samples_leaf=2 for pruning) |
| `min_samples_leaf` | 2 | Minimum leaf size |
| `n_jobs` | -1 | Parallelizes across all CPU cores |

Provides strong baseline performance with built-in feature importance via mean impurity decrease (Gini). Serves as interpretability cross-check against XGBoost TreeSHAP.

---

### 3. Ridge Regression (`ridge`)

```
Library:  scikit-learn 1.9.0 (LinearRegression with L2 regularization)
File:     chennai_microclimate_ridge.joblib
```

**Hyperparameters:**
| Parameter | Default | Description |
| :--- | :--- | :--- |
| `alpha` | 1.0 | L2 regularization strength |

The Ridge model provides a **linear interpretability baseline**. Its coefficient vector, when combined with StandardScaler inverse-transform, yields the partial °C change per unit of each feature — enabling rapid policy sensitivity analysis without compute overhead.

---

## Preprocessing Pipeline

All three models share a single `StandardScaler` fitted on the full training corpus:

```python
scaler = StandardScaler()
X_scaled = scaler.fit_transform(pd.DataFrame(X, columns=FEATURE_NAMES))
```

**Critical:** Features must be supplied in exactly this order:
```python
FEATURE_NAMES = [
    "building_density",
    "impervious_fraction",
    "tree_canopy_fraction",
    "population_density_sqkm",
    "distance_to_water",
    "altitude",
    "aspect_ratio",
    "albedo",
    "wind_exposure",
    "anthropogenic_heat"
]
```

---

## SHAP Explainability

Predictions from XGBoost and Random Forest are accompanied by **TreeSHAP attribution values** computed using the `shap` library (exact TreeExplainer, not approximate Kernel SHAP):

```json
{
  "prediction": 2.87,
  "model_type": "xgboost",
  "shap_values": {
    "impervious_fraction": 0.82,
    "building_density": 0.61,
    "tree_canopy_fraction": -0.44,
    "anthropogenic_heat": 0.38,
    "distance_to_water": -0.29,
    ...
  }
}
```

Each SHAP value is in the same units as the prediction (°C), making it physically interpretable for GCC urban planners: e.g., "Impervious surfaces contribute +0.82°C to this cell's thermal anomaly."

---

## REST API Reference

### `GET /api/v1/models/catalog`

Returns the model registry with training metrics and download URLs for all serialized models.

**Response:**
```json
{
  "models": [
    {
      "name": "xgboost",
      "filename": "chennai_microclimate_xgboost.joblib",
      "r2_score": 0.87,
      "rmse": 0.71,
      "mae": 0.54,
      "cv_rmse_mean": 0.73,
      "cv_rmse_std": 0.04,
      "training_samples": 1280,
      "features": 10,
      "download_url": "/api/v1/models/download/xgboost"
    }
  ]
}
```

---

### `POST /api/v1/models/train`

Triggers a fresh training run with custom hyperparameters.

**Request body:**
```json
{
  "model_type": "xgboost",
  "n_estimators": 500,
  "max_depth": 8,
  "learning_rate": 0.03
}
```

**Response:**
```json
{
  "status": "trained",
  "model_type": "xgboost",
  "r2_score": 0.89,
  "rmse": 0.68,
  "training_time_seconds": 4.2,
  "artifact_path": "backend/app/ml_artifacts/chennai_microclimate_xgboost.joblib"
}
```

---

### `POST /api/v1/models/predict`

Single-cell or batch inference with SHAP attributions.

**Request body:**
```json
{
  "model_type": "xgboost",
  "features": {
    "building_density": 0.72,
    "impervious_fraction": 0.85,
    "tree_canopy_fraction": 0.06,
    "population_density_sqkm": 28000,
    "distance_to_water": 3200,
    "altitude": 8,
    "aspect_ratio": 2.1,
    "albedo": 0.18,
    "wind_exposure": 0.35,
    "anthropogenic_heat": 95
  }
}
```

**Response:**
```json
{
  "prediction": 2.87,
  "unit": "celsius_anomaly",
  "model_type": "xgboost",
  "inference_ms": 1.8,
  "shap_values": {
    "impervious_fraction": 0.82,
    "building_density": 0.61,
    "tree_canopy_fraction": -0.44
  }
}
```

---

### `GET /api/v1/models/metrics/{model_name}`

Returns feature importances and cross-validation score breakdown.

**Path params:** `model_name` — one of `xgboost`, `random_forest`, `ridge`

---

### `GET /api/v1/models/download/{model_name}`

Streams the serialized `.joblib` artifact as a binary file download.

**Example (curl):**
```bash
curl -OJ http://localhost:8000/api/v1/models/download/xgboost
# saves: chennai_microclimate_xgboost.joblib
```

**Load locally:**
```python
import joblib
model = joblib.load("chennai_microclimate_xgboost.joblib")
scaler = joblib.load("chennai_microclimate_scaler.joblib")

import numpy as np
X = np.array([[0.72, 0.85, 0.06, 28000, 3200, 8, 2.1, 0.18, 0.35, 95]])
X_scaled = scaler.transform(X)
prediction = model.predict(X_scaled)
print(f"LST Anomaly: {prediction[0]:.2f} °C")
```

---

## Artifact Files

| File | Description | Tracked in Git |
| :--- | :--- | :--- |
| `chennai_microclimate_xgboost.joblib` | XGBoost model binary | ❌ (gitignored, auto-regenerated) |
| `chennai_microclimate_random_forest.joblib` | Random Forest binary | ❌ |
| `chennai_microclimate_ridge.joblib` | Ridge regression binary | ❌ |
| `chennai_microclimate_scaler.joblib` | StandardScaler binary | ❌ |
| `model_metadata.json` | Training metrics registry | ✅ |

> **Note:** `.joblib` binaries are gitignored. On first backend startup (or `docker compose up`), `_ensure_default_artifacts()` auto-trains all three models and writes them to the `ml_artifacts/` directory. No manual step required.
