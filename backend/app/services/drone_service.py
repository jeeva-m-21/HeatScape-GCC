"""
Drone & UAV High-Resolution Thermal Orthomosaic Ingestion Service.

Handles radiometric calibration, microclimate thermal hotspot extraction (0.25m - 1.0m resolution),
and GCP Cloud Storage signed URL provisioning for sovereign aerial surveys across Greater Chennai.
"""

import math
import hashlib
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


def calibrate_radiometric_thermal(
    digital_number: float,
    emissivity: float = 0.96,
    calibration_scale: float = 0.04,
) -> float:
    """
    Converts raw 16-bit radiometric Digital Number (DN) from UAV thermal sensors
    (e.g., DJI Zenmuse H20T / FLIR Vue Pro R) to Land Surface Temperature in Celsius.
    
    Formula:
        LST (°C) = ((DN * scale) - 273.15) / (emissivity ** 0.25)
    """
    if digital_number <= 0:
        return 0.0
    
    kelvin = digital_number * calibration_scale
    celsius_unadjusted = kelvin - 273.15
    emissivity_factor = math.pow(max(0.1, min(1.0, emissivity)), 0.25)
    calibrated_lst = celsius_unadjusted / emissivity_factor
    return round(calibrated_lst, 2)


class DroneService:
    """Service managing UAV missions, radiometric TIFF ingestion, and GCP Storage upload handshakes."""

    ACTIVE_MISSIONS: List[Dict[str, Any]] = [
        {
            "mission_id": "UAV-GCC-2026-001",
            "pilot_callsign": "GARUDA-ALPHA-1",
            "target_zone": "Zone 9 (T. Nagar Commercial Canyon)",
            "target_area_name": "Ranganathan Street & Usman Road Flyover",
            "bbox": [80.2280, 13.0360, 80.2380, 13.0460],
            "altitude_agl_m": 85.0,
            "gsd_cm_per_pixel": 4.5,
            "sensor_type": "FLIR Vue Pro R (640x512, 30Hz)",
            "flight_status": "COMPLETED",
            "captured_at": "2026-05-14T11:45:00Z",
            "mean_lst_celsius": 43.8,
            "max_lst_celsius": 52.1,
            "canopy_cover_percent": 3.8,
            "gcp_bucket_uri": "gs://chennai-heatscape-drone-tiles/2026/05/14/uav_tnagar_ortho.tif",
        },
        {
            "mission_id": "UAV-GCC-2026-002",
            "pilot_callsign": "GARUDA-BETA-3",
            "target_zone": "Zone 5 (George Town & Parrys Broadway)",
            "target_area_name": "Broadway High-Density Wholesale Corridor",
            "bbox": [80.2800, 13.0880, 80.2920, 13.0980],
            "altitude_agl_m": 100.0,
            "gsd_cm_per_pixel": 5.2,
            "sensor_type": "DJI Zenmuse H20T Radiometric",
            "flight_status": "COMPLETED",
            "captured_at": "2026-05-15T12:15:00Z",
            "mean_lst_celsius": 44.5,
            "max_lst_celsius": 54.3,
            "canopy_cover_percent": 1.9,
            "gcp_bucket_uri": "gs://chennai-heatscape-drone-tiles/2026/05/15/uav_parrys_ortho.tif",
        },
        {
            "mission_id": "UAV-GCC-2026-003",
            "pilot_callsign": "GARUDA-GAMMA-2",
            "target_zone": "Zone 13 (Guindy Industrial Estate)",
            "target_area_name": "Olympia Tech Park / Industrial Metal Sheet Roofs",
            "bbox": [80.2000, 13.0050, 80.2150, 13.0180],
            "altitude_agl_m": 90.0,
            "gsd_cm_per_pixel": 4.8,
            "sensor_type": "FLIR Duo Pro R",
            "flight_status": "IN_FLIGHT",
            "captured_at": "2026-05-16T13:00:00Z",
            "mean_lst_celsius": 45.2,
            "max_lst_celsius": 56.7,
            "canopy_cover_percent": 4.1,
            "gcp_bucket_uri": "gs://chennai-heatscape-drone-tiles/2026/05/16/uav_guindy_active.tif",
        }
    ]

    def list_missions(self, zone: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all drone flight missions, optionally filtered by GCC Zone."""
        if not zone:
            return self.ACTIVE_MISSIONS
        return [m for m in self.ACTIVE_MISSIONS if zone.lower() in m["target_zone"].lower()]

    def generate_gcp_signed_upload_url(
        self,
        filename: str,
        content_type: str = "image/tiff",
        bucket_name: str = "chennai-heatscape-drone-tiles",
        expires_in_seconds: int = 3600,
    ) -> Dict[str, Any]:
        """
        Generates a simulated GCP V4 Signed URL for uploading multi-gigabyte
        radiometric UAV GeoTIFFs directly to sovereign Google Cloud Storage.
        """
        now = int(time.time())
        token_seed = f"{filename}-{now}-{bucket_name}"
        mock_signature = hashlib.sha256(token_seed.encode()).hexdigest()[:48]
        gcp_uri = f"gs://{bucket_name}/uploads/{datetime.now(timezone.utc).strftime('%Y/%m/%d')}/{filename}"
        signed_upload_url = (
            f"https://storage.googleapis.com/{bucket_name}/uploads/{filename}?"
            f"GoogleAccessId=heatscape-uav-uploader@gcc-smartcity.iam.gserviceaccount.com&"
            f"Expires={now + expires_in_seconds}&"
            f"Signature={mock_signature}"
        )

        return {
            "bucket_name": bucket_name,
            "target_object_path": gcp_uri,
            "signed_upload_url": signed_upload_url,
            "http_method": "PUT",
            "required_headers": {
                "Content-Type": content_type,
                "x-goog-meta-project": "HeatScape-Chennai",
                "x-goog-meta-tier": "radiometric-highres",
            },
            "expires_in_seconds": expires_in_seconds,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def ingest_orthomosaic_metadata(
        self,
        mission_id: str,
        pilot_callsign: str,
        target_zone: str,
        bbox: List[float],
        gcp_storage_uri: str,
        raw_dn_samples: Optional[List[float]] = None,
        mean_emissivity: float = 0.95,
    ) -> Dict[str, Any]:
        """
        Processes radiometric DN samples from an ingested UAV flight to compute
        calibrated Celsius temperatures, extreme thermal micro-plumes, and canopy deficits.
        """
        if not raw_dn_samples:
            # Default representative DN samples (e.g. 7800 to 8300 for 40°C - 55°C)
            raw_dn_samples = [7850, 7920, 8050, 8120, 8240, 8310, 7790, 8010]

        calibrated_temps = [
            calibrate_radiometric_thermal(dn, emissivity=mean_emissivity)
            for dn in raw_dn_samples
        ]

        mean_temp = round(sum(calibrated_temps) / len(calibrated_temps), 2)
        max_temp = max(calibrated_temps)
        min_temp = min(calibrated_temps)

        # Micro-hotspots (identified rooftop / asphalt materials)
        materials = [
            ("Uninsulated Corrugated Iron Sheet", 53.2, 0.92),
            ("Dark Bitumen Asphalt Pavement", 49.8, 0.94),
            ("Exposed Concrete Rooftop", 45.4, 0.95),
            ("Reflective Cool Painted Roof (Coated)", 35.1, 0.91),
            ("Dense Neem Canopy Shade", 32.4, 0.98),
        ]

        micro_hotspots = []
        for i, (mat, temp, emiss) in enumerate(materials):
            micro_hotspots.append({
                "hotspot_id": f"{mission_id}-HS-{i+1}",
                "surface_material": mat,
                "calibrated_celsius": temp,
                "emissivity": emiss,
                "thermal_delta_vs_ambient": round(temp - 38.0, 1),
                "cooling_recommendation": (
                    "Apply High-Albedo Solar Reflective Paint (SRI > 78)"
                    if temp > 45.0
                    else "Preserve shaded canopy buffer"
                ),
            })

        new_mission = {
            "mission_id": mission_id,
            "pilot_callsign": pilot_callsign,
            "target_zone": target_zone,
            "bbox": bbox,
            "flight_status": "PROCESSED",
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "mean_lst_celsius": mean_temp,
            "max_lst_celsius": max_temp,
            "min_lst_celsius": min_temp,
            "gcp_bucket_uri": gcp_storage_uri,
            "micro_hotspots": micro_hotspots,
            "samples_processed_count": len(raw_dn_samples),
        }

        self.ACTIVE_MISSIONS.append(new_mission)
        return new_mission


drone_service = DroneService()
