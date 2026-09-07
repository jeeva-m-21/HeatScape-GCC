"""
API Endpoints for Scenarios, CMIP6 Climate Projections, and Council Legislative Resolutions.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.services.projection_service import ProjectionService

router = APIRouter()


class CouncilResolutionRequest(BaseModel):
    budget_inr: float = Field(500000000.0, ge=1000000.0, le=5000000000.0, description="Municipal capital expenditure budget in INR")
    selected_strategy: str = Field("BALANCED", description="BALANCED | AGGRESSIVE_COOL_ROOFS | MAXIMUM_FORESTRY")


@router.get("/")
def list_saved_scenarios() -> List[Dict[str, Any]]:
    """
    List historical or saved intervention planning scenarios.
    """
    return []


@router.get("/climate-projections")
def get_climate_projections(
    pathway: str = Query("SSP5_85", description="IPCC CMIP6 pathway (SSP2_45 or SSP5_85)"),
    start_year: int = Query(2020, ge=2020, le=2025),
    end_year: int = Query(2030, ge=2025, le=2035),
):
    """
    Retrieves downscaled monthly and annual climate projections (2020-2030) for Greater Chennai Corporation.
    """
    return ProjectionService.get_projections(
        pathway=pathway,
        start_year=start_year,
        end_year=end_year,
    )


@router.get("/council-resolution")
def get_council_resolution(
    budget_inr: float = Query(500000000.0, ge=1000000.0),
    selected_strategy: str = Query("BALANCED"),
):
    """
    Generates official Greater Chennai Corporation Legislative Resolution & Executive Dossier.
    """
    return ProjectionService.generate_council_resolution(
        budget_inr=budget_inr,
        selected_strategy=selected_strategy,
    )


@router.post("/council-resolution/generate")
def generate_council_resolution(req: CouncilResolutionRequest):
    """
    Generates customized GCC Council resolution docket based on user budget.
    """
    return ProjectionService.generate_council_resolution(
        budget_inr=req.budget_inr,
        selected_strategy=req.selected_strategy,
    )
