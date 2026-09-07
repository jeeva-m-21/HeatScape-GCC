"""
Terrain & Urban Microclimate Service for Greater Chennai Corporation (GCC).
Provides high-fidelity 3D elevation profiles, Bay of Bengal sea breeze penetration index,
and urban street canyon aerodynamic & thermal entrapment modeling.
Compatible with Google Cloud Platform (GCP) 3D elevation data and OGC standards.
"""

import math
from typing import List, Dict, Any, Optional, Tuple


class TerrainService:
    """
    Simulates high-precision topography and microclimate dynamics for Chennai.
    Includes coastal elevation gradients, prominent hills (St. Thomas Mount, Pallavaram Ridge),
    sea breeze marine boundary layer intrusion, and urban street canyon microclimate metrics.
    """

    # Reference transects across Greater Chennai Corporation
    TRANSECTS = {
        "coastal-to-inland": {
            "name": "Marina Coast to Porur Continental Transect",
            "start": {"lat": 13.0500, "lon": 80.2824, "label": "Marina Beach (Coast)"},
            "end": {"lat": 13.0350, "lon": 80.1550, "label": "Porur Lake (Inland)"},
            "description": "Traverses Marina, Triplicane, Anna Salai, T. Nagar commercial core, and Porur inland hub.",
        },
        "north-south-it-corridor": {
            "name": "Port to OMR IT Corridor Transect",
            "start": {"lat": 13.0900, "lon": 80.2900, "label": "Chennai Port (North)"},
            "end": {"lat": 12.9000, "lon": 80.2280, "label": "Sholinganallur OMR (South)"},
            "description": "North-South industrial to tech corridor spanning Adyar basin and Pallikaranai marsh fringe.",
        },
        "adyar-river-valley": {
            "name": "Adyar River Basin & Valley Transect",
            "start": {"lat": 13.0150, "lon": 80.1700, "label": "Nandambakkam Basin"},
            "end": {"lat": 13.0080, "lon": 80.2720, "label": "Adyar Estuary (Besant Nagar)"},
            "description": "East-West hydrological valley illustrating natural ventilation corridors into the city core.",
        },
    }

    # Prominent topographic landmarks in Chennai for Gaussian hill superposition
    TOPOGRAPHIC_FEATURES = [
        {"name": "St. Thomas Mount", "lat": 12.9960, "lon": 80.1940, "peak_m": 62.0, "radius_deg": 0.012},
        {"name": "Pallavaram / Trisulam Ridge", "lat": 12.9650, "lon": 80.1550, "peak_m": 135.0, "radius_deg": 0.020},
        {"name": "Nanmangalam Ridge", "lat": 12.9250, "lon": 80.1750, "peak_m": 72.0, "radius_deg": 0.016},
    ]

    # River depressions (negative relief)
    RIVER_DEPRESSIONS = [
        # Adyar river mouth to upstream
        {"lat": 13.0100, "lon": 80.2500, "drop_m": 3.5, "radius_deg": 0.010},
        # Cooum river corridor
        {"lat": 13.0750, "lon": 80.2400, "drop_m": 3.0, "radius_deg": 0.009},
    ]

    @classmethod
    def get_elevation_at_point(cls, lat: float, lon: float) -> float:
        """
        Calculates topographical elevation (meters above Mean Sea Level) at any coordinate in Chennai.
        Base gradient rises gently from coast (~2m at 80.28°E) westward to ~25m at 80.05°E.
        """
        # Distance inland from Chennai coast reference (lon 80.282)
        coast_lon = 80.282
        inland_dist_deg = max(0.0, coast_lon - lon)
        # Regional slope: ~2.5m near coast, rising ~70m per degree (~0.65m / km) westward
        base_elevation = 2.8 + (inland_dist_deg * 75.0)

        # Micro undulating topography using deterministic spatial harmonics
        harmonic_noise = (
            math.sin(lat * 120.0) * 1.8
            + math.cos(lon * 110.0) * 1.5
            + math.sin((lat + lon) * 160.0) * 1.0
        )
        elevation = base_elevation + harmonic_noise

        # Superpose prominent volcanic / charnockite hills
        for hill in cls.TOPOGRAPHIC_FEATURES:
            d_lat = lat - hill["lat"]
            d_lon = lon - hill["lon"]
            dist_sq = d_lat * d_lat + d_lon * d_lon
            r_sq = hill["radius_deg"] * hill["radius_deg"]
            if dist_sq < (r_sq * 4.0):
                gaussian_boost = hill["peak_m"] * math.exp(-dist_sq / (2.0 * r_sq))
                elevation += gaussian_boost

        # Superpose river corridors
        for river in cls.RIVER_DEPRESSIONS:
            d_lat = lat - river["lat"]
            d_lon = lon - river["lon"]
            dist_sq = d_lat * d_lat + d_lon * d_lon
            r_sq = river["radius_deg"] * river["radius_deg"]
            if dist_sq < (r_sq * 3.0):
                depression = river["drop_m"] * math.exp(-dist_sq / (2.0 * r_sq))
                elevation = max(1.2, elevation - depression)

        # Ensure coastal thresholding
        if lon >= 80.285:
            elevation = min(elevation, 3.5)
        return round(max(1.0, elevation), 2)

    @classmethod
    def calculate_sea_breeze_penetration(
        cls,
        lat: float,
        lon: float,
        coastal_wind_speed_ms: float = 3.8,
        inland_air_temp_c: float = 39.5,
        sea_surface_temp_c: float = 29.5,
        hour_of_day: int = 14,
    ) -> Dict[str, Any]:
        """
        Computes Bay of Bengal Sea Breeze (BBSB) intrusion dynamics at coordinate (lat, lon).
        Physical parameters:
        - Thermal contrast: delta_T = inland_air_temp_c - sea_surface_temp_c
        - Sea breeze typically initiates around 11:30 IST, peaks 14:00 - 16:30 IST, and retreats after 19:30.
        - Penetration depth scales with thermal contrast and friction deceleration by urban roughness.
        """
        coast_lon = 80.285
        dist_to_coast_km = max(0.0, (coast_lon - lon) * 111.0 * math.cos(math.radians(lat)))

        # Time-of-day sea breeze intensity factor (Bell curve peaking at 14:30)
        if 11 <= hour_of_day <= 20:
            time_factor = math.exp(-((hour_of_day - 14.5) ** 2) / 8.0)
        else:
            time_factor = 0.05

        delta_t = max(0.0, inland_air_temp_c - sea_surface_temp_c)
        # Theoretical max penetration distance (km) under thermal contrast
        max_penetration_km = (2.2 * math.sqrt(delta_t) * (coastal_wind_speed_ms / 3.0)) * 3.2

        # Urban roughness friction decay factor (high-density Chennai urban fabric slows front)
        local_elevation = cls.get_elevation_at_point(lat, lon)
        elevation_resistance = 1.0 + (local_elevation / 100.0) * 0.4

        # Is the point currently within the active sea breeze marine cooling front?
        effective_reach_km = max_penetration_km * time_factor / elevation_resistance
        is_reached = dist_to_coast_km <= effective_reach_km

        if is_reached:
            # Cooling relief: coastal zone gets up to 3.6°C cooling, decaying with inland distance
            penetration_ratio = dist_to_coast_km / max(1.0, effective_reach_km)
            cooling_relief_c = round(
                (3.6 * (1.0 - penetration_ratio * 0.75)) * time_factor, 2
            )
            local_wind_speed = round(
                max(0.8, coastal_wind_speed_ms * (1.0 - penetration_ratio * 0.65)), 1
            )
            humidity_boost_pct = round(
                (24.0 * (1.0 - penetration_ratio * 0.7)) * time_factor, 1
            )
            # Front arrival time estimation (assumes ~12 km/h front speed starting at 11:30 IST)
            hours_to_travel = dist_to_coast_km / 12.0
            arrival_decimal = 11.5 + hours_to_travel
            arrival_hr = int(arrival_decimal)
            arrival_min = int((arrival_decimal - arrival_hr) * 60)
            front_arrival_time = f"{arrival_hr:02d}:{arrival_min:02d} IST"
            status = "ACTIVE_SEA_BREEZE_ZONE"
        else:
            cooling_relief_c = 0.0
            local_wind_speed = 1.1
            humidity_boost_pct = 0.0
            front_arrival_time = "NO_FRONTAL_REACH"
            status = "INLAND_STAGNANT_CORE"

        return {
            "dist_to_coast_km": round(dist_to_coast_km, 2),
            "elevation_m": local_elevation,
            "status": status,
            "is_sea_breeze_active": is_reached,
            "cooling_relief_c": cooling_relief_c,
            "effective_air_temp_c": round(inland_air_temp_c - cooling_relief_c, 2),
            "local_wind_speed_ms": local_wind_speed,
            "humidity_boost_pct": humidity_boost_pct,
            "max_penetration_reach_km": round(effective_reach_km, 2),
            "front_arrival_time": front_arrival_time,
            "marine_boundary_layer_depth_m": round(max(80.0, 450.0 - dist_to_coast_km * 18.0), 1),
        }

    @classmethod
    def get_transect_profile(
        cls,
        transect_id: Optional[str] = "coastal-to-inland",
        custom_start: Optional[Tuple[float, float]] = None,
        custom_end: Optional[Tuple[float, float]] = None,
        steps: int = 40,
    ) -> Dict[str, Any]:
        """
        Generates a high-resolution cross-sectional elevation & microclimate transect.
        Returns elevation series, slope gradient, sea breeze penetration curve, and land use typology.
        """
        if custom_start and custom_end:
            start_lat, start_lon = custom_start
            end_lat, end_lon = custom_end
            name = "Custom GCC Transect"
            description = f"Interpolated transect between ({start_lat:.4f}, {start_lon:.4f}) and ({end_lat:.4f}, {end_lon:.4f})"
        elif transect_id in cls.TRANSECTS:
            t = cls.TRANSECTS[transect_id]
            start_lat, start_lon = t["start"]["lat"], t["start"]["lon"]
            end_lat, end_lon = t["end"]["lat"], t["end"]["lon"]
            name = t["name"]
            description = t["description"]
        else:
            raise ValueError(f"Unknown transect_id '{transect_id}'. Available: {list(cls.TRANSECTS.keys())}")

        points = []
        total_dist_km = 0.0

        for i in range(steps + 1):
            t = i / steps
            lat = start_lat + (end_lat - start_lat) * t
            lon = start_lon + (end_lon - start_lon) * t

            elevation = cls.get_elevation_at_point(lat, lon)
            sb = cls.calculate_sea_breeze_penetration(lat, lon)

            if i > 0:
                prev = points[i - 1]
                dx = (lon - prev["lon"]) * 111.0 * math.cos(math.radians(lat))
                dy = (lat - prev["lat"]) * 111.0
                step_dist = math.hypot(dx, dy)
                total_dist_km += step_dist
                elev_change = elevation - prev["elevation_m"]
                slope_pct = (elev_change / (step_dist * 1000.0)) * 100.0 if step_dist > 0 else 0.0
            else:
                total_dist_km = 0.0
                slope_pct = 0.0

            # Estimate land use category along Chennai transects
            if lon >= 80.275:
                land_use = "Coastal Beach & Promenade"
                building_height_avg = 8.0
            elif lon >= 80.240:
                land_use = "Dense Commercial & Historical Core"
                building_height_avg = 22.0
            elif lon >= 80.190:
                land_use = "Mixed High-Density Urban & Rail Transit"
                building_height_avg = 16.0
            else:
                land_use = "Suburban Residential & Lake Environs"
                building_height_avg = 12.0

            points.append({
                "step_index": i,
                "cumulative_dist_km": round(total_dist_km, 2),
                "lat": round(lat, 5),
                "lon": round(lon, 5),
                "elevation_m": elevation,
                "slope_pct": round(slope_pct, 2),
                "sea_breeze_cooling_c": sb["cooling_relief_c"],
                "ambient_temp_c": sb["effective_air_temp_c"],
                "wind_speed_ms": sb["local_wind_speed_ms"],
                "is_sea_breeze_active": sb["is_sea_breeze_active"],
                "land_use": land_use,
                "building_height_avg_m": building_height_avg,
            })

        min_elev = min(p["elevation_m"] for p in points)
        max_elev = max(p["elevation_m"] for p in points)
        max_cooling = max(p["sea_breeze_cooling_c"] for p in points)

        return {
            "transect_id": transect_id,
            "name": name,
            "description": description,
            "total_distance_km": round(total_dist_km, 2),
            "min_elevation_m": min_elev,
            "max_elevation_m": max_elev,
            "elevation_gain_m": round(max_elev - min_elev, 2),
            "max_sea_breeze_relief_c": max_cooling,
            "profile_points": points,
        }

    @classmethod
    def analyze_street_canyon(
        cls,
        building_height_m: float,
        street_width_m: float,
        canyon_orientation_deg: float,
        ambient_wind_speed_ms: float = 3.0,
        ambient_wind_dir_deg: float = 90.0,
        solar_altitude_deg: float = 65.0,
        solar_azimuth_deg: float = 180.0,
    ) -> Dict[str, Any]:
        """
        Analyzes microclimate dynamics inside an urban street canyon:
        - Aspect Ratio (H/W) and Oke (1988) flow regime
        - Sky View Factor (SVF)
        - Thermal Entrapment Index (0 to 100)
        - Pedestrian level wind attenuation
        """
        hw_ratio = building_height_m / max(1.0, street_width_m)

        # Oke Sky View Factor formula for continuous infinite 2D canyon
        svf = math.cos(math.atan(2.0 * hw_ratio))
        svf = round(max(0.05, min(0.99, svf)), 3)

        # Flow regime categorization
        if hw_ratio < 0.30:
            flow_regime = "ISOLATED_ROUGHNESS"
            flow_desc = "Good natural ventilation; building wakes dissipate freely without trapping."
        elif hw_ratio < 0.65:
            flow_regime = "WAKE_INTERFERENCE"
            flow_desc = "Moderate ventilation; downward eddies from upwind buildings penetrate street."
        else:
            flow_regime = "SKIMMING_FLOW"
            flow_desc = "Severe canyon entrapment; airflow decouples above rooftop, trapping ground heat."

        canyon_axis = canyon_orientation_deg % 180.0
        wind_axis = ambient_wind_dir_deg % 180.0
        angle_diff = abs(canyon_axis - wind_axis)
        if angle_diff > 90.0:
            angle_diff = 180.0 - angle_diff

        alignment_factor = math.cos(math.radians(angle_diff))
        if flow_regime == "SKIMMING_FLOW":
            canyon_wind_speed = ambient_wind_speed_ms * (0.20 + 0.35 * abs(alignment_factor))
        elif flow_regime == "WAKE_INTERFERENCE":
            canyon_wind_speed = ambient_wind_speed_ms * (0.35 + 0.40 * abs(alignment_factor))
        else:
            canyon_wind_speed = ambient_wind_speed_ms * (0.55 + 0.35 * abs(alignment_factor))
        canyon_wind_speed = round(max(0.4, canyon_wind_speed), 2)

        trapping_score = (
            (1.0 - svf) * 45.0
            + min(1.0, hw_ratio / 2.0) * 30.0
            + (1.0 - abs(alignment_factor)) * 15.0
            + max(0.0, (3.0 - canyon_wind_speed) / 3.0) * 10.0
        )
        thermal_entrapment_index = round(max(5.0, min(98.0, trapping_score)), 1)
        urban_canopy_uhi_excess_c = round(3.5 * (1.0 - svf) + 1.2 * hw_ratio * 0.5, 2)

        recommended_interventions = []
        if hw_ratio >= 0.65:
            recommended_interventions.append("Vertical Green Wall retrofits on sunlit facades to prevent wall heat absorption")
            recommended_interventions.append("High-albedo reflective roof coatings to suppress convective downward heat pumping")
        if svf > 0.60:
            recommended_interventions.append("High-canopy native shade trees (Neem/Pungan) to block intense midday solar radiation")
        if alignment_factor < 0.4:
            recommended_interventions.append("Air funneling street-level shade sails with integrated evaporative misting cannons")

        return {
            "aspect_ratio_hw": round(hw_ratio, 2),
            "sky_view_factor": svf,
            "flow_regime": flow_regime,
            "flow_description": flow_desc,
            "wind_street_angle_deg": round(angle_diff, 1),
            "canyon_wind_speed_ms": canyon_wind_speed,
            "wind_attenuation_pct": round((1.0 - (canyon_wind_speed / max(0.1, ambient_wind_speed_ms))) * 100.0, 1),
            "thermal_entrapment_index": thermal_entrapment_index,
            "nocturnal_uhi_excess_c": urban_canopy_uhi_excess_c,
            "recommended_interventions": recommended_interventions,
        }

    @classmethod
    def generate_3d_terrain_grid(
        cls,
        grid_rows: int = 15,
        grid_cols: int = 15,
        bbox: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Generates a 3D elevation and microclimate point mesh for Greater Chennai Corporation.
        Formats mesh coordinates with elevation, sea breeze cooling potential, and canyon density.
        Matches Deck.gl Hexagon/GridLayer or MapLibre 3D Terrain format.
        """
        default_bbox = {
            "min_lat": 12.92,
            "max_lat": 13.18,
            "min_lon": 80.12,
            "max_lon": 80.29,
        }
        bounds = bbox or default_bbox

        lat_step = (bounds["max_lat"] - bounds["min_lat"]) / (grid_rows - 1)
        lon_step = (bounds["max_lon"] - bounds["min_lon"]) / (grid_cols - 1)

        mesh_points = []
        for r in range(grid_rows):
            lat = bounds["min_lat"] + r * lat_step
            for c in range(grid_cols):
                lon = bounds["min_lon"] + c * lon_step
                elevation = cls.get_elevation_at_point(lat, lon)
                sb = cls.calculate_sea_breeze_penetration(lat, lon)

                is_core = (13.00 <= lat <= 13.09) and (80.20 <= lon <= 80.28)
                estimated_canyon_hw = 1.4 if is_core else 0.45

                mesh_points.append({
                    "row": r,
                    "col": c,
                    "lat": round(lat, 5),
                    "lon": round(lon, 5),
                    "elevation_m": elevation,
                    "sea_breeze_cooling_c": sb["cooling_relief_c"],
                    "surface_temp_adjusted_c": sb["effective_air_temp_c"],
                    "is_marine_cooled": sb["is_sea_breeze_active"],
                    "canyon_hw_estimate": estimated_canyon_hw,
                })

        return {
            "grid_dimensions": {"rows": grid_rows, "cols": grid_cols, "total_nodes": len(mesh_points)},
            "bbox": bounds,
            "crs": "EPSG:4326",
            "vertical_datum": "EGM96 (Mean Sea Level)",
            "gcp_3d_elevation_mode": "SYNTHETIC_CALIBRATED_SRTM30",
            "nodes": mesh_points,
        }
