"""Unit and API integration tests for Real-Time WebSockets Telemetry Gateway."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.telemetry_stream import TelemetryStreamService

client = TestClient(app)


def test_telemetry_tick_generation():
    """Verify synthetic sensor tick generation with realistic microclimate physics."""
    tick = TelemetryStreamService.generate_random_tick()

    assert tick["event_type"] == "TELEMETRY_TICK"
    assert tick["node_id"].startswith("CHE-")
    assert 38.0 <= tick["ambient_temp_c"] <= 46.0
    assert 40.0 <= tick["relative_humidity"] <= 95.0
    assert tick["apparent_heat_index_c"] > 35.0
    assert "network_latency_ms" in tick


def test_websocket_telemetry_connection_and_streaming():
    """Verify WebSocket handshake, initial tick, and client ping-pong."""
    with client.websocket_connect("/api/v1/ws/telemetry") as websocket:
        # Handshake message
        handshake = websocket.receive_json()
        assert handshake["event_type"] == "CONNECTED"
        assert "IoT Mesh Gateway" in handshake["service"]

        # Initial tick
        first_tick = websocket.receive_json()
        assert first_tick["event_type"] == "TELEMETRY_TICK"
        assert "ambient_temp_c" in first_tick

        # Heartbeat request
        websocket.send_text("ping")
        ping_tick = websocket.receive_json()
        assert ping_tick["event_type"] == "TELEMETRY_TICK"


def test_ws_stats_and_broadcast_spike():
    """Verify HTTP broadcast trigger and gateway stats endpoint."""
    # 1. Stats endpoint
    res_stats = client.get("/api/v1/ws/stats")
    assert res_stats.status_code == 200
    assert res_stats.json()["gateway_status"] == "ONLINE"

    # 2. Broadcast spike endpoint
    res_spike = client.post(
        "/api/v1/ws/broadcast-spike",
        json={
            "corridor": "T. Nagar Usman Road",
            "temp_c": 44.8,
            "ward_id": "117",
        },
    )
    assert res_spike.status_code == 200
    data = res_spike.json()
    assert data["status"] == "BROADCAST_SUCCESSFUL"
    assert data["event"]["event_type"] == "THERMAL_SPIKE_ALERT"
    assert data["event"]["ambient_temp_c"] == 44.8
