"""A* Shaded Cool Pedestrian Routing Engine for Greater Chennai Corporation (GCC).

Computes thermally optimized walking routes comparing the Direct Path vs. Shaded Cool Path
by penalizing high surface thermal anomalies (LST) and rewarding tree canopy cover and transit shade.
"""

import math
import heapq
from typing import Dict, List, Tuple, Any, Optional


class RoutingNode:
    def __init__(
        self,
        node_id: str,
        lat: float,
        lon: float,
        anomaly_c: float,
        canopy_pct: float,
        is_water_point: bool = False,
        is_cooling_shelter: bool = False,
        name: str = "",
    ):
        self.node_id = node_id
        self.lat = lat
        self.lon = lon
        self.anomaly_c = anomaly_c
        self.canopy_pct = canopy_pct
        self.is_water_point = is_water_point
        self.is_cooling_shelter = is_cooling_shelter
        self.name = name


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes the great-circle distance between two points in meters."""
    r = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


class CoolRoutingService:
    """Graph-based A* routing engine weighted by spatiotemporal heat and canopy cover."""

    @classmethod
    def _build_chennai_grid_graph(cls) -> Tuple[Dict[str, RoutingNode], Dict[str, List[Tuple[str, float]]]]:
        """Constructs an interconnected microclimate grid graph covering central Chennai
        (T. Nagar, Usman Road, Anna Salai, Panagal Park, CIT Nagar, Nandanam).
        Grid resolution: ~100m steps.
        """
        nodes: Dict[str, RoutingNode] = {}
        adjacency: Dict[str, List[Tuple[str, float]]] = {}

        # Anchor coordinates around T. Nagar / Usman Rd / Anna Salai corridor
        base_lat = 13.0360
        base_lon = 80.2280
        rows = 9
        cols = 9
        step_lat = 0.0010  # ~110 meters
        step_lon = 0.0010  # ~108 meters

        for r in range(rows):
            for c in range(cols):
                node_id = f"R{r}_C{c}"
                lat = base_lat + r * step_lat
                lon = base_lon + c * step_lon

                # Simulating physical characteristics:
                # Column 4 is a wide unshaded asphalt commercial strip (Usman Rd main line) -> High anomaly, 2% canopy
                # Column 2-3 has lush residential avenues & parks (Panagal Park corridor) -> Low anomaly, 45% canopy
                if c == 4:
                    anomaly = 3.8 + 0.3 * (r % 2)
                    canopy = 4.0
                elif c in (1, 2) and r in (3, 4, 5):
                    anomaly = -0.6 - 0.2 * (r % 2)  # Cool park oasis
                    canopy = 58.0
                elif c in (1, 2):
                    anomaly = 0.8
                    canopy = 35.0
                elif c >= 6:
                    anomaly = 2.4
                    canopy = 12.0
                else:
                    anomaly = 1.4
                    canopy = 18.0

                is_water = (r, c) in [(1, 2), (4, 2), (7, 4), (3, 6)]
                is_shelter = (r, c) in [(4, 2), (7, 3)]
                name = f"Grid Junction ({r}, {c})"
                if (r, c) == (4, 2):
                    name = "Panagal Park Shaded Plaza & Water Kiosk"
                elif (r, c) == (4, 4):
                    name = "Usman Road Commercial Hub (Sun-Exposed)"
                elif (r, c) == (0, 0):
                    name = "CIT Nagar South Junction"
                elif (r, c) == (8, 8):
                    name = "Anna Salai Metro Interchange"

                nodes[node_id] = RoutingNode(
                    node_id=node_id,
                    lat=lat,
                    lon=lon,
                    anomaly_c=round(anomaly, 2),
                    canopy_pct=canopy,
                    is_water_point=is_water,
                    is_cooling_shelter=is_shelter,
                    name=name,
                )
                adjacency[node_id] = []

        # Connect 4-way adjacent grid edges
        for r in range(rows):
            for c in range(cols):
                curr = f"R{r}_C{c}"
                neighbors = []
                if r > 0:
                    neighbors.append(f"R{r-1}_C{c}")
                if r < rows - 1:
                    neighbors.append(f"R{r+1}_C{c}")
                if c > 0:
                    neighbors.append(f"R{r}_C{c-1}")
                if c < cols - 1:
                    neighbors.append(f"R{r}_C{c+1}")

                for nbr in neighbors:
                    d = haversine_distance_meters(
                        nodes[curr].lat, nodes[curr].lon, nodes[nbr].lat, nodes[nbr].lon
                    )
                    adjacency[curr].append((nbr, d))

        return nodes, adjacency

    @classmethod
    def _find_closest_node(cls, lat: float, lon: float, nodes: Dict[str, RoutingNode]) -> str:
        """Finds the nearest graph node to given coordinates."""
        closest_id = None
        min_d = float("inf")
        for nid, node in nodes.items():
            d = haversine_distance_meters(lat, lon, node.lat, node.lon)
            if d < min_d:
                min_d = d
                closest_id = nid
        return closest_id or "R0_C0"

    @classmethod
    def find_routes(
        cls,
        origin_lat: float = 13.0365,
        origin_lon: float = 13.0365,
        dest_lat: float = 13.0445,
        dest_lon: float = 80.2355,
    ) -> Dict[str, Any]:
        """Calculates both Direct Route and Shaded Cool Route between origin and destination."""
        nodes, adjacency = cls._build_chennai_grid_graph()

        start_node = cls._find_closest_node(origin_lat, origin_lon, nodes)
        end_node = cls._find_closest_node(dest_lat, dest_lon, nodes)

        # Fallback to defaults if start == end
        if start_node == end_node:
            start_node = "R0_C3"
            end_node = "R8_C5"

        # 1. Direct Shortest Path (pure physical distance)
        direct_path, direct_dist = cls._astar(nodes, adjacency, start_node, end_node, mode="direct")

        # 2. Cool / Shaded Path (weighted by heat anomaly penalty and canopy bonus)
        cool_path, cool_dist = cls._astar(nodes, adjacency, start_node, end_node, mode="cool")

        direct_metrics = cls._calculate_path_metrics(nodes, direct_path, direct_dist)
        cool_metrics = cls._calculate_path_metrics(nodes, cool_path, cool_dist)

        # Delta savings
        exposure_reduction_c = round(direct_metrics["avg_apparent_temp_c"] - cool_metrics["avg_apparent_temp_c"], 1)
        extra_walking_time_mins = round(max(0, (cool_metrics["duration_mins"] - direct_metrics["duration_mins"])), 1)
        canopy_gain_pct = round(cool_metrics["canopy_coverage_pct"] - direct_metrics["canopy_coverage_pct"], 1)

        # Collect hydration & shelter POIs along cool path
        water_points_count = sum(1 for nid in cool_path if nodes[nid].is_water_point)
        shelters_count = sum(1 for nid in cool_path if nodes[nid].is_cooling_shelter)

        return {
            "origin": {
                "lat": nodes[start_node].lat,
                "lon": nodes[start_node].lon,
                "name": nodes[start_node].name,
            },
            "destination": {
                "lat": nodes[end_node].lat,
                "lon": nodes[end_node].lon,
                "name": nodes[end_node].name,
            },
            "comparison_summary": {
                "thermal_relief_celsius": f"-{exposure_reduction_c}°C Cooler",
                "canopy_increase": f"+{canopy_gain_pct}% Shaded",
                "additional_walk_mins": f"+{extra_walking_time_mins} mins",
                "water_points_encountered": water_points_count,
                "cooling_shelters_encountered": shelters_count,
                "recommendation": (
                    "Recommended: The Cool Route increases walking distance by only "
                    f"{round(cool_dist - direct_dist)} meters while reducing apparent thermal stress "
                    f"by -{exposure_reduction_c}°C with {round(cool_metrics['canopy_coverage_pct'])}% tree shade."
                ),
            },
            "direct_route": direct_metrics,
            "cool_route": cool_metrics,
        }

    @classmethod
    def _astar(
        cls,
        nodes: Dict[str, RoutingNode],
        adjacency: Dict[str, List[Tuple[str, float]]],
        start: str,
        goal: str,
        mode: str = "direct",
    ) -> Tuple[List[str], float]:
        """Classic A* algorithm with mode-dependent edge weighting."""
        open_set: List[Tuple[float, float, str, List[str]]] = []
        heapq.heappush(open_set, (0.0, 0.0, start, [start]))

        g_scores: Dict[str, float] = {start: 0.0}
        visited = set()

        while open_set:
            f, current_g, current, path = heapq.heappop(open_set)

            if current == goal:
                # Compute total physical distance
                tot_dist = 0.0
                for i in range(len(path) - 1):
                    n1 = nodes[path[i]]
                    n2 = nodes[path[i + 1]]
                    tot_dist += haversine_distance_meters(n1.lat, n1.lon, n2.lat, n2.lon)
                return path, tot_dist

            if current in visited:
                continue
            visited.add(current)

            for neighbor, physical_dist in adjacency[current]:
                if neighbor in visited:
                    continue

                nbr_node = nodes[neighbor]

                if mode == "direct":
                    edge_weight = physical_dist
                    h_scale = 1.0
                else:
                    # Cool mode cost function:
                    # Penalize surface anomaly > 0 (heat penalty multiplier up to +4.5x)
                    # Reward high canopy cover (discount up to 60%)
                    heat_penalty = max(0.0, nbr_node.anomaly_c) * 1.5
                    canopy_discount = min(0.6, (nbr_node.canopy_pct / 100.0) * 0.8)
                    multiplier = max(0.2, 1.0 + heat_penalty - canopy_discount)
                    edge_weight = physical_dist * multiplier
                    h_scale = 0.2

                tentative_g = current_g + edge_weight

                if tentative_g < g_scores.get(neighbor, float("inf")):
                    g_scores[neighbor] = tentative_g
                    # Admissible heuristic: straight-line distance * min_scale
                    h = haversine_distance_meters(nbr_node.lat, nbr_node.lon, nodes[goal].lat, nodes[goal].lon) * h_scale
                    f_score = tentative_g + h
                    heapq.heappush(open_set, (f_score, tentative_g, neighbor, path + [neighbor]))

        # Fallback to direct path
        return [start, goal], haversine_distance_meters(nodes[start].lat, nodes[start].lon, nodes[goal].lat, nodes[goal].lon)

    @classmethod
    def _calculate_path_metrics(
        cls,
        nodes: Dict[str, RoutingNode],
        path: List[str],
        distance_meters: float,
    ) -> Dict[str, Any]:
        """Aggregates thermal and spatial metrics along a route."""
        path_nodes = [nodes[nid] for nid in path]

        # Walking speed: 4.5 km/h = 75 meters / minute
        duration_mins = round(distance_meters / 75.0, 1)

        avg_anomaly = sum(n.anomaly_c for n in path_nodes) / max(1, len(path_nodes))
        avg_canopy = sum(n.canopy_pct for n in path_nodes) / max(1, len(path_nodes))

        # Base ambient in Chennai summer: 38.5°C
        base_ambient = 38.5
        avg_apparent = round(base_ambient + avg_anomaly, 1)

        # Waypoints for map rendering
        waypoints = [
            {
                "lat": n.lat,
                "lon": n.lon,
                "anomaly_c": n.anomaly_c,
                "canopy_pct": n.canopy_pct,
                "is_water_point": n.is_water_point,
                "is_shelter": n.is_cooling_shelter,
                "name": n.name,
            }
            for n in path_nodes
        ]

        # GeoJSON LineString geometry
        geojson = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[n.lon, n.lat] for n in path_nodes],
            },
            "properties": {
                "distance_meters": round(distance_meters),
                "duration_mins": duration_mins,
                "avg_apparent_temp_c": avg_apparent,
                "canopy_coverage_pct": round(avg_canopy, 1),
            },
        }

        return {
            "distance_meters": round(distance_meters),
            "distance_km": round(distance_meters / 1000.0, 2),
            "duration_mins": duration_mins,
            "avg_apparent_temp_c": avg_apparent,
            "avg_anomaly_c": round(avg_anomaly, 2),
            "canopy_coverage_pct": round(avg_canopy, 1),
            "sun_exposed_pct": round(max(0, 100.0 - avg_canopy), 1),
            "waypoints_count": len(path_nodes),
            "waypoints": waypoints,
            "geojson": geojson,
        }

    @classmethod
    def get_public_refuges(cls) -> Dict[str, Any]:
        """Returns all public hydration stations, misting zones, and cooling centers in Chennai."""
        refuges = [
            {"id": "REF-01", "name": "Panagal Park Shaded Public Plaza", "type": "PARK_OASIS", "lat": 13.0401, "lon": 80.2310, "facilities": ["Tree Canopy > 60%", "Earthen Pot Water", "Rest Benches"]},
            {"id": "REF-02", "name": "Natesan Park Misting Canopy", "type": "PARK_OASIS", "lat": 13.0375, "lon": 80.2340, "facilities": ["High-Flow Misting", "HVAC Pavilion", "Free ORS"]},
            {"id": "REF-03", "name": "Eldams Road Community Cooling Hall", "type": "COOLING_CENTER", "lat": 13.0425, "lon": 80.2450, "facilities": ["Full Air Conditioning", "Medical Doctor", "Oxygen Beds"]},
            {"id": "REF-04", "name": "T. Nagar Bus Terminus Hydration Kiosk", "type": "WATER_KIOSK", "lat": 13.0350, "lon": 80.2320, "facilities": ["Chilled RO Water", "Electrolyte Packets"]},
            {"id": "REF-05", "name": "DMS Metro Station Concourse", "type": "TRANSIT_REFUGE", "lat": 13.0440, "lon": 80.2480, "facilities": ["Underground Air Conditioning", "Water ATM"]},
        ]
        return {
            "total_refuges": len(refuges),
            "refuges": refuges,
        }
