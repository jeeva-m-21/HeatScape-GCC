from typing import List, Tuple, Dict, Any
from pyproj import Transformer
from shapely.geometry import box, Polygon, mapping
from app.core.config import settings

# Transformer definitions
# EPSG:4326 (WGS84) <-> EPSG:32644 (UTM Zone 44N)
transformer_to_utm = Transformer.from_crs("EPSG:4326", settings.CHENNAI_CRS, always_xy=True)
transformer_to_wgs84 = Transformer.from_crs(settings.CHENNAI_CRS, "EPSG:4326", always_xy=True)


class GridService:
    """
    Handles analytical grid partitioning, CRS transformations, and polygon mesh calculations.
    """

    @staticmethod
    def wgs84_to_utm(lon: float, lat: float) -> Tuple[float, float]:
        """Convert WGS84 (lon, lat) to UTM 44N (easting, northing) in meters."""
        return transformer_to_utm.transform(lon, lat)

    @staticmethod
    def utm_to_wgs84(easting: float, northing: float) -> Tuple[float, float]:
        """Convert UTM 44N (easting, northing) to WGS84 (lon, lat) in degrees."""
        return transformer_to_wgs84.transform(easting, northing)

    @staticmethod
    def create_100m_cell_polygon(min_easting: float, min_northing: float) -> Polygon:
        """
        Creates a uniform 100m x 100m projected polygon (10,000 sqm).
        """
        return box(min_easting, min_northing, min_easting + 100.0, min_northing + 100.0)

    @classmethod
    def polygon_utm_to_wgs84(cls, poly_utm: Polygon) -> Polygon:
        """
        Project UTM 44N polygon into WGS84 polygon.
        """
        coords_wgs84 = [
            cls.utm_to_wgs84(x, y) for x, y in poly_utm.exterior.coords
        ]
        return Polygon(coords_wgs84)
