"""FastAPI Router for Earth Observation Satellite Data Ingestion and Sensor Ground-Truthing."""

from fastapi import APIRouter
from typing import Dict, Any
from app.services.ingest_service import SatelliteIngestService

router = APIRouter()


@router.get("/satellite-status", response_model=Dict[str, Any])
def get_satellite_status() -> Dict[str, Any]:
    """Retrieves current operational status of Earth Observation satellite constellations (Landsat-9, Sentinel-2)
    monitoring the Chennai Metropolitan Region.
    """
    return SatelliteIngestService.get_satellite_status()


@router.post("/trigger-overpass", response_model=Dict[str, Any])
def trigger_simulated_overpass() -> Dict[str, Any]:
    """Simulates an automated satellite acquisition overpass, updating the 100m² analytical grid
    with fresh thermal infrared (LST) and multi-spectral (NDVI) observations.
    """
    return SatelliteIngestService.trigger_simulated_overpass()


@router.get("/sensors-vs-satellite", response_model=Dict[str, Any])
def get_sensors_vs_satellite_correlation() -> Dict[str, Any]:
    """Cross-validates satellite-derived Land Surface Temperature (LST) against ground-level
    IoT microclimate sensors across Chennai's 8 primary transit corridors.
    """
    return SatelliteIngestService.get_sensors_vs_satellite_correlation()
