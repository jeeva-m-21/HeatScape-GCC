from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from typing import Optional, List, Dict, Any
import json

from app.core.database import get_db
from app.models import SpatialCell, CellObservation, ThermalTrajectory
from app.schemas.spatial import GeoJSONFeatureCollection
from app.schemas.analytics import KpiResponse, CellExplainResponse
from app.schemas.trajectory import CellObservationItem
from app.services.explainer_service import ExplainerService

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
    Stream analytical 100m grid cells directly via PostGIS ST_AsGeoJSON in WGS84 (EPSG:4326).
    """
    filters = []
    params: Dict[str, Any] = {"limit": limit}

    if min_anomaly is not None:
        filters.append("t.mean_anomaly_celsius >= :min_anomaly")
        params["min_anomaly"] = min_anomaly

    if state and state != "ALL":
        filters.append("t.state_label = :state")
        params["state"] = state

    if ward_id:
        filters.append("c.ward_id = :ward_id")
        params["ward_id"] = ward_id

    where_clause = ("WHERE " + " AND ".join(filters)) if filters else ""

    query = text(f"""
        SELECT 
            c.id AS cell_id,
            c.ward_id,
            c.zone_id,
            c.population,
            c.population_density_sqkm,
            c.building_density,
            c.impervious_fraction,
            c.tree_canopy_fraction,
            COALESCE(t.state_label, 'WATCH') AS state,
            COALESCE(t.mean_anomaly_celsius, 0.0) AS mean_anomaly,
            COALESCE(t.trend_slope, 0.0) AS trend_slope,
            COALESCE(t.recurrence_frequency, 0.0) AS recurrence,
            COALESCE(t.confidence_score, 0.5) AS confidence,
            COALESCE(t.regime_shift_detected, 0.0) AS regime_shift,
            ST_AsGeoJSON(c.geom_4326) AS geojson_geom
        FROM spatial_cells c
        LEFT JOIN thermal_trajectories t ON c.id = t.cell_id
        {where_clause}
        ORDER BY t.mean_anomaly_celsius DESC NULLS LAST
        LIMIT :limit
    """)

    results = db.execute(query, params).fetchall()

    features = []
    for r in results:
        features.append({
            "type": "Feature",
            "id": r.cell_id,
            "geometry": json.loads(r.geojson_geom),
            "properties": {
                "cell_id": r.cell_id,
                "ward_id": r.ward_id,
                "zone_id": r.zone_id,
                "population": int(r.population),
                "population_density_sqkm": float(r.population_density_sqkm),
                "building_density": float(r.building_density),
                "impervious_fraction": float(r.impervious_fraction),
                "tree_canopy_fraction": float(r.tree_canopy_fraction),
                "state": r.state,
                "mean_anomaly": round(float(r.mean_anomaly), 2),
                "trend_slope": round(float(r.trend_slope), 3),
                "recurrence": round(float(r.recurrence), 2),
                "confidence": round(float(r.confidence), 2),
                "regime_shift": float(r.regime_shift),
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.get("/cells/{cell_id}/history", response_model=List[CellObservationItem])
def get_cell_history(cell_id: str, db: Session = Depends(get_db)):
    """
    Fetch chronological 36-month observation history for a cell.
    """
    obs = (
        db.query(CellObservation)
        .filter(CellObservation.cell_id == cell_id)
        .order_by(CellObservation.observation_date.asc())
        .all()
    )

    if not obs:
        raise HTTPException(status_code=404, detail=f"No observations found for cell {cell_id}")

    return obs


@router.get("/cells/{cell_id}/explain", response_model=CellExplainResponse)
def get_cell_explanation(cell_id: str, db: Session = Depends(get_db)):
    """
    Retrieve TreeSHAP physical attribution ('Why Hot?') and temporal drift ('Why Now?').
    """
    cell = db.query(SpatialCell).filter(SpatialCell.id == cell_id).first()
    if not cell:
        raise HTTPException(status_code=404, detail=f"Cell {cell_id} not found")

    traj = db.query(ThermalTrajectory).filter(ThermalTrajectory.cell_id == cell_id).first()
    mean_anom = traj.mean_anomaly_celsius if traj else 1.0

    obs_records = (
        db.query(CellObservation)
        .filter(CellObservation.cell_id == cell_id)
        .order_by(CellObservation.observation_date.asc())
        .all()
    )

    cell_attrs = {
        "impervious_fraction": cell.impervious_fraction,
        "building_density": cell.building_density,
        "tree_canopy_fraction": cell.tree_canopy_fraction,
        "water_distance_m": cell.water_distance_m or 2200.0,
        "elevation_m": cell.elevation_m,
    }

    obs_dicts = [
        {
            "observation_date": o.observation_date,
            "lst_celsius": o.lst_celsius,
            "ndvi": o.ndvi,
            "spatial_anomaly_celsius": o.spatial_anomaly_celsius,
        }
        for o in obs_records
    ]

    why_hot = ExplainerService.explain_why_hot(cell_attrs, mean_anom)
    why_now = ExplainerService.explain_why_now(obs_dicts)

    return {
        "cell_id": cell_id,
        "why_hot": why_hot,
        "why_now": why_now,
    }


@router.get("/kpi", response_model=KpiResponse)
def get_heat_kpi(db: Session = Depends(get_db)):
    """
    Retrieve citywide aggregate summary KPIs.
    """
    total_cells = db.query(SpatialCell).count()

    state_counts_query = text("""
        SELECT state_label, COUNT(*) 
        FROM thermal_trajectories 
        GROUP BY state_label
    """)
    state_counts = dict(db.execute(state_counts_query).fetchall())

    # Exposed population in severe cells (EMERGING & PERSISTENT)
    exposed_pop_query = text("""
        SELECT COALESCE(SUM(c.population), 0)
        FROM spatial_cells c
        JOIN thermal_trajectories t ON c.id = t.cell_id
        WHERE t.state_label IN ('EMERGING', 'PERSISTENT')
    """)
    exposed_pop = db.execute(exposed_pop_query).scalar() or 0

    # Anomalies
    stats_query = text("""
        SELECT 
            COALESCE(AVG(mean_anomaly_celsius), 0.0),
            COALESCE(MAX(mean_anomaly_celsius), 0.0)
        FROM thermal_trajectories
    """)
    avg_anom, max_anom = db.execute(stats_query).fetchone()

    return {
        "total_cells": total_cells,
        "persistent_count": state_counts.get("PERSISTENT", 0),
        "emerging_count": state_counts.get("EMERGING", 0),
        "temporary_count": state_counts.get("TEMPORARY", 0),
        "improving_count": state_counts.get("IMPROVING", 0),
        "watch_count": state_counts.get("WATCH", 0),
        "exposed_population": int(exposed_pop),
        "mean_city_anomaly": round(float(avg_anom), 2),
        "max_observed_anomaly": round(float(max_anom), 2),
    }
