"""FastAPI Router for Citizen Shaded Cool Pedestrian Routing & Thermal Refuges."""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from app.services.routing_service import CoolRoutingService

router = APIRouter()


class RoutingRequest(BaseModel):
    origin_lat: float = Field(default=13.0365, description="Origin latitude (WGS84)")
    origin_lon: float = Field(default=80.2285, description="Origin longitude (WGS84)")
    dest_lat: float = Field(default=13.0440, description="Destination latitude (WGS84)")
    dest_lon: float = Field(default=80.2355, description="Destination longitude (WGS84)")
    prioritize_shade: Optional[bool] = Field(default=True, description="Maximize tree canopy cover")


@router.post("/cool-path", response_model=Dict[str, Any])
def compute_cool_pedestrian_path(req: RoutingRequest) -> Dict[str, Any]:
    """Computes dual routes comparing direct walking route vs. shaded cool pedestrian route.
    Penalizes surface temperature anomalies (LST) and rewards tree canopy and hydration POIs.
    """
    return CoolRoutingService.find_routes(
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        dest_lat=req.dest_lat,
        dest_lon=req.dest_lon,
    )


@router.get("/refuges", response_model=Dict[str, Any])
def get_public_thermal_refuges() -> Dict[str, Any]:
    """Retrieves all public cooling refuges, misting parks, and drinking water kiosks in Chennai."""
    return CoolRoutingService.get_public_refuges()


@router.get("/sample-corridors", response_model=Dict[str, Any])
def get_sample_corridors() -> Dict[str, Any]:
    """Returns curated popular pedestrian corridors in Chennai for rapid testing and demonstrations."""
    return {
        "corridors": [
            {
                "id": "CORR-01",
                "title": "T. Nagar Bus Terminus to Panagal Park",
                "origin": {"lat": 13.0360, "lon": 80.2285, "name": "T. Nagar Bus Stand"},
                "destination": {"lat": 13.0405, "lon": 80.2305, "name": "Panagal Park North Gate"},
                "description": "Demonstrates avoiding Usman Road unshaded asphalt by routing through tree-lined residential avenues.",
            },
            {
                "id": "CORR-02",
                "title": "CIT Nagar South to Pondy Bazaar Pedestrian Plaza",
                "origin": {"lat": 13.0360, "lon": 80.2285, "name": "CIT Nagar 1st Main Rd"},
                "destination": {"lat": 13.0440, "lon": 80.2350, "name": "Pondy Bazaar Pedestrian Plaza"},
                "description": "Shows route optimization passing through Natesan Park misting pavilion with 65% canopy coverage.",
            },
            {
                "id": "CORR-03",
                "title": "DMS Metro Station to Eldams Road Community Shelter",
                "origin": {"lat": 13.0440, "lon": 80.2360, "name": "DMS Metro Station Entry"},
                "destination": {"lat": 13.0425, "lon": 80.2320, "name": "Eldams Road Public Shelter"},
                "description": "Routes transit commuters through shaded side-lanes minimizing direct solar UV exposure.",
            },
        ]
    }
