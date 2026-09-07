"""
Real-Time WebSockets Telemetry & Incident Streaming Service for Greater Chennai Corporation.
Manages active WebSocket client connections, broadcasts live IoT sensor micro-fluctuations,
and streams emergency incident dispatch alerts.
"""

import asyncio
import json
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import WebSocket


class TelemetryConnectionManager:
    """
    Manages real-time bidirectional WebSocket connections for HeatScape telemetry.
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for dead in disconnected:
            self.disconnect(dead)


# Global connection manager singleton
ws_manager = TelemetryConnectionManager()


class TelemetryStreamService:
    """
    Generates synthetic high-frequency sensor ticks and manages emergency push broadcasts.
    """

    CORRIDORS = [
        {"node_id": "CHE-USM-042", "corridor": "T. Nagar Usman Road", "ward_id": "117", "zone": "Zone X", "base_temp": 42.4, "base_rh": 67.5},
        {"node_id": "CHE-ANN-114", "corridor": "Anna Salai Teynampet", "ward_id": "114", "zone": "Zone IX", "base_temp": 41.8, "base_rh": 70.0},
        {"node_id": "CHE-PAR-054", "corridor": "Parrys Broadway Terminus", "ward_id": "054", "zone": "Zone V", "base_temp": 43.1, "base_rh": 65.0},
        {"node_id": "CHE-GUI-165", "corridor": "Guindy Industrial Estate", "ward_id": "165", "zone": "Zone XIII", "base_temp": 40.5, "base_rh": 72.0},
        {"node_id": "CHE-POR-152", "corridor": "Porur Lake Continental Fringe", "ward_id": "152", "zone": "Zone XI", "base_temp": 43.6, "base_rh": 60.5},
        {"node_id": "CHE-OMR-197", "corridor": "Sholinganallur OMR Corridor", "ward_id": "197", "zone": "Zone XV", "base_temp": 39.8, "base_rh": 75.0},
    ]

    @classmethod
    def generate_random_tick(cls) -> Dict[str, Any]:
        """Generates a microclimate sensor tick with realistic micro-variability."""
        station = random.choice(cls.CORRIDORS)
        # Small random fluctuation (+/- 0.3°C, +/- 0.5% RH)
        fluct_temp = round(station["base_temp"] + random.uniform(-0.35, 0.45), 1)
        fluct_rh = round(max(40.0, min(95.0, station["base_rh"] + random.uniform(-0.8, 0.8))), 1)

        # Steadman apparent temperature calculation
        e_vp = (fluct_rh / 100.0) * 6.105 * (2.71828 ** ((17.27 * fluct_temp) / (237.7 + fluct_temp)))
        apparent_temp = round(fluct_temp + 0.33 * e_vp - 4.0, 1)

        is_spike = fluct_temp >= 43.0 or apparent_temp >= 48.0

        return {
            "event_type": "TELEMETRY_TICK",
            "timestamp": datetime.now().isoformat(),
            "node_id": station["node_id"],
            "corridor": station["corridor"],
            "ward_id": station["ward_id"],
            "zone": station["zone"],
            "ambient_temp_c": fluct_temp,
            "relative_humidity": fluct_rh,
            "apparent_heat_index_c": apparent_temp,
            "is_spike": is_spike,
            "network_latency_ms": random.randint(18, 45),
        }

    @classmethod
    async def broadcast_simulated_spike(
        cls,
        corridor: str = "T. Nagar Usman Road",
        temp_c: float = 44.5,
        ward_id: str = "117",
    ) -> Dict[str, Any]:
        """Broadcasts an urgent heat spike alarm to all connected WebSocket clients."""
        alert_event = {
            "event_type": "THERMAL_SPIKE_ALERT",
            "timestamp": datetime.now().isoformat(),
            "node_id": "CHE-SPIKE-ALERT",
            "corridor": corridor,
            "ward_id": ward_id,
            "ambient_temp_c": temp_c,
            "apparent_heat_index_c": round(temp_c + 7.8, 1),
            "severity": "CRITICAL",
            "message": f"CRITICAL THERMAL SPIKE ({temp_c}°C) detected in {corridor} (Ward {ward_id})! GRAP Stage 2 Misting Cannon Truck mobilized.",
        }
        await ws_manager.broadcast(alert_event)
        return alert_event
