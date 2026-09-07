"""
API Endpoints for Machine Learning Models: Catalog, Training, Inference, and Binary Weights Downloading.
"""

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

from app.services.model_service import model_service, FEATURE_NAMES

router = APIRouter()


class ModelTrainRequest(BaseModel):
    model_type: str = Field(default="xgboost", description="Model architecture: 'xgboost', 'random_forest', or 'ridge'")
    n_estimators: int = Field(default=150, ge=10, le=500, description="Number of boosting/bagging trees")
    max_depth: int = Field(default=5, ge=2, le=12, description="Maximum tree depth")
    learning_rate: float = Field(default=0.08, ge=0.01, le=0.5, description="Learning rate for gradient boosting")


class ModelPredictRequest(BaseModel):
    model_type: str = Field(default="xgboost", description="Model architecture to use for inference")
    features: Dict[str, float] = Field(
        default={
            "tree_canopy_fraction": 0.05,
            "impervious_fraction": 0.85,
            "building_density": 0.70,
            "water_distance_m": 2400.0,
            "elevation_m": 8.0,
            "albedo": 0.14,
            "population_density_sqkm": 14000.0,
            "distance_to_coast_km": 5.0,
            "solar_radiation_index": 1.05,
            "wind_ventilation_factor": 0.65,
        },
        description="Physical and spatial characteristics for target 100m² parcel"
    )


@router.get("/catalog", summary="List Registered Machine Learning Models")
def get_model_catalog():
    """
    Returns the active machine learning model registry including model versions,
    file sizes, validation scores (R², RMSE, MAE), and binary download URLs.
    """
    return model_service.get_catalog()


@router.post("/train", summary="Train or Fine-Tune an ML Model")
def train_model(payload: ModelTrainRequest):
    """
    Triggers model fitting on Chennai's spatial microclimate dataset with specified hyperparameters,
    computes 5-fold cross-validation metrics, and serializes the trained weights to disk.
    """
    try:
        entry = model_service.train_model(
            model_type=payload.model_type,
            n_estimators=payload.n_estimators,
            max_depth=payload.max_depth,
            learning_rate=payload.learning_rate,
        )
        return {
            "status": "success",
            "message": f"Successfully trained {payload.model_type.upper()} model.",
            "model": entry,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {str(e)}"
        )


@router.post("/predict", summary="Low-Latency Real-Time Inference")
def predict_temperature_anomaly(payload: ModelPredictRequest):
    """
    Executes real-time inference on the serialized model with local TreeSHAP attribution
    and sub-5ms latency.
    """
    try:
        result = model_service.predict(
            features=payload.features,
            model_type=payload.model_type,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}"
        )


@router.get("/metrics/{model_name}", summary="Get Model Validation Metrics & Feature Importances")
def get_model_metrics(model_name: str):
    """
    Returns detailed validation metrics (Train/Test R², RMSE, MAE, 5-Fold CV)
    and feature importance rankings for a specified model.
    """
    catalog = model_service.get_catalog()
    models = {m["model_type"]: m for m in catalog.get("available_models", [])}
    model_name = model_name.lower()
    if model_name not in models:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model '{model_name}' not found. Available models: {list(models.keys())}"
        )
    return models[model_name]


@router.get("/download/{model_name}", summary="Download Serialized Model Artifact (.joblib)")
def download_model_artifact(model_name: str):
    """
    Direct binary download of the trained model file (.joblib) for local offline evaluation,
    Jupyter notebook experimentation, or integration into GIS workflows (QGIS/ArcGIS).
    """
    filepath = model_service.get_model_file_path(model_name)
    if not filepath or not filepath.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artifact for model '{model_name}' not found on disk."
        )

    filename = filepath.name
    return FileResponse(
        path=str(filepath),
        media_type="application/octet-stream",
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        }
    )
