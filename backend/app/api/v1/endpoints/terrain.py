"""
API Endpoints for 3D Terrain, Elevation Profiling, Sea Breeze Dynamics & Street Canyon Microclimate.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.terrain_service import TerrainService

router = APIRouter()


class CustomTransectRequest(BaseModel):
    start_lat: float = Field(..., ge=12.5, le=13.5, description="Starting latitude")
    start_lon: float = Field(..., ge=79.8, le=80.5, description="Starting longitude")
    end_lat: float = Field(..., ge=12.5, le=13.5, description="Ending latitude")
    end_lon: float = Field(..., ge=79.8, le=80.5, description="Ending longitude")
    steps: int = Field(40, ge=10, le=100, description="Number of sampling intervals along transect")


class StreetCanyonRequest(BaseModel):
    building_height_m: float = Field(..., ge=2.0, le=150.0, description="Average building facade height in meters")
    street_width_m: float = Field(..., ge=3.0, le=80.0, description="Street curb-to-curb width in meters")
    canyon_orientation_deg: float = Field(0.0, ge=0.0, le=180.0, description="Street orientation in degrees (0=N-S, 90=E-W)")
    ambient_wind_speed_ms: float = Field(3.0, ge=0.1, le=25.0, description="Synoptic / mesoscale wind speed in m/s")
    ambient_wind_dir_deg: float = Field(90.0, ge=0.0, le=360.0, description="Ambient wind direction in degrees (90=Easterly sea breeze)")


@router.get("/elevation")
def get_elevation_point(
    lat: float = Query(..., ge=12.5, le=13.5, description="Latitude"),
    lon: float = Query(..., ge=79.8, le=80.5, description="Longitude"),
):
    """
    Returns topographical elevation above MSL for a given coordinate in Chennai.
    """
    elevation = TerrainService.get_elevation_at_point(lat, lon)
    return {
        "lat": lat,
        "lon": lon,
        "elevation_m": elevation,
        "vertical_datum": "EGM96",
        "provider": "GCC Calibrated SRTM / GCP 3D Terrain Model",
    }


@router.get("/transects")
def list_transects():
    """
    Lists pre-configured high-impact urban transects across Greater Chennai Corporation.
    """
    return {
        "transects": [
            {"id": k, **v} for k, v in TerrainService.TRANSECTS.items()
        ]
    }


@router.get("/transects/{transect_id}")
def get_transect_profile(
    transect_id: str,
    steps: int = Query(40, ge=10, le=100, description="Sampling steps"),
):
    """
    Returns cross-sectional elevation, slope, and sea breeze penetration profile along an urban transect.
    """
    if transect_id not in TerrainService.TRANSECTS:
        raise HTTPException(
            status_code=404,
            detail=f"Transect '{transect_id}' not found. Available: {list(TerrainService.TRANSECTS.keys())}",
        )
    return TerrainService.get_transect_profile(transect_id=transect_id, steps=steps)


@router.post("/transect/custom")
def get_custom_transect_profile(req: CustomTransectRequest):
    """
    Computes elevation and sea breeze penetration cross-section between any two points in GCC.
    """
    return TerrainService.get_transect_profile(
        transect_id="custom",
        custom_start=(req.start_lat, req.start_lon),
        custom_end=(req.end_lat, req.end_lon),
        steps=req.steps,
    )


@router.get("/sea-breeze")
def calculate_sea_breeze(
    lat: float = Query(13.0400, ge=12.5, le=13.5),
    lon: float = Query(80.2330, ge=79.8, le=80.5),
    coastal_wind_speed_ms: float = Query(3.8, ge=0.5, le=20.0),
    inland_air_temp_c: float = Query(39.5, ge=20.0, le=55.0),
    sea_surface_temp_c: float = Query(29.5, ge=20.0, le=40.0),
    hour_of_day: int = Query(14, ge=0, le=23),
):
    """
    Evaluates Bay of Bengal sea breeze marine layer intrusion, cooling delta, and arrival time.
    """
    return TerrainService.calculate_sea_breeze_penetration(
        lat=lat,
        lon=lon,
        coastal_wind_speed_ms=coastal_wind_speed_ms,
        inland_air_temp_c=inland_air_temp_c,
        sea_surface_temp_c=sea_surface_temp_c,
        hour_of_day=hour_of_day,
    )


@router.post("/street-canyon/analyze")
def analyze_street_canyon(req: StreetCanyonRequest):
    """
    Analyzes street canyon aspect ratio (H/W), sky view factor (SVF), wind attenuation,
    and thermal entrapment index.
    """
    return TerrainService.analyze_street_canyon(
        building_height_m=req.building_height_m,
        street_width_m=req.street_width_m,
        canyon_orientation_deg=req.canyon_orientation_deg,
        ambient_wind_speed_ms=req.ambient_wind_speed_ms,
        ambient_wind_dir_deg=req.ambient_wind_dir_deg,
    )


@router.get("/mesh-3d")
def get_3d_terrain_mesh(
    rows: int = Query(15, ge=5, le=30),
    cols: int = Query(15, ge=5, le=30),
    min_lat: Optional[float] = Query(None, ge=12.5, le=13.5),
    max_lat: Optional[float] = Query(None, ge=12.5, le=13.5),
    min_lon: Optional[float] = Query(None, ge=79.8, le=80.5),
    max_lon: Optional[float] = Query(None, ge=79.8, le=80.5),
):
    """
    Returns a 3D elevation and microclimate point mesh for Greater Chennai Corporation.
    """
    bbox = None
    if all(v is not None for v in [min_lat, max_lat, min_lon, max_lon]):
        bbox = {
            "min_lat": min_lat,
            "max_lat": max_lat,
            "min_lon": min_lon,
            "max_lon": max_lon,
        }
    return TerrainService.generate_3d_terrain_grid(grid_rows=rows, grid_cols=cols, bbox=bbox)
