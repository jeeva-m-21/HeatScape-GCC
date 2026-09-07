"""
Incident Triage & Field Officer Audit Service for Greater Chennai Corporation (GCC).
Manages emergency heat incident reports, automatic severity triage,
proximity-based misting/medical dispatch, and physical intervention verification audits.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid


class IncidentService:
    """
    Handles GCC field reports, citizen heat emergencies, and physical verification audits
    for urban forestry, cool roofs, and cooling shelters.
    """

    # In-memory incident queue seeded with realistic Chennai heatwave emergencies
    INCIDENTS: List[Dict[str, Any]] = [
        {
            "id": "INC-701",
            "reporter_name": "Sanitary Inspector K. Ramanathan",
            "reporter_role": "FIELD_OFFICER",
            "category": "MISTING_REQUIRED",
            "severity": "CRITICAL",
            "status": "DISPATCHED",
            "ward_id": "117",
            "zone": "Zone X (Kodambakkam)",
            "lat": 13.0412,
            "lon": 80.2334,
            "location_name": "Usman Road Flyover Junction, T. Nagar",
            "description": "Severe street canyon heat entrapment (>44.2°C). High pedestrian density, roadside vendors reporting dizziness.",
            "dispatched_unit": "Misting Cannon Truck #4 (Ripon Central)",
            "reported_at": "2026-09-08T11:45:00+05:30",
            "eta_minutes": 8,
        },
        {
            "id": "INC-702",
            "reporter_name": "Citizen (Toll-Free 1913)",
            "reporter_role": "CITIZEN",
            "category": "DRINKING_WATER_EXHAUSTION",
            "severity": "URGENT",
            "status": "REPORTED",
            "ward_id": "054",
            "zone": "Zone V (Royapuram)",
            "lat": 13.0882,
            "lon": 80.2880,
            "location_name": "Broadway Bus Terminus Stand #3",
            "description": "Public potable water kiosk depleted. Transit passengers waiting in unshaded bays.",
            "dispatched_unit": "Pending Zone V Water Tanker Dispatch",
            "reported_at": "2026-09-08T12:10:00+05:30",
            "eta_minutes": 15,
        },
        {
            "id": "INC-703",
            "reporter_name": "Dr. S. Meenakshi (UPHC Doctor)",
            "reporter_role": "HEALTH_OFFICER",
            "category": "HEAT_STROKE",
            "severity": "CRITICAL",
            "status": "DISPATCHED",
            "ward_id": "114",
            "zone": "Zone IX (Teynampet)",
            "lat": 13.0450,
            "lon": 80.2450,
            "location_name": "Teynampet Signal / Anna Salai Construction Site",
            "description": "Construction laborer collapsed with heat exhaustion symptoms. Body temp 39.8°C.",
            "dispatched_unit": "108 Emergency Ambulance Unit #12",
            "reported_at": "2026-09-08T12:25:00+05:30",
            "eta_minutes": 4,
        },
    ]

    # In-memory field officer intervention audits
    FIELD_AUDITS: List[Dict[str, Any]] = [
        {
            "audit_id": "AUD-101",
            "auditor_name": "AEE V. Karthik",
            "ward_id": "117",
            "intervention_type": "COOL_ROOF",
            "site_name": "T. Nagar Community Hall",
            "verified_albedo": 0.78,
            "condition": "OPTIMAL",
            "notes": "Coating intact with zero peeling. Surface temperature measured at 34.2°C vs adjacent unpainted asphalt at 46.5°C.",
            "timestamp": "2026-09-07T16:30:00+05:30",
        },
        {
            "audit_id": "AUD-102",
            "auditor_name": "Ward Inspector P. Anitha",
            "ward_id": "114",
            "intervention_type": "URBAN_CANOPY",
            "site_name": "Anna Salai Service Lane Green Verge",
            "tree_count_surveyed": 50,
            "survival_rate_pct": 94.0,
            "condition": "HEALTHY",
            "notes": "Neem and Pungan saplings thriving with drip irrigation bag installation.",
            "timestamp": "2026-09-08T09:15:00+05:30",
        },
    ]

    @classmethod
    def list_incidents(cls, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns active incidents, optionally filtered by status."""
        if status_filter and status_filter.upper() != "ALL":
            return [inc for inc in cls.INCIDENTS if inc["status"] == status_filter.upper()]
        return cls.INCIDENTS

    @classmethod
    def report_incident(
        cls,
        reporter_name: str,
        category: str,
        location_name: str,
        description: str,
        ward_id: Optional[str] = "117",
        zone: Optional[str] = "Zone X",
        lat: Optional[float] = 13.041,
        lon: Optional[float] = 80.233,
        severity: Optional[str] = "URGENT",
    ) -> Dict[str, Any]:
        """Creates and logs a new emergency heat incident."""
        new_id = f"INC-{len(cls.INCIDENTS) + 704}"
        # Auto-assign initial dispatch unit based on category
        if category == "MISTING_REQUIRED":
            dispatched = "Misting Cannon Truck #7 (En Route)"
            eta = 10
            status = "DISPATCHED"
        elif category == "HEAT_STROKE":
            dispatched = "108 Mobile Medical ICU Unit (En Route)"
            eta = 6
            status = "DISPATCHED"
        else:
            dispatched = "Zonal Quick Response Team Assigned"
            eta = 20
            status = "REPORTED"

        incident = {
            "id": new_id,
            "reporter_name": reporter_name,
            "reporter_role": "CITIZEN_OR_VOICE",
            "category": category,
            "severity": severity or "URGENT",
            "status": status,
            "ward_id": ward_id or "117",
            "zone": zone or "Zone X",
            "lat": lat or 13.041,
            "lon": lon or 80.233,
            "location_name": location_name,
            "description": description,
            "dispatched_unit": dispatched,
            "reported_at": datetime.now().isoformat(),
            "eta_minutes": eta,
        }
        cls.INCIDENTS.insert(0, incident)
        return incident

    @classmethod
    def update_incident_status(cls, incident_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        """Updates the status of an existing incident."""
        for inc in cls.INCIDENTS:
            if inc["id"] == incident_id:
                inc["status"] = new_status.upper()
                if new_status.upper() == "RESOLVED":
                    inc["resolved_at"] = datetime.now().isoformat()
                return inc
        return None

    @classmethod
    def log_field_audit(cls, audit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Logs an in-situ field officer verification audit."""
        audit_id = f"AUD-{len(cls.FIELD_AUDITS) + 103}"
        audit_record = {
            "audit_id": audit_id,
            "timestamp": datetime.now().isoformat(),
            **audit_data,
        }
        cls.FIELD_AUDITS.insert(0, audit_record)
        return audit_record

    @classmethod
    def list_field_audits(cls) -> List[Dict[str, Any]]:
        """Lists all physical intervention verification audits."""
        return cls.FIELD_AUDITS
