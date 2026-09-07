"""Unit and API integration tests for GCC Emergency Incidents and Field Officer Audits."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.incident_service import IncidentService

client = TestClient(app)


def test_list_incidents():
    """Verify seeded incidents and status filtering."""
    incidents = IncidentService.list_incidents()
    assert len(incidents) >= 3

    dispatched = IncidentService.list_incidents(status_filter="DISPATCHED")
    assert all(inc["status"] == "DISPATCHED" for inc in dispatched)


def test_report_incident():
    """Verify new incident intake, automatic unit assignment, and queue insertion."""
    new_inc = IncidentService.report_incident(
        reporter_name="Citizen V. Sundaram",
        category="MISTING_REQUIRED",
        location_name="Ranganathan Street, T. Nagar",
        description="Elderly shoppers struggling with severe radiant heat (>43°C).",
        ward_id="117",
        zone="Zone X",
    )

    assert new_inc["id"].startswith("INC-")
    assert new_inc["status"] == "DISPATCHED"
    assert "Misting Cannon Truck" in new_inc["dispatched_unit"]
    assert new_inc["eta_minutes"] > 0


def test_update_incident_status():
    """Verify triage state transitions from DISPATCHED to RESOLVED."""
    incidents = IncidentService.list_incidents()
    first_id = incidents[0]["id"]

    updated = IncidentService.update_incident_status(incident_id=first_id, new_status="RESOLVED")
    assert updated is not None
    assert updated["status"] == "RESOLVED"
    assert "resolved_at" in updated


def test_field_audit():
    """Verify logging of in-situ physical intervention audits."""
    audit = IncidentService.log_field_audit({
        "auditor_name": "Junior Engineer R. Karthik",
        "ward_id": "117",
        "intervention_type": "COOL_ROOF",
        "site_name": "Pondy Bazaar Pedestrian Plaza",
        "verified_albedo": 0.82,
        "condition": "OPTIMAL",
        "notes": "Coating effective, 12°C surface temperature suppression recorded.",
    })

    assert audit["audit_id"].startswith("AUD-")
    assert audit["verified_albedo"] == 0.82

    audits = IncidentService.list_field_audits()
    assert len(audits) >= 3


def test_incident_api_endpoints():
    """Verify HTTP REST endpoints for incident management."""
    # 1. List incidents
    res = client.get("/api/v1/incidents")
    assert res.status_code == 200
    assert "incidents" in res.json()

    # 2. Report new incident
    res_post = client.post(
        "/api/v1/incidents/report",
        json={
            "reporter_name": "Ward Inspector Test",
            "category": "HEAT_STROKE",
            "location_name": "Parrys Broadway Signal",
            "description": "Bus driver suffering heat syncope.",
            "ward_id": "054",
            "zone": "Zone V",
            "severity": "CRITICAL",
        },
    )
    assert res_post.status_code == 200
    inc_data = res_post.json()
    inc_id = inc_data["id"]

    # 3. Patch status
    res_patch = client.patch(
        f"/api/v1/incidents/{inc_id}/status",
        json={"status": "RESOLVED"},
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["status"] == "RESOLVED"

    # 4. Field audits list and post
    res_audit_post = client.post(
        "/api/v1/incidents/audit",
        json={
            "auditor_name": "AEE Test",
            "ward_id": "114",
            "intervention_type": "URBAN_CANOPY",
            "site_name": "Anna Salai Median",
            "condition": "OPTIMAL",
            "notes": "Healthy saplings",
            "survival_rate_pct": 96.0,
        },
    )
    assert res_audit_post.status_code == 200
    assert "audit_id" in res_audit_post.json()
