"""
API Endpoints for GCC Emergency Incidents & Field Officer Verification Audits.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.incident_service import IncidentService

router = APIRouter()


class IncidentReportRequest(BaseModel):
    reporter_name: str = Field(..., min_length=2, max_length=100)
    category: str = Field("MISTING_REQUIRED", description="HEAT_STROKE | MISTING_REQUIRED | DRINKING_WATER_EXHAUSTION | COOLING_SHELTER_OVERFLOW")
    location_name: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5, max_length=500)
    ward_id: Optional[str] = Field("117", max_length=10)
    zone: Optional[str] = Field("Zone X", max_length=30)
    lat: Optional[float] = Field(13.041, ge=12.5, le=13.5)
    lon: Optional[float] = Field(80.233, ge=79.8, le=80.5)
    severity: Optional[str] = Field("URGENT", description="CRITICAL | URGENT | MODERATE")


class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., description="REPORTED | DISPATCHED | RESOLVED")


class FieldAuditRequest(BaseModel):
    auditor_name: str = Field(..., min_length=2)
    ward_id: str = Field(..., min_length=1)
    intervention_type: str = Field(..., description="COOL_ROOF | URBAN_CANOPY | SHADE_CANOPY | COOL_PAVEMENT")
    site_name: str = Field(..., min_length=2)
    condition: str = Field("OPTIMAL", description="OPTIMAL | NEEDS_ATTENTION | CRITICAL_DEGRADATION")
    notes: str = Field(..., min_length=5)
    verified_albedo: Optional[float] = Field(None, ge=0.0, le=1.0)
    survival_rate_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    tree_count_surveyed: Optional[int] = Field(None, ge=0)


@router.get("")
def get_incidents(status: Optional[str] = Query(None, description="Optional status filter (REPORTED | DISPATCHED | RESOLVED)")):
    """
    Lists active GCC emergency heat incident reports.
    """
    return {
        "total": len(IncidentService.INCIDENTS),
        "incidents": IncidentService.list_incidents(status_filter=status),
    }


@router.post("/report")
def create_incident_report(req: IncidentReportRequest):
    """
    Submits a new citizen or field officer heat incident report with automated triage.
    """
    return IncidentService.report_incident(
        reporter_name=req.reporter_name,
        category=req.category,
        location_name=req.location_name,
        description=req.description,
        ward_id=req.ward_id,
        zone=req.zone,
        lat=req.lat,
        lon=req.lon,
        severity=req.severity,
    )


@router.patch("/{incident_id}/status")
def update_status(incident_id: str, req: IncidentStatusUpdate):
    """
    Updates incident triage workflow status (REPORTED -> DISPATCHED -> RESOLVED).
    """
    updated = IncidentService.update_incident_status(incident_id=incident_id, new_status=req.status)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return updated


@router.get("/audits")
def get_field_audits():
    """
    Retrieves in-situ physical intervention verification audits.
    """
    return {
        "total_audits": len(IncidentService.FIELD_AUDITS),
        "audits": IncidentService.list_field_audits(),
    }


@router.post("/audit")
def log_field_audit(req: FieldAuditRequest):
    """
    Submits a field officer intervention verification audit report.
    """
    return IncidentService.log_field_audit(req.model_dump())
