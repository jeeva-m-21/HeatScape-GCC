from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "HeatScape"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://heatscape_admin:heatscape_secure_password@db:5432/heatscape_db"

    # Redis & Celery
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    # Coordinate Reference Systems
    CHENNAI_CRS: str = "EPSG:32644"  # UTM Zone 44N for metric/spatial analysis
    INTERCHANGE_CRS: str = "EPSG:4326"  # WGS84 for GeoJSON/MapLibre

    # Study Area Bounds (WGS84 EPSG:4326)
    BBOX_MIN_LON: float = 80.1150
    BBOX_MIN_LAT: float = 12.9150
    BBOX_MAX_LON: float = 80.3350
    BBOX_MAX_LAT: float = 13.2450

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
