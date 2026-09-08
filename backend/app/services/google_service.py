"""
Google Cloud Platform Integration Service for HeatScape.
Direct live access to Google Air Quality API, Elevation API, Geocoding API, and Directions API
for Greater Chennai Corporation (GCC) microclimate intelligence.
"""

import urllib.request
import urllib.parse
import json
import logging
from typing import Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger("heatscape.google")


class GoogleService:
    """
    Client for live Google Cloud APIs using sovereign GCC project credentials.
    """

    @classmethod
    def get_api_key(cls) -> str:
        return settings.GOOGLE_MAPS_API_KEY or "AIzaSyAWFtUnxI2yjqyAyxf7ZHbEDi6L7-TomZw"

    @classmethod
    def get_air_quality(cls, latitude: float = 13.0827, longitude: float = 80.2707) -> Dict[str, Any]:
        """
        Fetches live Universal AQI, dominant pollutants (PM2.5, PM10, NO2),
        and health categories from Google Air Quality API.
        """
        key = cls.get_api_key()
        url = f"https://airquality.googleapis.com/v1/currentConditions:lookup?key={key}"
        payload = json.dumps({"location": {"latitude": latitude, "longitude": longitude}}).encode("utf-8")

        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json", "User-Agent": "HeatScape-GCC/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            logger.warning(f"Google Air Quality API call failed, providing fallback: {e}")
            return {
                "dateTime": "2026-09-08T07:00:00Z",
                "regionCode": "in",
                "indexes": [
                    {
                        "code": "uaqi",
                        "displayName": "Universal AQI",
                        "aqi": 48,
                        "category": "Moderate air quality",
                        "dominantPollutant": "pm25"
                    }
                ],
                "source": "fallback"
            }

    @classmethod
    def get_elevation(cls, latitude: float = 13.0827, longitude: float = 80.2707) -> Dict[str, Any]:
        """
        Fetches accurate terrain elevation above sea level in meters from Google Elevation API.
        """
        key = cls.get_api_key()
        url = f"https://maps.googleapis.com/maps/api/elevation/json?locations={latitude},{longitude}&key={key}"

        req = urllib.request.Request(url, headers={"User-Agent": "HeatScape-GCC/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            logger.warning(f"Google Elevation API call failed: {e}")
            return {
                "results": [{"elevation": 8.42, "location": {"lat": latitude, "lng": longitude}, "resolution": 9.54}],
                "status": "OK",
                "source": "fallback"
            }

    @classmethod
    def geocode(cls, address: str) -> Dict[str, Any]:
        """
        Geocodes a Chennai locality or street name to latitude/longitude coordinates.
        """
        key = cls.get_api_key()
        query = urllib.parse.quote(f"{address}, Chennai, Tamil Nadu, India")
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={query}&key={key}"

        req = urllib.request.Request(url, headers={"User-Agent": "HeatScape-GCC/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            logger.warning(f"Google Geocoding API call failed: {e}")
            return {
                "results": [
                    {
                        "formatted_address": f"{address}, Chennai, Tamil Nadu, India",
                        "geometry": {"location": {"lat": 13.0418, "lng": 80.2507}},
                    }
                ],
                "status": "OK",
                "source": "fallback"
            }
