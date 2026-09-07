"""
API Endpoints for UAV / Drone High-Resolution Thermal Orthomosaic Ingestion.
"""

from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.drone_service import drone_service, calibrate_radiometric_thermal

router = APIRouter()


class GCPUploadUrlRequest(BaseModel):
    filename: str = Field(..., json_schema_extra={"example": "chennai_uav_tnagar_20260515.tif"})
    content_type: str = Field(default="image/tiff", json_schema_extra={"example": "image/tiff"})
    bucket_name: str = Field(default="chennai-heatscape-drone-tiles", json_schema_extra={"example": "chennai-heatscape-drone-tiles"})
    expires_in_seconds: int = Field(default=3600, ge=60, le=86400)


class DroneIngestRequest(BaseModel):
    mission_id: str = Field(..., json_schema_extra={"example": "UAV-GCC-2026-004"})
    pilot_callsign: str = Field(..., json_schema_extra={"example": "GARUDA-DELTA-4"})
    target_zone: str = Field(..., json_schema_extra={"example": "Zone 10 (Kodambakkam)"})
    bbox: List[float] = Field(..., min_length=4, max_length=4, json_schema_extra={"example": [80.2100, 13.0450, 80.2250, 13.0550]})
    gcp_storage_uri: str = Field(..., json_schema_extra={"example": "gs://chennai-heatscape-drone-tiles/uploads/2026/05/16/kodambakkam.tif"})
    raw_dn_samples: Optional[List[float]] = Field(default=None, json_schema_extra={"example": [7900, 8100, 8250, 8400]})
    mean_emissivity: float = Field(default=0.95, ge=0.5, le=1.0)


class RadiometricCalibrateRequest(BaseModel):
    digital_number: float = Field(..., ge=0, json_schema_extra={"example": 8150.0})
    emissivity: float = Field(default=0.96, ge=0.5, le=1.0, json_schema_extra={"example": 0.96})
    calibration_scale: float = Field(default=0.04, json_schema_extra={"example": 0.04})


@router.get("/missions", summary="List UAV Thermal Flight Missions")
def get_drone_missions(zone: Optional[str] = Query(None, description="Filter by GCC Zone")):
    """Returns list of active and completed high-resolution drone thermal survey missions."""
    return {"missions": drone_service.list_missions(zone=zone)}


@router.post("/upload-url", summary="Generate GCP Cloud Storage Signed Upload URL")
def generate_upload_url(payload: GCPUploadUrlRequest):
    """
    Generates a sovereign Google Cloud Storage V4 signed PUT URL
    for direct multipart upload of multi-gigabyte radiometric GeoTIFFs.
    """
    return drone_service.generate_gcp_signed_upload_url(
        filename=payload.filename,
        content_type=payload.content_type,
        bucket_name=payload.bucket_name,
        expires_in_seconds=payload.expires_in_seconds,
    )


@router.post("/ingest-ortho", summary="Ingest and Calibrate Drone Thermal Orthomosaic")
def ingest_drone_orthomosaic(payload: DroneIngestRequest):
    """
    Ingests metadata for a completed UAV thermal mission, runs radiometric calibration,
    and extracts sub-meter rooftop hotspots and cooling recommendations.
    """
    result = drone_service.ingest_orthomosaic_metadata(
        mission_id=payload.mission_id,
        pilot_callsign=payload.pilot_callsign,
        target_zone=payload.target_zone,
        bbox=payload.bbox,
        gcp_storage_uri=payload.gcp_storage_uri,
        raw_dn_samples=payload.raw_dn_samples,
        mean_emissivity=payload.mean_emissivity,
    )
    return result


@router.post("/calibrate-pixel", summary="Calibrate a Single Radiometric Digital Number")
def calibrate_pixel(payload: RadiometricCalibrateRequest):
    """Calculates Land Surface Temperature in Celsius from raw UAV sensor Digital Number."""
    celsius = calibrate_radiometric_thermal(
        digital_number=payload.digital_number,
        emissivity=payload.emissivity,
        calibration_scale=payload.calibration_scale,
    )
    return {
        "digital_number": payload.digital_number,
        "emissivity": payload.emissivity,
        "calibrated_celsius": celsius,
        "is_extreme_heat": celsius >= 45.0,
    }
