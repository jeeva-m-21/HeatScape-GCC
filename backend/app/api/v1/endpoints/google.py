"""
API Endpoints for Google Cloud Platform Services (Air Quality, Elevation, Geocoding).
"""

from fastapi import APIRouter, Query
from typing import Optional, Dict, Any

from app.services.google_service import GoogleService

router = APIRouter()


@router.get("/air-quality", summary="Live Google Air Quality API for Chennai")
def get_air_quality(
    lat: float = Query(13.0827, description="Latitude in decimal degrees"),
    lon: float = Query(80.2707, description="Longitude in decimal degrees"),
):
    """
    Returns live microclimate air quality indexes, PM2.5, PM10 and health advisories
    via Google Air Quality API.
    """
    return GoogleService.get_air_quality(latitude=lat, longitude=lon)


@router.get("/elevation", summary="Live Google Elevation API for Chennai")
def get_elevation(
    lat: float = Query(13.0827, description="Latitude in decimal degrees"),
    lon: float = Query(80.2707, description="Longitude in decimal degrees"),
):
    """
    Returns high-accuracy terrain elevation above mean sea level via Google Elevation API.
    """
    return GoogleService.get_elevation(latitude=lat, longitude=lon)


@router.get("/geocode", summary="Live Google Geocoding API for Chennai localities")
def geocode_locality(
    address: str = Query("T. Nagar", description="Locality, ward or landmark name"),
):
    """
    Resolves a Chennai ward or landmark to metric coordinates using Google Geocoding API.
    """
    return GoogleService.geocode(address=address)
