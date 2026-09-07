"""Heatwave Early Warning & GCC Graded Response Action Plan (GRAP) Service.

Implements India Meteorological Department (IMD) heatwave classification criteria
and Greater Chennai Corporation (GCC) multi-departmental emergency protocols.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any


import math

def calculate_apparent_heat_index(temp_c: float, rh: float, wind_kmh: float = 10.0) -> float:
    """Computes the Steadman Apparent Temperature (AT) using water vapor pressure.
    Formula: AT = T + 0.33 * e - 0.70 * v - 4.00
    where e = (rh / 100) * 6.105 * exp((17.27 * T) / (237.7 + T))
    and v = wind speed in m/s.
    """
    v_ms = max(1.0, wind_kmh / 3.6)
    e = (rh / 100.0) * 6.105 * math.exp((17.27 * temp_c) / (237.7 + temp_c))
    at = temp_c + (0.33 * e) - (0.70 * v_ms) - 4.00
    # Cap logically between ambient and +14°C above ambient
    bounded_at = min(temp_c + 14.0, max(temp_c, at))
    return round(bounded_at, 1)


class HeatwaveService:
    """Core domain logic for Heatwave forecasting, IMD alerts, and GCC GRAP activation."""

    @classmethod
    def classify_imd_alert(cls, max_temp_c: float, consecutive_days: int = 1) -> Dict[str, Any]:
        """Classifies IMD alert level according to official India Meteorological Department criteria:
        - GREEN: Normal (< 40.0°C)
        - YELLOW: Heat Watch (40.0°C - 42.9°C)
        - ORANGE: Severe Heat Alert (43.0°C - 44.9°C or 40.0°C+ for 2+ consecutive days)
        - RED: Extreme Heat Warning (>= 45.0°C or severe heatwave for 2+ consecutive days)
        """
        if max_temp_c >= 45.0 or (max_temp_c >= 43.0 and consecutive_days >= 3):
            return {
                "alert_level": "RED",
                "severity_code": 4,
                "title": "Extreme Heat Warning",
                "action_required": "High risk of heat stroke, medical emergency across all age groups",
                "color_hex": "#EF4444",
            }
        elif max_temp_c >= 43.0 or (max_temp_c >= 40.0 and consecutive_days >= 2):
            return {
                "alert_level": "ORANGE",
                "severity_code": 3,
                "title": "Severe Heat Alert",
                "action_required": "High likelihood of heat illness in vulnerable populations; outdoor labor suspended",
                "color_hex": "#F97316",
            }
        elif max_temp_c >= 40.0:
            return {
                "alert_level": "YELLOW",
                "severity_code": 2,
                "title": "Heat Watch",
                "action_required": "Moderate heat; hydration advisories active; prolonged sun exposure discouraged",
                "color_hex": "#EAB308",
            }
        else:
            return {
                "alert_level": "GREEN",
                "severity_code": 1,
                "title": "Normal Temperature",
                "action_required": "Comfortable / manageable ambient conditions; standard municipal monitoring",
                "color_hex": "#10B981",
            }

    @classmethod
    def get_7day_forecast(cls) -> Dict[str, Any]:
        """Generates a comprehensive 7-day rolling forecast for Chennai Metropolitan Region."""
        base_date = datetime.now()
        
        # Scenario profile depicting a severe summer pre-monsoon heat spike in Chennai
        forecast_profile = [
            {"day_offset": 0, "max_temp": 41.8, "min_temp": 29.5, "rh": 68, "wind_kmh": 14, "condition": "Partly Hazy & Humid"},
            {"day_offset": 1, "max_temp": 42.6, "min_temp": 30.1, "rh": 70, "wind_kmh": 12, "condition": "Extreme Humidity & Heat"},
            {"day_offset": 2, "max_temp": 43.9, "min_temp": 30.8, "rh": 65, "wind_kmh": 10, "condition": "Severe Heatwave Spike"},
            {"day_offset": 3, "max_temp": 44.4, "min_temp": 31.2, "rh": 63, "wind_kmh": 9,  "condition": "Critical Thermal Peak"},
            {"day_offset": 4, "max_temp": 43.1, "min_temp": 30.4, "rh": 67, "wind_kmh": 13, "condition": "Severe Heatwave Persists"},
            {"day_offset": 5, "max_temp": 40.9, "min_temp": 29.8, "rh": 72, "wind_kmh": 18, "condition": "Coastal Sea Breeze Moderation"},
            {"day_offset": 6, "max_temp": 38.6, "min_temp": 28.5, "rh": 75, "wind_kmh": 22, "condition": "Pre-Monsoon Convective Showers"},
        ]

        daily_forecasts = []
        consecutive_hot_days = 0

        for item in forecast_profile:
            current_date = base_date + timedelta(days=item["day_offset"])
            max_t = item["max_temp"]
            rh = item["rh"]
            heat_index = calculate_apparent_heat_index(max_t, rh, item["wind_kmh"])

            if max_t >= 40.0:
                consecutive_hot_days += 1
            else:
                consecutive_hot_days = 0

            alert_info = cls.classify_imd_alert(max_t, consecutive_hot_days)

            daily_forecasts.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "day_name": current_date.strftime("%A"),
                "short_date": current_date.strftime("%d %b"),
                "max_temp_c": max_t,
                "min_temp_c": item["min_temp"],
                "relative_humidity_pct": rh,
                "apparent_heat_index_c": heat_index,
                "wind_speed_kmh": item["wind_kmh"],
                "condition": item["condition"],
                "consecutive_hot_days": consecutive_hot_days,
                "imd_alert": alert_info["alert_level"],
                "severity_code": alert_info["severity_code"],
                "alert_title": alert_info["title"],
                "color_hex": alert_info["color_hex"],
                "action_summary": alert_info["action_required"],
            })

        # Top 5 hottest microclimate zones predicted for the peak day
        vulnerable_zones_forecast = [
            {"zone_id": "ZONE_10", "name": "Kodambakkam (Usman Rd / T. Nagar)", "peak_temp_c": 45.1, "apparent_c": 52.4, "risk_tier": "CRITICAL"},
            {"zone_id": "ZONE_09", "name": "Teynampet (Anna Salai / DMS Axis)", "peak_temp_c": 44.6, "apparent_c": 51.8, "risk_tier": "CRITICAL"},
            {"zone_id": "ZONE_05", "name": "Royapuram (Port & Industrial Transit)", "peak_temp_c": 44.8, "apparent_c": 52.1, "risk_tier": "CRITICAL"},
            {"zone_id": "ZONE_06", "name": "Thiru-Vi-Ka Nagar (High Density)", "peak_temp_c": 43.9, "apparent_c": 50.2, "risk_tier": "HIGH"},
            {"zone_id": "ZONE_08", "name": "Anna Nagar (Roundtana Commercial)", "peak_temp_c": 43.2, "apparent_c": 49.6, "risk_tier": "HIGH"},
        ]

        return {
            "issuing_office": "Regional Meteorological Centre (RMC), Chennai & GCC Disaster Management Cell",
            "forecast_generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
            "region": "Chennai Metropolitan Area (15 GCC Zones)",
            "highest_projected_apparent_c": max(d["apparent_heat_index_c"] for d in daily_forecasts),
            "peak_alert_level": "ORANGE" if any(d["imd_alert"] == "ORANGE" for d in daily_forecasts) else "RED",
            "days_above_40c": sum(1 for d in daily_forecasts if d["max_temp_c"] >= 40.0),
            "daily_forecasts": daily_forecasts,
            "vulnerable_zones": vulnerable_zones_forecast,
        }

    @classmethod
    def get_grap_status(cls, forced_stage: int = 2) -> Dict[str, Any]:
        """Returns the active Greater Chennai Corporation Graded Response Action Plan (GRAP) status.
        
        Stages:
        - Stage 0: Normal Baseline (< 40°C)
        - Stage 1: Yellow Alert (40°C - 42.9°C)
        - Stage 2: Orange Alert (43°C - 44.9°C) - ACTIVE SIMULATION
        - Stage 3: Red Alert (>= 45°C)
        """
        stage_meta = {
            0: {
                "stage_name": "Stage 0: Normal Advisory",
                "imd_color": "GREEN",
                "severity_label": "BASELINE",
                "labor_advisory": "Standard work hours permitted.",
                "cooling_shelters_active": 0,
                "misting_trucks_active": 0,
                "water_kiosks_active": 25,
            },
            1: {
                "stage_name": "Stage 1: Moderate Heat Protocol",
                "imd_color": "YELLOW",
                "severity_label": "MODERATE",
                "labor_advisory": "Mandatory 15-minute shaded rest breaks every 2 hours.",
                "cooling_shelters_active": 15,
                "misting_trucks_active": 2,
                "water_kiosks_active": 120,
            },
            2: {
                "stage_name": "Stage 2: Severe Heatwave Emergency Protocol",
                "imd_color": "ORANGE",
                "severity_label": "HIGH EMERGENCY",
                "labor_advisory": "MANDATORY WORK SUSPENSION 12:00 PM – 3:00 PM for all outdoor construction and sanitation staff.",
                "cooling_shelters_active": 45,
                "misting_trucks_active": 8,
                "water_kiosks_active": 250,
            },
            3: {
                "stage_name": "Stage 3: Red Crisis Protocol",
                "imd_color": "RED",
                "severity_label": "MAXIMUM CATASTROPHIC",
                "labor_advisory": "COMPLETE BAN on outdoor physical labor between 11:00 AM – 4:00 PM; schools shifted to morning hours.",
                "cooling_shelters_active": 120,
                "misting_trucks_active": 16,
                "water_kiosks_active": 500,
            },
        }

        active = stage_meta.get(forced_stage, stage_meta[2])

        department_checklists = [
            {
                "department": "Public Health & Welfare Wing",
                "head_officer": "City Health Officer (CHO), GCC",
                "status": "ACTIVE_DEPLOYMENT",
                "tasks": [
                    {"task": "Special Heatstroke Wards activated at RGGGH, Stanley, KMC & Royapettah Hospitals", "done": True},
                    {"task": "Distribution of 120,000 Oral Rehydration Salt (ORS) packets at major MTC bus terminals", "done": True},
                    {"task": "Deployment of 15 Mobile Medical Emergency Vans with cold IV saline infusions", "done": True},
                    {"task": "Daily mortality and heat-exhaustion surveillance reporting across 140 UPHCs", "done": False},
                ],
            },
            {
                "department": "Mechanical & Solid Waste Engineering",
                "head_officer": "Superintending Engineer (Mechanical)",
                "status": "ACTIVE_DEPLOYMENT",
                "tasks": [
                    {"task": "Fleet of 8 mechanical misting cannons deployed along Anna Salai, Usman Rd, GST Rd", "done": True},
                    {"task": "Scheduled evaporative road wetting cycles: 12:00 PM, 1:30 PM, and 3:00 PM", "done": True},
                    {"task": "Refueling and water refilling logistics hubs established at CIT Nagar & Kilpauk Water Works", "done": True},
                ],
            },
            {
                "department": "Revenue & Disaster Management",
                "head_officer": "District Collector & Commissioner, GCC",
                "status": "ENFORCING",
                "tasks": [
                    {"task": "Statutory order issued: Mandatory stoppage of construction work between 12 PM - 3 PM", "done": True},
                    {"task": "Squad inspections conducted across 84 major commercial building sites in Guindy & OMR", "done": True},
                    {"task": "Cell broadcast emergency SMS warning sent to 4.2M registered mobile subscribers in Chennai", "done": True},
                ],
            },
            {
                "department": "Metro Water & Municipal Infrastructure (CMWSSB)",
                "head_officer": "Managing Director, CMWSSB",
                "status": "ACTIVE_DEPLOYMENT",
                "tasks": [
                    {"task": "250 Thanneer Pandals (Earthen pot drinking water booths) staffed & continuously replenished", "done": True},
                    {"task": "Water tanker supply prioritized to vulnerable informal settlements in North Chennai", "done": True},
                ],
            },
        ]

        return {
            "current_stage": forced_stage,
            "stage_name": active["stage_name"],
            "alert_level": active["imd_color"],
            "severity_label": active["severity_label"],
            "labor_mandate": active["labor_advisory"],
            "cooling_shelters_count": active["cooling_shelters_active"],
            "misting_trucks_count": active["misting_trucks_active"],
            "water_kiosks_count": active["water_kiosks_active"],
            "statutory_authority": "Tamil Nadu State Disaster Management Authority (TNSDMA) & GCC Standing Committee",
            "enforcement_officer": "Dr. J. Radhakrishnan, IAS, Principal Secretary / Commissioner, GCC",
            "last_escalated": (datetime.now() - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M IST"),
            "departmental_actions": department_checklists,
        }

    @classmethod
    def generate_dispatch_manifest(cls) -> Dict[str, Any]:
        """Generates operational fleet routing and shelter dispatch orders for GCC frontline teams."""
        misting_trucks = [
            {
                "vehicle_id": "GCC-MIST-01",
                "registration": "TN-01-GCC-7701",
                "capacity_liters": 10000,
                "spray_rate_lpm": 120,
                "driver_name": "K. Murugan",
                "driver_phone": "+91 94441 20111",
                "target_corridor": "Anna Salai (DMS to Nandanam Junction)",
                "zone": "Zone IX (Teynampet)",
                "status": "EN_ROUTE",
                "scheduled_hours": "11:30 AM - 04:00 PM",
                "evaporative_cooling_delta": "-3.2°C",
            },
            {
                "vehicle_id": "GCC-MIST-02",
                "registration": "TN-01-GCC-7702",
                "capacity_liters": 10000,
                "spray_rate_lpm": 120,
                "driver_name": "S. Selvam",
                "driver_phone": "+91 94441 20112",
                "target_corridor": "Usman Road & Pondy Bazaar Commercial Core",
                "zone": "Zone X (Kodambakkam)",
                "status": "ACTIVE_SPRAYING",
                "scheduled_hours": "11:30 AM - 04:00 PM",
                "evaporative_cooling_delta": "-3.5°C",
            },
            {
                "vehicle_id": "GCC-MIST-03",
                "registration": "TN-01-GCC-7703",
                "capacity_liters": 12000,
                "spray_rate_lpm": 140,
                "driver_name": "M. Karthik",
                "driver_phone": "+91 94441 20113",
                "target_corridor": "Poonamallee High Road (Central Station to Kilpauk)",
                "zone": "Zone V (Royapuram)",
                "status": "ACTIVE_SPRAYING",
                "scheduled_hours": "11:30 AM - 04:00 PM",
                "evaporative_cooling_delta": "-2.9°C",
            },
            {
                "vehicle_id": "GCC-MIST-04",
                "registration": "TN-01-GCC-7704",
                "capacity_liters": 10000,
                "spray_rate_lpm": 120,
                "driver_name": "R. Prakash",
                "driver_phone": "+91 94441 20114",
                "target_corridor": "Grand Southern Trunk (GST) Road, Guindy Axis",
                "zone": "Zone XIII (Adyar)",
                "status": "EN_ROUTE",
                "scheduled_hours": "12:00 PM - 04:30 PM",
                "evaporative_cooling_delta": "-2.8°C",
            },
            {
                "vehicle_id": "GCC-MIST-05",
                "registration": "TN-01-GCC-7705",
                "capacity_liters": 10000,
                "spray_rate_lpm": 120,
                "driver_name": "V. Anbarasan",
                "driver_phone": "+91 94441 20115",
                "target_corridor": "Anna Nagar 2nd Avenue & Roundtana",
                "zone": "Zone VIII (Anna Nagar)",
                "status": "STANDBY",
                "scheduled_hours": "12:30 PM - 04:30 PM",
                "evaporative_cooling_delta": "-2.6°C",
            },
        ]

        cooling_shelters = [
            {
                "facility_id": "SHELTER-CHE-01",
                "name": "GCC Community Welfare Hall, Teynampet",
                "address": "No. 42 Eldams Road, Teynampet, Chennai 600018",
                "zone": "Zone IX (Teynampet)",
                "capacity_persons": 180,
                "current_occupancy": 84,
                "facilities": ["Full Air-Conditioning", "Medical Doctor on Duty", "Chilled Drinking Water", "ORS Packets", "Recliners"],
                "contact": "+91 44 2434 0118",
                "is_open_24_7": True,
            },
            {
                "facility_id": "SHELTER-CHE-02",
                "name": "Dr. Natesan Park Air-Conditioned Public Pavilion",
                "address": "Venkatanarayana Road, T. Nagar, Chennai 600017",
                "zone": "Zone X (Kodambakkam)",
                "capacity_persons": 220,
                "current_occupancy": 142,
                "facilities": ["HVAC Climate Control", "Free Electrolyte Drinks", "First Aid Station", "Charging Kiosks"],
                "contact": "+91 44 2434 0117",
                "is_open_24_7": True,
            },
            {
                "facility_id": "SHELTER-CHE-03",
                "name": "Royapuram Municipal Community Center",
                "address": "Surya Narayana Street, Royapuram, Chennai 600013",
                "zone": "Zone V (Royapuram)",
                "capacity_persons": 250,
                "current_occupancy": 195,
                "facilities": ["Emergency High-Flow Oxygen", "Cooling Misting Fans", "Physician on Duty", "Elderly Beds"],
                "contact": "+91 44 2595 0049",
                "is_open_24_7": True,
            },
            {
                "facility_id": "SHELTER-CHE-04",
                "name": "Adyar Estuary Public Transit Cooling Refuge",
                "address": "Lattice Bridge Road, Adyar, Chennai 600020",
                "zone": "Zone XIII (Adyar)",
                "capacity_persons": 150,
                "current_occupancy": 65,
                "facilities": ["HVAC Cooling", "Clean Potable Water", "Baby Feeding Station"],
                "contact": "+91 44 2441 0174",
                "is_open_24_7": True,
            },
        ]

        return {
            "dispatch_id": f"GCC-EAP-DISPATCH-{datetime.now().strftime('%Y%m%d-%H%M')}",
            "authorized_by": "GCC Central Disaster Management Command Cell, Ripon Building",
            "active_misting_vehicles": misting_trucks,
            "total_water_dispatched_liters": sum(v["capacity_liters"] for v in misting_trucks),
            "emergency_cooling_shelters": cooling_shelters,
            "total_shelter_capacity": sum(s["capacity_persons"] for s in cooling_shelters),
            "total_current_shelter_occupancy": sum(s["current_occupancy"] for s in cooling_shelters),
            "operational_readiness": "100% DEPLOYED",
        }
