from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime


class SpatialCellBase(BaseModel):
    id: str
    centroid_lat: float
    centroid_lon: float
    ward_id: Optional[str] = None
    zone_id: Optional[str] = None
    building_density: float = 0.0
    road_density: float = 0.0
    impervious_fraction: float = 0.0
    tree_canopy_fraction: float = 0.0
    roof_area_sqm: float = 0.0
    water_distance_m: Optional[float] = None
    elevation_m: float = 0.0
    population: int = 0
    population_density_sqkm: float = 0.0
    sensitive_site_count: int = 0


class SpatialCellResponse(SpatialCellBase):
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]


class CellFeatureProperties(BaseModel):
    cell_id: str
    ward_id: Optional[str] = None
    zone_id: Optional[str] = None
    population: int
    population_density_sqkm: float
    building_density: float
    impervious_fraction: float
    tree_canopy_fraction: float
    state: str
    mean_anomaly: float
    trend_slope: float
    recurrence: float
    confidence: float
    regime_shift: float


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: str
    geometry: Dict[str, Any]
    properties: CellFeatureProperties


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
