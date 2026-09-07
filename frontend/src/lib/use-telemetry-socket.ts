'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface TelemetryTick {
  event_type: 'TELEMETRY_TICK';
  timestamp: string;
  node_id: string;
  corridor: string;
  ward_id: string;
  zone: string;
  ambient_temp_c: number;
  relative_humidity: number;
  apparent_heat_index_c: number;
  is_spike: boolean;
  network_latency_ms: number;
}

export interface SpikeAlert {
  event_type: 'THERMAL_SPIKE_ALERT';
  timestamp: string;
  node_id: string;
  corridor: string;
  ward_id: string;
  ambient_temp_c: number;
  apparent_heat_index_c: number;
  severity: 'CRITICAL' | 'URGENT';
  message: string;
}

export function useTelemetrySocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [latestTick, setLatestTick] = useState<TelemetryTick | null>({
    event_type: 'TELEMETRY_TICK',
    timestamp: new Date().toISOString(),
    node_id: 'CHE-USM-042',
    corridor: 'T. Nagar Usman Road',
    ward_id: '117',
    zone: 'Zone X',
    ambient_temp_c: 42.6,
    relative_humidity: 68.4,
    apparent_heat_index_c: 49.2,
    is_spike: true,
    network_latency_ms: 24,
  });
  const [recentTicks, setRecentTicks] = useState<TelemetryTick[]>([]);
  const [activeAlert, setActiveAlert] = useState<SpikeAlert | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/ws/telemetry';
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event_type === 'TELEMETRY_TICK') {
            setLatestTick(data);
            setRecentTicks((prev) => [data, ...prev.slice(0, 15)]);
          } else if (data.event_type === 'THERMAL_SPIKE_ALERT') {
            setActiveAlert(data);
            // Auto dismiss alert banner after 8s
            setTimeout(() => {
              setActiveAlert((current) => (current?.timestamp === data.timestamp ? null : current));
            }, 8000);
          }
        } catch {
          // ignore non-json messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      socketRef.current = ws;
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();

    // Heartbeat ping every 2.5 seconds to pull new ticks
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send('tick');
      }
    }, 2500);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  const triggerSpike = async (corridor: string, temp_c: number, ward_id: string = '117') => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      await fetch(`${apiBase}/ws/broadcast-spike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corridor, temp_c, ward_id }),
      });
    } catch (err) {
      console.error('Failed to trigger spike broadcast:', err);
    }
  };

  return {
    isConnected,
    latestTick,
    recentTicks,
    activeAlert,
    dismissAlert: () => setActiveAlert(null),
    triggerSpike,
  };
}
