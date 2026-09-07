"""
WebSocket Endpoints for Real-Time IoT Telemetry Streaming & Instant Emergency Alerts.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from app.services.telemetry_stream import ws_manager, TelemetryStreamService

router = APIRouter()


class SpikeBroadcastRequest(BaseModel):
    corridor: str = Field("T. Nagar Usman Road", description="Corridor or ward name experiencing heat spike")
    temp_c: float = Field(44.5, ge=35.0, le=55.0, description="Spike temperature in Celsius")
    ward_id: str = Field("117", description="GCC Ward identifier")


@router.websocket("/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    Bidirectional WebSocket connection for live 842 IoT sensor telemetry and emergency alerts.
    """
    await ws_manager.connect(websocket)
    try:
        # Initial greeting and handshake
        await ws_manager.send_personal_message(
            {
                "event_type": "CONNECTED",
                "service": "GCC HeatScape Real-Time IoT Mesh Gateway",
                "protocol": "LoRaWAN IN865 / MQTT Bridge",
                "timestamp": datetime.now().isoformat(),
                "active_connections": len(ws_manager.active_connections),
            },
            websocket,
        )

        # Send initial live telemetry tick
        await ws_manager.send_personal_message(
            TelemetryStreamService.generate_random_tick(),
            websocket,
        )

        while True:
            # Wait for client heartbeat or request
            data = await websocket.receive_text()
            if data in ["ping", "tick", "refresh"]:
                tick = TelemetryStreamService.generate_random_tick()
                await ws_manager.send_personal_message(tick, websocket)
            else:
                await ws_manager.send_personal_message(
                    {"event_type": "ACK", "received": data, "timestamp": datetime.now().isoformat()},
                    websocket,
                )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


@router.post("/broadcast-spike")
async def broadcast_heat_spike(req: SpikeBroadcastRequest):
    """
    Simulates and pushes a sudden thermal spike alarm to all connected WebSocket clients.
    """
    event = await TelemetryStreamService.broadcast_simulated_spike(
        corridor=req.corridor,
        temp_c=req.temp_c,
        ward_id=req.ward_id,
    )
    return {
        "status": "BROADCAST_SUCCESSFUL",
        "recipients_count": len(ws_manager.active_connections),
        "event": event,
    }


@router.get("/stats")
def get_ws_stats():
    """
    Returns live WebSocket gateway connection stats.
    """
    return {
        "gateway_status": "ONLINE",
        "active_clients": len(ws_manager.active_connections),
        "sampling_frequency_hz": 1.0,
        "protocol": "RFC 6455 WebSocket",
    }
