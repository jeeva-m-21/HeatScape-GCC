"""
Unit and Integration Tests for Machine Learning Models Service & Artifact Downloader.
Validates XGBoost, Random Forest, L2 Ridge, Evaluation Metrics, and Binary Serialization.
"""

import io
import joblib
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.model_service import model_service, FEATURE_NAMES

client = TestClient(app)


def test_generate_training_dataset():
    """Verify Chennai training dataset generation adheres to physical constraints."""
    df = model_service.generate_chennai_training_dataset(n_samples=200)
    assert len(df) == 200
    for feat in FEATURE_NAMES:
        assert feat in df.columns
        assert not df[feat].isnull().any()
    assert "contextual_anomaly_celsius" in df.columns
    assert "lst_celsius" in df.columns
    assert df["tree_canopy_fraction"].min() >= 0.0
    assert df["impervious_fraction"].max() <= 1.0


def test_train_xgboost_model():
    """Verify XGBoost training achieves strong validation performance and serializes to disk."""
    entry = model_service.train_model(
        model_type="xgboost",
        n_estimators=60,
        max_depth=4,
        learning_rate=0.1,
    )
    assert entry["model_type"] == "xgboost"
    assert entry["metrics"]["train_r2"] > 0.70
    assert entry["metrics"]["test_r2"] > 0.65
    assert entry["metrics"]["test_rmse_celsius"] < 1.2
    assert len(entry["feature_importances"]) == len(FEATURE_NAMES)
    assert entry["file_size_kb"] > 10.0

    filepath = model_service.get_model_file_path("xgboost")
    assert filepath is not None
    assert filepath.exists()


def test_train_random_forest_model():
    """Verify Random Forest training and feature importances extraction."""
    entry = model_service.train_model(
        model_type="random_forest",
        n_estimators=40,
        max_depth=4,
    )
    assert entry["model_type"] == "random_forest"
    assert entry["metrics"]["test_r2"] > 0.60
    top_feature = entry["feature_importances"][0]
    assert "feature" in top_feature
    assert "importance" in top_feature


def test_train_ridge_model():
    """Verify Ridge linear baseline training."""
    entry = model_service.train_model(model_type="ridge")
    assert entry["model_type"] == "ridge"
    assert "test_r2" in entry["metrics"]


def test_predict_xgboost():
    """Verify low-latency inference and local TreeSHAP attribution outputs."""
    sample_features = {
        "tree_canopy_fraction": 0.02,
        "impervious_fraction": 0.94,
        "building_density": 0.85,
        "distance_to_coast_km": 8.0,
    }
    result = model_service.predict(sample_features, model_type="xgboost")
    assert "predicted_anomaly_celsius" in result
    assert "predicted_lst_celsius" in result
    assert result["inference_latency_ms"] < 100.0  # sub-100ms
    assert len(result["attributions"]) == len(FEATURE_NAMES)
    # Dense impervious and low canopy should yield positive thermal anomaly
    assert result["predicted_anomaly_celsius"] > 0.0


def test_catalog_and_metadata():
    """Verify model catalog returns available models and download URLs."""
    catalog = model_service.get_catalog()
    assert catalog["total_models"] >= 3
    types = [m["model_type"] for m in catalog["available_models"]]
    assert "xgboost" in types
    assert "random_forest" in types
    assert "ridge" in types
    for m in catalog["available_models"]:
        assert m["download_url"].startswith("/api/v1/models/download/")


def test_api_get_catalog():
    """Test GET /api/v1/models/catalog HTTP endpoint."""
    response = client.get("/api/v1/models/catalog")
    assert response.status_code == 200
    data = response.json()
    assert "available_models" in data
    assert len(data["available_models"]) >= 3


def test_api_predict():
    """Test POST /api/v1/models/predict HTTP endpoint."""
    payload = {
        "model_type": "xgboost",
        "features": {
            "tree_canopy_fraction": 0.08,
            "impervious_fraction": 0.78,
            "building_density": 0.60,
        }
    }
    response = client.post("/api/v1/models/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "xgboost"
    assert "predicted_anomaly_celsius" in data
    assert "inference_latency_ms" in data


def test_api_metrics():
    """Test GET /api/v1/models/metrics/{model_name} endpoint and error handling."""
    response = client.get("/api/v1/models/metrics/xgboost")
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "xgboost"
    assert "metrics" in data
    assert "feature_importances" in data

    # 404 on unknown model
    bad_resp = client.get("/api/v1/models/metrics/quantum_neural_net")
    assert bad_resp.status_code == 404


def test_api_download_joblib():
    """Test GET /api/v1/models/download/{model_name} binary stream and deserialization integrity."""
    response = client.get("/api/v1/models/download/xgboost")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/octet-stream"
    assert "attachment" in response.headers["Content-Disposition"]
    assert "chennai_microclimate_xgboost.joblib" in response.headers["Content-Disposition"]

    # Verify that downloaded bytes can be directly loaded with joblib in Python
    content = response.content
    assert len(content) > 1000
    buffer = io.BytesIO(content)
    loaded_model = joblib.load(buffer)
    assert hasattr(loaded_model, "predict")


def test_api_train_custom_hyperparameters():
    """Test POST /api/v1/models/train endpoint with custom hyperparameters."""
    payload = {
        "model_type": "xgboost",
        "n_estimators": 50,
        "max_depth": 3,
        "learning_rate": 0.12,
    }
    response = client.post("/api/v1/models/train", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["model"]["hyperparameters"]["n_estimators"] == 50
    assert data["model"]["hyperparameters"]["max_depth"] == 3
