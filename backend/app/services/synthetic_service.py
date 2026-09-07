import math
import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.services.grid_service import GridService
from app.services.trajectory_service import TrajectoryService


class SyntheticSeedService:
    """
    Generates high-fidelity offline seed data for Greater Chennai Corporation (GCC).
    Creates 1,200 analytical cells, 36 monthly observations per cell, and default intervention types.
    """

    DEFAULT_INTERVENTIONS = [
        {
            "id": "COOL_ROOF",
            "name": "High-Albedo Cool Roof Coating",
            "category": "Passive Albedo",
            "unit_name": "sq_m",
            "unit_cost_inr_low": 120.0,
            "unit_cost_inr_high": 180.0,
            "cooling_effect_per_unit_low": 0.0003,
            "cooling_effect_per_unit_high": 0.0006,
            "evidence_grade": "A",
            "maintenance_overhead_annual_inr": 15.0,
        },
        {
            "id": "URBAN_CANOPY",
            "name": "Native Urban Forest Canopy Planting",
            "category": "Nature-Based Solutions",
            "unit_name": "tree_count",
            "unit_cost_inr_low": 2500.0,
            "unit_cost_inr_high": 4000.0,
            "cooling_effect_per_unit_low": 0.015,
            "cooling_effect_per_unit_high": 0.035,
            "evidence_grade": "A",
            "maintenance_overhead_annual_inr": 300.0,
        },
        {
            "id": "COOL_PAVEMENT",
            "name": "Permeable Reflective Pavement",
            "category": "Pavement Modification",
            "unit_name": "sq_m",
            "unit_cost_inr_low": 450.0,
            "unit_cost_inr_high": 750.0,
            "cooling_effect_per_unit_low": 0.0002,
            "cooling_effect_per_unit_high": 0.0005,
            "evidence_grade": "B",
            "maintenance_overhead_annual_inr": 45.0,
        },
        {
            "id": "SHADE_CANOPY",
            "name": "Transit Hub Modular Shade Canopy",
            "category": "Engineered Shading",
            "unit_name": "canopy_count",
            "unit_cost_inr_low": 45000.0,
            "unit_cost_inr_high": 70000.0,
            "cooling_effect_per_unit_low": 0.20,
            "cooling_effect_per_unit_high": 0.45,
            "evidence_grade": "B",
            "maintenance_overhead_annual_inr": 3500.0,
        },
    ]

    @classmethod
    def generate_seed_cells(cls, count: int = 1200) -> List[Dict[str, Any]]:
        """
        Generates 1,200 cells clustered across Central (T. Nagar, Kodambakkam),
        North (George Town, Royapuram), and South (Adyar, Velachery, Guindy).
        """
        random.seed(42)
        np.random.seed(42)

        clusters = [
            {"zone": "ZONE_05_NORTH", "ward_prefix": "WARD_N", "center_lon": 80.280, "center_lat": 13.100, "count": 300},
            {"zone": "ZONE_08_CENTRAL", "ward_prefix": "WARD_C", "center_lon": 80.230, "center_lat": 13.040, "count": 500},
            {"zone": "ZONE_13_SOUTH", "ward_prefix": "WARD_S", "center_lon": 80.220, "center_lat": 12.980, "count": 400},
        ]

        cells = []
        cell_index = 1

        for cl in clusters:
            c_easting, c_northing = GridService.wgs84_to_utm(cl["center_lon"], cl["center_lat"])
            grid_cols = int(math.sqrt(cl["count"])) + 2
            grid_rows = math.ceil(cl["count"] / grid_cols)

            generated = 0
            for r in range(grid_rows):
                for c in range(grid_cols):
                    if generated >= cl["count"]:
                        break

                    # 100m grid offset with slight jitter
                    offset_x = (c - grid_cols / 2) * 110.0
                    offset_y = (r - grid_rows / 2) * 110.0
                    easting = c_easting + offset_x
                    northing = c_northing + offset_y

                    # Create 100m polygon in UTM 32644
                    poly_utm = GridService.create_100m_cell_polygon(easting, northing)
                    poly_wgs84 = GridService.polygon_utm_to_wgs84(poly_utm)
                    lon, lat = poly_wgs84.centroid.x, poly_wgs84.centroid.y

                    ward_num = (generated % 15) + 1
                    ward_id = f"{cl['ward_prefix']}_{ward_num:02d}"
                    cell_id = f"CHE_{cl['zone'][:6]}_{cell_index:04d}"

                    # Built environment characteristics
                    bld_density = round(float(np.clip(np.random.normal(0.60, 0.15), 0.1, 0.85)), 2)
                    road_density = round(float(np.clip(np.random.normal(0.20, 0.05), 0.05, 0.35)), 2)
                    impervious = round(min(0.98, bld_density + road_density + random.uniform(0.02, 0.08)), 2)
                    tree_canopy = round(float(np.clip(1.0 - impervious - random.uniform(0.0, 0.05), 0.01, 0.40)), 2)
                    roof_area = round(10000.0 * bld_density * random.uniform(0.8, 1.0), 1)

                    # Demographics & sites
                    pop_density = round(float(np.random.uniform(8000, 35000)), 0)
                    pop = int(pop_density * 0.01)  # 0.01 sq km per cell
                    sensitive_count = int(np.random.choice([0, 1, 2, 3], p=[0.6, 0.25, 0.1, 0.05]))
                    water_dist = round(float(np.random.uniform(150, 4500)), 1)
                    elev = round(float(np.clip(np.random.normal(9.0, 4.0), 2.0, 35.0)), 1)

                    cells.append({
                        "id": cell_id,
                        "centroid_lat": lat,
                        "centroid_lon": lon,
                        "ward_id": ward_id,
                        "zone_id": cl["zone"],
                        "building_density": bld_density,
                        "road_density": road_density,
                        "impervious_fraction": impervious,
                        "tree_canopy_fraction": tree_canopy,
                        "roof_area_sqm": roof_area,
                        "water_distance_m": water_dist,
                        "elevation_m": elev,
                        "population": pop,
                        "population_density_sqkm": pop_density,
                        "sensitive_site_count": sensitive_count,
                        "poly_utm": poly_utm,
                        "poly_wgs84": poly_wgs84,
                    })
                    cell_index += 1
                    generated += 1

        return cells

    @classmethod
    def generate_cell_observations(cls, cell_id: str, archetype: str) -> List[Dict[str, Any]]:
        """
        Generates 36 monthly observations for a cell based on its assigned thermal archetype:
        - EMERGING (20%): Accelerating positive anomaly in months 19-36
        - PERSISTENT (20%): High positive anomaly throughout (+2.5°C)
        - IMPROVING (10%): Monotonic cooling trend
        - TEMPORARY (15%): Recent brief spike, low recurrence
        - WATCH (35%): High volatility or mild normal fluctuations
        """
        start_date = datetime(2022, 1, 15)
        obs = []

        for m in range(36):
            obs_date = start_date + timedelta(days=int(m * 30.4375))
            month_num = obs_date.month

            # Chennai seasonal cycle: May is peak summer (38-42°C), Jan is mild (29-31°C)
            seasonal_base = 31.0 + 7.5 * math.sin(math.pi * (month_num - 1) / 6.0 - 0.5)

            # Archetype anomaly model
            if archetype == "EMERGING":
                # Flat early, then rapid heating + regime shift
                if m < 18:
                    anom = random.gauss(0.2, 0.4)
                    ndvi = 0.28 + random.gauss(0, 0.02)
                else:
                    anom = 1.0 + 0.12 * (m - 18) + random.gauss(0, 0.3)
                    ndvi = max(0.05, 0.28 - 0.01 * (m - 18))
            elif archetype == "PERSISTENT":
                anom = 2.4 + random.gauss(0, 0.4)
                ndvi = 0.10 + random.gauss(0, 0.02)
            elif archetype == "IMPROVING":
                anom = 2.5 - 0.08 * m + random.gauss(0, 0.3)
                ndvi = min(0.45, 0.15 + 0.007 * m)
            elif archetype == "TEMPORARY":
                if m >= 33:
                    anom = 2.8 + random.gauss(0, 0.3)
                else:
                    anom = random.gauss(0.1, 0.4)
                ndvi = 0.22 + random.gauss(0, 0.03)
            else:  # WATCH
                anom = random.gauss(0.4, 1.2)  # Higher volatility
                ndvi = 0.20 + random.gauss(0, 0.05)

            lst = seasonal_base + anom
            air_temp = lst - random.uniform(2.5, 4.5)
            rh = random.uniform(55.0, 82.0)
            spatial_anom = anom + random.gauss(0, 0.2)

            obs.append({
                "cell_id": cell_id,
                "observation_date": obs_date,
                "lst_celsius": round(lst, 2),
                "ndvi": round(float(np.clip(ndvi, 0.01, 0.85)), 3),
                "air_temp_2m": round(air_temp, 2),
                "relative_humidity_2m": round(rh, 1),
                "seasonal_baseline_lst": round(seasonal_base, 2),
                "contextual_anomaly_celsius": round(anom, 2),
                "spatial_anomaly_celsius": round(spatial_anom, 2),
                "cloud_mask_qa": "VALID",
                "valid_pixel_fraction": 1.0,
            })

        return obs
