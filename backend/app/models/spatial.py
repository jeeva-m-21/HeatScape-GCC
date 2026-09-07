from sqlalchemy import Column, String, Float, Integer, DateTime, func
from geoalchemy2 import Geometry
from app.core.database import Base


class SpatialCell(Base):
    __tablename__ = "spatial_cells"

    # Format: CHE_XXX_YYY
    id = Column(String(32), primary_key=True, index=True)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    ward_id = Column(String(16), index=True)
    zone_id = Column(String(16), index=True)

    # Geometry columns: 32644 (UTM 44N Metric) & 4326 (WGS84) with GIST indices
    geom = Column(Geometry(geometry_type="POLYGON", srid=32644, spatial_index=True), nullable=False)
    geom_4326 = Column(Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True), nullable=False)

    # Built environment physical parameters
    building_density = Column(Float, default=0.0)  # Coverage ratio [0, 1]
    road_density = Column(Float, default=0.0)      # Coverage ratio [0, 1]
    impervious_fraction = Column(Float, default=0.0)  # [0, 1]
    tree_canopy_fraction = Column(Float, default=0.0) # [0, 1]
    roof_area_sqm = Column(Float, default=0.0)
    water_distance_m = Column(Float, nullable=True)
    elevation_m = Column(Float, default=0.0)

    # Demographic & vulnerability parameters
    population = Column(Integer, default=0)
    population_density_sqkm = Column(Float, default=0.0)
    sensitive_site_count = Column(Integer, default=0)  # Schools, hospitals, transit hubs

    created_at = Column(DateTime(timezone=True), server_default=func.now())
