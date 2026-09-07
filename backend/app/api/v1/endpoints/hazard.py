"""
API Endpoints for Compound Climate Multi-Hazard Risk & Sponge Infrastructure Co-Benefits.
"""

from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.services.hazard_service import hazard_service

router = APIRouter()


class SpongeCoBenefitRequest(BaseModel):
    budget_crores: float = Field(default=50.0, ge=1.0, le=500.0, json_schema_extra={"example": 50.0})
    miyawaki_fraction: float = Field(default=0.40, ge=0.0, le=1.0, json_schema_extra={"example": 0.40})
    bioswale_fraction: float = Field(default=0.35, ge=0.0, le=1.0, json_schema_extra={"example": 0.35})
    cool_roof_fraction: float = Field(default=0.25, ge=0.0, le=1.0, json_schema_extra={"example": 0.25})


@router.get("/zones", summary="Compound Climate Risk Index (CCRI) for GCC Zones")
def get_compound_risk_zones(
    weight_heat: float = Query(0.55, ge=0.0, le=1.0, description="Weight for Heat Vulnerability"),
    weight_flood: float = Query(0.45, ge=0.0, le=1.0, description="Weight for Flood Inundation Risk"),
    sponge_factor: float = Query(0.25, ge=0.0, le=1.0, description="Mitigation discount for Sponge Capacity"),
):
    """
    Returns all Greater Chennai Corporation zones ranked by their Compound Climate Risk Index (CCRI),
    combining coastal heatwave severity and monsoon flood exposure.
    """
    ranked_zones = hazard_service.compute_compound_risk(
        weight_heat=weight_heat,
        weight_flood=weight_flood,
        sponge_mitigation_factor=sponge_factor,
    )
    return {
        "weight_heat": weight_heat,
        "weight_flood": weight_flood,
        "sponge_mitigation_factor": sponge_factor,
        "total_zones": len(ranked_zones),
        "zones": ranked_zones,
    }


@router.post("/sponge-co-benefits", summary="Calculate Blue-Green Sponge Co-Benefits")
def calculate_sponge_co_benefits(payload: SpongeCoBenefitRequest):
    """
    Quantifies the dual returns of blue-green sponge infrastructure:
    Celsius cooling, stormwater volume retained (m³), and avoided flood damage monetary valuation.
    """
    return hazard_service.calculate_sponge_co_benefits(
        budget_crores=payload.budget_crores,
        miyawaki_fraction=payload.miyawaki_fraction,
        bioswale_fraction=payload.bioswale_fraction,
        cool_roof_fraction=payload.cool_roof_fraction,
    )


@router.get("/zone/{zone_id}", summary="Get Detailed Compound Risk for a Zone")
def get_zone_compound_risk(zone_id: int):
    """Fetches compound risk profile and critical infrastructure assets for a specific GCC Zone."""
    all_zones = hazard_service.compute_compound_risk()
    zone = next((z for z in all_zones if z["zone_id"] == zone_id), None)
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GCC Zone {zone_id} not found in compound hazard catalog.",
        )
    return zone
