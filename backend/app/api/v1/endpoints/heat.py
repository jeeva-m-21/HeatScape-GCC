from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.schemas.spatial import GeoJSONFeatureCollection
from app.schemas.analytics import KpiResponse, CellExplainResponse
from app.schemas.trajectory import CellObservationItem

router = APIRouter()


@router.get("/cells/geojson")
def get_cells_geojson(
    min_anomaly: Optional[float] = Query(None, description="Filter by minimum mean anomaly"),
    state: Optional[str] = Query(None, description="Filter by state label"),
    ward_id: Optional[str] = Query(None, description="Filter by ward id"),
    limit: int = Query(2000, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    """
    Stream analytical 100m grid cells as RFC 7946 GeoJSON FeatureCollection in WGS84.
    """
    # Will be fully populated in Sprint 4 with PostGIS ST_AsGeoJSON
    return {
        "type": "FeatureCollection",
        "features": [],
    }


@router.get("/cells/{cell_id}/history", response_model=List[CellObservationItem])
def get_cell_history(cell_id: str, db: Session = Depends(get_db)):
    """
    Fetch chronological 36-month observation history for a cell.
    """
    return []


@router.get("/cells/{cell_id}/explain", response_model=CellExplainResponse)
def get_cell_explanation(cell_id: str, db: Session = Depends(get_db)):
    """
    Retrieve TreeSHAP physical attribution ('Why Hot?') and temporal drift ('Why Now?').
    """
    raise HTTPException(status_code=501, detail="Explainer pipeline scheduled for Sprint 3")


@router.get("/kpi", response_model=KpiResponse)
def get_heat_kpi(db: Session = Depends(get_db)):
    """
    Retrieve citywide aggregate summary KPIs.
    """
    return {
        "total_cells": 0,
        "persistent_count": 0,
        "emerging_count": 0,
        "temporary_count": 0,
        "improving_count": 0,
        "watch_count": 0,
        "exposed_population": 0,
        "mean_city_anomaly": 0.0,
        "max_observed_anomaly": 0.0,
    }
