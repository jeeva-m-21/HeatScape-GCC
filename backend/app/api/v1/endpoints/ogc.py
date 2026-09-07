"""FastAPI Router for OGC API - Features & Universal Open Dataset Ingestion."""

from fastapi import APIRouter, Query, Body
from typing import Dict, Any, Optional, List
from app.services.dataset_normalizer import DatasetNormalizerService
from app.services.heatwave_service import HeatwaveService

router = APIRouter()


@router.get("", response_model=Dict[str, Any])
def ogc_landing_page() -> Dict[str, Any]:
    """OGC API - Features Landing Page advertising endpoints and capability metadata."""
    return {
        "title": "HeatScape OGC API - Features & STAC Gateway",
        "description": "Open Geospatial Consortium (OGC) compliant spatial data API for Greater Chennai Corporation.",
        "links": [
            {"href": "/api/v1/ogc", "rel": "self", "type": "application/json", "title": "Landing Page"},
            {"href": "/api/v1/ogc/conformance", "rel": "conformance", "type": "application/json", "title": "Conformance declaration"},
            {"href": "/api/v1/ogc/collections", "rel": "data", "type": "application/json", "title": "Collections metadata"},
        ],
    }


@router.get("/conformance", response_model=Dict[str, Any])
def ogc_conformance() -> Dict[str, Any]:
    """OGC Requirements and Conformance Classes."""
    return {
        "conformsTo": [
            "http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core",
            "http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/oas30",
            "http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/geojson",
            "https://stacspec.org/spec/item-spec/v1.0.0",
        ]
    }


@router.get("/collections", response_model=Dict[str, Any])
def ogc_collections() -> Dict[str, Any]:
    """Catalog of available spatial collections in Chennai."""
    return {
        "collections": [
            {
                "id": "heat-cells-100m",
                "title": "Chennai 100m x 100m Analytical Heat Cells",
                "description": "Multi-year spatiotemporal thermal trajectories and surface temperature anomalies.",
                "extent": {
                    "spatial": {"bbox": [[80.00, 12.85, 80.35, 13.35]]},
                    "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                },
                "itemType": "feature",
            },
            {
                "id": "corridor-sensors",
                "title": "Chennai IoT Microclimate Sensor Mesh (842 Nodes)",
                "description": "Real-time LoRaWAN IN865 environmental telemetric sensors along major transit corridors.",
                "extent": {
                    "spatial": {"bbox": [[80.20, 13.00, 80.28, 13.08]]},
                    "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                },
                "itemType": "feature",
            },
            {
                "id": "cooling-shelters",
                "title": "GCC Emergency Air-Conditioned Cooling Shelters",
                "description": "Municipal community welfare centers designated as extreme heat refuges under GRAP.",
                "extent": {
                    "spatial": {"bbox": [[80.20, 13.00, 80.28, 13.08]]},
                    "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
                },
                "itemType": "feature",
            },
        ]
    }


@router.get("/collections/{collection_id}/items", response_model=Dict[str, Any])
def get_collection_items(
    collection_id: str,
    bbox: Optional[str] = Query(None, description="Bounding box filter: minLon,minLat,maxLon,maxLat"),
    limit: int = Query(default=50, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
) -> Dict[str, Any]:
    """OGC API - Features collection items endpoint returning GeoJSON FeatureCollection."""
    features: List[Dict[str, Any]] = []

    if collection_id == "cooling-shelters":
        manifest = HeatwaveService.generate_dispatch_manifest()
        for idx, s in enumerate(manifest["emergency_cooling_shelters"]):
            # Coordinates around Teynampet / T. Nagar
            lat = 13.040 + idx * 0.003
            lon = 80.235 + idx * 0.004
            features.append({
                "type": "Feature",
                "id": s["facility_id"],
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {
                    "name": s["name"],
                    "address": s["address"],
                    "capacity_persons": s["capacity_persons"],
                    "current_occupancy": s["current_occupancy"],
                    "facilities": s["facilities"],
                },
            })
    else:
        # Default mock 100m sample cells
        for i in range(min(limit, 25)):
            lat = 13.035 + (i % 5) * 0.001
            lon = 80.230 + (i // 5) * 0.001
            features.append({
                "type": "Feature",
                "id": f"CHE_OGC_{i+1:04d}",
                "geometry": {"type": "Point", "coordinates": [round(lon, 5), round(lat, 5)]},
                "properties": {
                    "surface_temp_celsius": round(38.5 + (i % 7) * 0.8, 1),
                    "relative_humidity_pct": 66.0,
                    "ndvi": 0.18,
                    "ward": "Ward 114 (Teynampet)",
                },
            })

    return {
        "type": "FeatureCollection",
        "features": features,
        "numberMatched": len(features),
        "numberReturned": len(features),
        "links": [
            {"href": f"/api/v1/ogc/collections/{collection_id}/items", "rel": "self", "type": "application/geo+json"},
        ],
    }


@router.post("/normalize", response_model=Dict[str, Any])
def normalize_external_dataset(payload: Any = Body(...)) -> Dict[str, Any]:
    """Ingests an arbitrary open dataset (GeoJSON, STAC, or tabular records),
    auto-resolves column aliases, normalizes units (Kelvin -> Celsius, fractions),
    validates Chennai geographic bounds, and returns standardized HeatScape features.
    """
    return DatasetNormalizerService.normalize_dataset(payload)
