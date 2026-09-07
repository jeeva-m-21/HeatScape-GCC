"""FastAPI Router for Heatwave Early Warning & GCC Graded Response Action Plan (GRAP)."""

from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.services.heatwave_service import HeatwaveService

router = APIRouter()


@router.get("/forecast", response_model=Dict[str, Any])
def get_heatwave_forecast() -> Dict[str, Any]:
    """Retrieves 7-day rolling heatwave and apparent heat index forecast for Chennai.
    Includes IMD alert levels (GREEN, YELLOW, ORANGE, RED) and top vulnerable microclimate zones.
    """
    return HeatwaveService.get_7day_forecast()


@router.get("/grap-status", response_model=Dict[str, Any])
def get_grap_status(
    stage: Optional[int] = Query(
        default=2,
        ge=0,
        le=3,
        description="Simulated GRAP Stage (0=Advisory, 1=Yellow, 2=Orange, 3=Red)",
    )
) -> Dict[str, Any]:
    """Retrieves the active Greater Chennai Corporation Graded Response Action Plan (GRAP) status.
    Includes statutory labor mandates, active misting trucks, and departmental tasks.
    """
    return HeatwaveService.get_grap_status(forced_stage=stage)


@router.post("/dispatch-manifest", response_model=Dict[str, Any])
def generate_dispatch_manifest() -> Dict[str, Any]:
    """Generates official fleet dispatch orders for GCC evaporative misting cannons and cooling shelters."""
    return HeatwaveService.generate_dispatch_manifest()


@router.get("/shelters", response_model=Dict[str, Any])
def get_cooling_shelters() -> Dict[str, Any]:
    """Returns active GCC air-conditioned emergency cooling shelters and real-time occupancy."""
    manifest = HeatwaveService.generate_dispatch_manifest()
    return {
        "shelters": manifest["emergency_cooling_shelters"],
        "total_capacity": manifest["total_shelter_capacity"],
        "total_occupancy": manifest["total_current_shelter_occupancy"],
        "occupancy_rate_pct": round(
            (manifest["total_current_shelter_occupancy"] / manifest["total_shelter_capacity"]) * 100, 1
        ),
    }
