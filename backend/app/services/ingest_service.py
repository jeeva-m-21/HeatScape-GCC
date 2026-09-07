"""Earth Observation Satellite Data Ingestion & STAC Pipeline Service.

Simulates automated ingestion and processing of multi-spectral satellite imagery
from Landsat-9 TIRS-2 (Thermal Infrared) and Sentinel-2 MSI (Multi-Spectral Instrument)
covering the Chennai Metropolitan Region (Path 142 / Row 051, Tile 44VPA).
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any
import math
import random


def calculate_ndvi(nir_reflectance: float, red_reflectance: float) -> float:
    """Computes Normalized Difference Vegetation Index (NDVI).
    NDVI = (NIR - Red) / (NIR + Red)
    """
    denominator = nir_reflectance + red_reflectance
    if denominator == 0:
        return 0.0
    ndvi = (nir_reflectance - red_reflectance) / denominator
    return round(max(-1.0, min(1.0, ndvi)), 3)


def calculate_lst_from_radiance(
    toa_radiance: float,
    surface_emissivity: float = 0.97,
    k1: float = 774.8853,
    k2: float = 1321.0789,
) -> float:
    """Converts Top of Atmosphere (TOA) spectral radiance to Land Surface Temperature (LST in Celsius)
    using Landsat-9 TIRS Band 10 calibration constants.
    Formula:
      T_b = K2 / ln((K1 / L_lambda) + 1)
      LST = T_b / (1 + (lambda * T_b / rho) * ln(epsilon)) - 273.15
    """
    if toa_radiance <= 0:
        return 30.0
    # Brightness temperature in Kelvin
    t_brightness_k = k2 / math.log((k1 / toa_radiance) + 1.0)
    wavelength = 10.895e-6  # Center wavelength of Band 10 in meters
    rho = 1.438e-2  # h * c / sigma
    lst_k = t_brightness_k / (1.0 + (wavelength * t_brightness_k / rho) * math.log(surface_emissivity))
    lst_c = lst_k - 273.15
    return round(lst_c, 2)


class SatelliteIngestService:
    """Core domain service for Earth Observation satellite data ingestion and ground calibration."""

    @classmethod
    def get_satellite_status(cls) -> Dict[str, Any]:
        """Returns the status of Earth Observation satellite constellations monitoring Chennai."""
        now = datetime.now()
        
        recent_acquisitions = [
            {
                "satellite": "Landsat-9 OLI-2 / TIRS-2",
                "agency": "USGS / NASA",
                "scene_id": "LC09_L2SP_142051_20260907_02_T1",
                "orbit_path": 142,
                "orbit_row": 51,
                "acquisition_time": (now - timedelta(hours=14, minutes=20)).strftime("%Y-%m-%d %H:%M:%S IST"),
                "cloud_cover_pct": 4.2,
                "sun_elevation_deg": 64.8,
                "sun_azimuth_deg": 118.2,
                "thermal_bands": ["Band 10 (10.6 - 11.19 µm)"],
                "resolution_meters": 30.0,
                "status": "PROCESSED_AND_GRIDDED",
            },
            {
                "satellite": "Sentinel-2B MSI",
                "agency": "ESA Copernicus",
                "scene_id": "S2B_MSIL2A_20260906T045709_N0500_R119_T44VPA",
                "tile_id": "44VPA",
                "acquisition_time": (now - timedelta(days=1, hours=8)).strftime("%Y-%m-%d %H:%M:%S IST"),
                "cloud_cover_pct": 6.8,
                "sun_elevation_deg": 62.1,
                "sun_azimuth_deg": 121.5,
                "multispectral_bands": ["B4 (Red)", "B8 (NIR)", "B11 (SWIR)"],
                "resolution_meters": 10.0,
                "status": "NDVI_CALIBRATED",
            },
            {
                "satellite": "Landsat-8 OLI / TIRS",
                "agency": "USGS / NASA",
                "scene_id": "LC08_L2SP_142051_20260830_02_T1",
                "orbit_path": 142,
                "orbit_row": 51,
                "acquisition_time": (now - timedelta(days=8)).strftime("%Y-%m-%d %H:%M:%S IST"),
                "cloud_cover_pct": 8.1,
                "thermal_bands": ["Band 10", "Band 11"],
                "resolution_meters": 30.0,
                "status": "ARCHIVED",
            },
        ]

        upcoming_overpasses = [
            {
                "satellite": "Sentinel-2A MSI",
                "expected_overpass": (now + timedelta(days=2, hours=4)).strftime("%Y-%m-%d %H:%M IST"),
                "revisit_interval_days": 5,
                "target_product": "High-Resolution 10m Urban Vegetation & Water Index",
            },
            {
                "satellite": "Landsat-9 TIRS-2",
                "expected_overpass": (now + timedelta(days=6, hours=3)).strftime("%Y-%m-%d %H:%M IST"),
                "revisit_interval_days": 16,
                "target_product": "Radiometric Land Surface Temperature Calibrated Mesh",
            },
            {
                "satellite": "Landsat-8 TIRS",
                "expected_overpass": (now + timedelta(days=14, hours=3)).strftime("%Y-%m-%d %H:%M IST"),
                "revisit_interval_days": 16,
                "target_product": "Spatiotemporal Thermal Verification Baseline",
            },
        ]

        return {
            "ingest_engine": "HeatScape STAC Ingest Engine v2.4 (Copernicus / USGS EarthExplorer Hook)",
            "monitored_region": "Greater Chennai Corporation (EPSG:32644 UTM Zone 44N)",
            "total_scenes_indexed": 482,
            "mean_cloud_cover_pct": 5.4,
            "recent_acquisitions": recent_acquisitions,
            "upcoming_overpasses": upcoming_overpasses,
        }

    @classmethod
    def trigger_simulated_overpass(cls) -> Dict[str, Any]:
        """Simulates an automated satellite overpass acquisition, downloading raster tiles,
        clipping to Chennai's 15 zones, computing NDVI and LST, and updating the 100m² grid.
        """
        now = datetime.now()
        scene_id = f"LC09_L2SP_142051_{now.strftime('%Y%m%d')}_02_T1"
        
        # Sample radiometric statistics
        total_cells_processed = 1200
        mean_lst_c = 41.2
        peak_lst_c = 46.8
        min_lst_c = 32.4
        mean_ndvi = 0.185

        # Simulating detected anomaly classifications
        new_emerging_cells = [
            {"cell_id": "CHE_ZONE_10_0381", "ward": "Ward 117 (T. Nagar)", "lst_c": 46.2, "anomaly_c": 4.8, "driver": "Asphalt Re-carpeting"},
            {"cell_id": "CHE_ZONE_09_0214", "ward": "Ward 118 (Teynampet)", "lst_c": 45.9, "anomaly_c": 4.5, "driver": "Canopy Deficit"},
            {"cell_id": "CHE_ZONE_05_0092", "ward": "Ward 049 (Royapuram)", "lst_c": 46.8, "anomaly_c": 5.2, "driver": "Port Container Yard Radiation"},
            {"cell_id": "CHE_ZONE_06_0144", "ward": "Ward 073 (Thiru-Vi-Ka Nagar)", "lst_c": 45.1, "anomaly_c": 4.1, "driver": "Industrial Rooftops"},
        ]

        return {
            "ingest_id": f"INGEST-{now.strftime('%Y%m%d-%H%M%S')}",
            "satellite": "Landsat-9 OLI-2 / TIRS-2",
            "scene_id": scene_id,
            "acquisition_timestamp": now.strftime("%Y-%m-%d %H:%M:%S IST"),
            "cloud_cover_pct": 3.6,
            "qc_status": "PASSED_QUALITY_CONTROL",
            "spatial_coverage": {
                "bbox_utm32644": [390000, 1430000, 420000, 1460000],
                "cells_updated": total_cells_processed,
                "grid_resolution": "100m x 100m (1.0 Hectare)",
            },
            "radiometric_summary": {
                "mean_surface_temp_c": mean_lst_c,
                "maximum_surface_temp_c": peak_lst_c,
                "minimum_surface_temp_c": min_lst_c,
                "mean_ndvi": mean_ndvi,
                "sensor_radiance_calibration": "USGS L2SP Calibration Coeffs",
            },
            "new_emerging_hotspots_detected": len(new_emerging_cells),
            "flagged_cells": new_emerging_cells,
            "next_pipeline_action": "Dispatched to OR-Tools Optimizer & EOC Heatwave Warning Engine",
        }

    @classmethod
    def get_sensors_vs_satellite_correlation(cls) -> Dict[str, Any]:
        """Provides ground-truthing comparison between Landsat-9 thermal observations
        and the 842 ground-level IoT microclimate sensors across Chennai.
        """
        pairs = [
            {"corridor": "Anna Salai (Mount Rd)", "satellite_lst_c": 43.8, "ground_sensor_c": 43.2, "delta_c": 0.6, "correlation": 0.96},
            {"corridor": "Usman Road (T. Nagar)", "satellite_lst_c": 45.4, "ground_sensor_c": 44.9, "delta_c": 0.5, "correlation": 0.95},
            {"corridor": "CIT Nagar South", "satellite_lst_c": 41.2, "ground_sensor_c": 40.8, "delta_c": 0.4, "correlation": 0.97},
            {"corridor": "Royapuram Port", "satellite_lst_c": 46.1, "ground_sensor_c": 45.6, "delta_c": 0.5, "correlation": 0.94},
            {"corridor": "Adyar Estuary Buffer", "satellite_lst_c": 36.5, "ground_sensor_c": 36.1, "delta_c": 0.4, "correlation": 0.98},
            {"corridor": "Anna Nagar Roundtana", "satellite_lst_c": 42.6, "ground_sensor_c": 42.1, "delta_c": 0.5, "correlation": 0.95},
            {"corridor": "Thiru-Vi-Ka Nagar Core", "satellite_lst_c": 44.2, "ground_sensor_c": 43.7, "delta_c": 0.5, "correlation": 0.93},
            {"corridor": "Chennai Central Intermodal", "satellite_lst_c": 44.9, "ground_sensor_c": 44.4, "delta_c": 0.5, "correlation": 0.96},
        ]

        mean_delta = sum(p["delta_c"] for p in pairs) / len(pairs)
        r_squared = 0.952

        return {
            "title": "Empirical Satellite vs Ground IoT Sensor Cross-Validation",
            "sample_nodes_evaluated": 842,
            "satellite_sensor": "Landsat-9 TIRS-2 Band 10",
            "ground_sensors": "GCC LoRaWAN IN865 Thermistor Array",
            "pearson_correlation_r2": r_squared,
            "mean_absolute_error_c": round(mean_delta, 2),
            "validation_verdict": "STRONG_AGREEMENT (R² = 0.952, MAE = 0.49°C)",
            "corridor_pairs": pairs,
        }
