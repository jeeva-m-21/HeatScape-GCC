"""
Compound Multi-Hazard Climate Resilience Service.

Quantifies the interaction between extreme coastal heatwaves (HVI)
and Northeast monsoon urban flooding (FIR) across Greater Chennai Corporation's 15 administrative zones,
evaluating the dual-benefit return of Nature-Based Sponge Infrastructure.
"""

from typing import Dict, Any, List, Optional


class HazardService:
    """Service evaluating compound heat and flood vulnerability with sponge infrastructure co-benefits."""

    GCC_ZONES: List[Dict[str, Any]] = [
        {
            "zone_id": 1,
            "zone_name": "Zone I (Thiruvottiyur)",
            "primary_river_basin": "Kosasthalaiyar",
            "mean_elevation_m": 4.2,
            "heat_vulnerability_index": 0.72,
            "flood_inundation_risk": 0.85,
            "sponge_capacity_index": 0.28,
            "impervious_surface_fraction": 0.78,
            "population_density_sqkm": 14200,
            "critical_assets": ["Ennore Thermal Plant Hub", "Coastal Fishing Settlements"],
        },
        {
            "zone_id": 2,
            "zone_name": "Zone II (Manali)",
            "primary_river_basin": "Kosasthalaiyar",
            "mean_elevation_m": 5.1,
            "heat_vulnerability_index": 0.81,
            "flood_inundation_risk": 0.88,
            "sponge_capacity_index": 0.22,
            "impervious_surface_fraction": 0.82,
            "population_density_sqkm": 9800,
            "critical_assets": ["Petrochemical Refinery Cluster", "Heavy Freight Corridors"],
        },
        {
            "zone_id": 3,
            "zone_name": "Zone III (Madhavaram)",
            "primary_river_basin": "Kosasthalaiyar",
            "mean_elevation_m": 8.4,
            "heat_vulnerability_index": 0.65,
            "flood_inundation_risk": 0.62,
            "sponge_capacity_index": 0.45,
            "impervious_surface_fraction": 0.64,
            "population_density_sqkm": 11500,
            "critical_assets": ["Dairy Farm Complex", "Madhavaram Intermodal Terminal"],
        },
        {
            "zone_id": 4,
            "zone_name": "Zone IV (Tondiarpet)",
            "primary_river_basin": "Captain Cotton Canal",
            "mean_elevation_m": 3.8,
            "heat_vulnerability_index": 0.88,
            "flood_inundation_risk": 0.84,
            "sponge_capacity_index": 0.18,
            "impervious_surface_fraction": 0.89,
            "population_density_sqkm": 28400,
            "critical_assets": ["Dense Heritage Settlements", "Stanley Medical College"],
        },
        {
            "zone_id": 5,
            "zone_name": "Zone V (Royapuram)",
            "primary_river_basin": "Buckingham Canal / Port",
            "mean_elevation_m": 3.2,
            "heat_vulnerability_index": 0.92,
            "flood_inundation_risk": 0.90,
            "sponge_capacity_index": 0.12,
            "impervious_surface_fraction": 0.94,
            "population_density_sqkm": 32600,
            "critical_assets": ["Chennai Port Trust", "George Town Wholesale Hub", "Central Station"],
        },
        {
            "zone_id": 8,
            "zone_name": "Zone VIII (Anna Nagar)",
            "primary_river_basin": "Cooum River",
            "mean_elevation_m": 12.5,
            "heat_vulnerability_index": 0.58,
            "flood_inundation_risk": 0.45,
            "sponge_capacity_index": 0.52,
            "impervious_surface_fraction": 0.72,
            "population_density_sqkm": 18500,
            "critical_assets": ["Tower Park Shaded Buffer", "Metro Rail Blue/Green Corridors"],
        },
        {
            "zone_id": 9,
            "zone_name": "Zone IX (Teynampet)",
            "primary_river_basin": "Adyar / Buckingham Canal",
            "mean_elevation_m": 6.8,
            "heat_vulnerability_index": 0.89,
            "flood_inundation_risk": 0.76,
            "sponge_capacity_index": 0.24,
            "impervious_surface_fraction": 0.88,
            "population_density_sqkm": 24800,
            "critical_assets": ["Anna Salai Commercial Axis", "Pondy Bazaar Pedestrian Plaza", "DMS"],
        },
        {
            "zone_id": 10,
            "zone_name": "Zone X (Kodambakkam)",
            "primary_river_basin": "Mambalam Canal / Adyar",
            "mean_elevation_m": 7.5,
            "heat_vulnerability_index": 0.86,
            "flood_inundation_risk": 0.82,
            "sponge_capacity_index": 0.21,
            "impervious_surface_fraction": 0.86,
            "population_density_sqkm": 26200,
            "critical_assets": ["T. Nagar Retail Core", "Mambalam Railway Hub", "CIT Nagar"],
        },
        {
            "zone_id": 13,
            "zone_name": "Zone XIII (Adyar)",
            "primary_river_basin": "Adyar River Estuary",
            "mean_elevation_m": 4.5,
            "heat_vulnerability_index": 0.68,
            "flood_inundation_risk": 0.79,
            "sponge_capacity_index": 0.48,
            "impervious_surface_fraction": 0.68,
            "population_density_sqkm": 16400,
            "critical_assets": ["Tholkappia Poonga Eco-Park", "IIT Madras Forest Canopy", "Besant Nagar"],
        },
        {
            "zone_id": 14,
            "zone_name": "Zone XIV (Perungudi)",
            "primary_river_basin": "Pallikaranai Marshland",
            "mean_elevation_m": 2.8,
            "heat_vulnerability_index": 0.74,
            "flood_inundation_risk": 0.94,
            "sponge_capacity_index": 0.38,
            "impervious_surface_fraction": 0.76,
            "population_density_sqkm": 11200,
            "critical_assets": ["OMR IT Expressway", "Pallikaranai Wetland Buffer"],
        },
        {
            "zone_id": 15,
            "zone_name": "Zone XV (Sholinganallur)",
            "primary_river_basin": "Buckingham Canal / Kovalam",
            "mean_elevation_m": 3.4,
            "heat_vulnerability_index": 0.69,
            "flood_inundation_risk": 0.89,
            "sponge_capacity_index": 0.42,
            "impervious_surface_fraction": 0.69,
            "population_density_sqkm": 8900,
            "critical_assets": ["SEZ Technology Parks", "Kovalam Estuary"],
        }
    ]

    def compute_compound_risk(
        self,
        weight_heat: float = 0.55,
        weight_flood: float = 0.45,
        sponge_mitigation_factor: float = 0.25,
    ) -> List[Dict[str, Any]]:
        """
        Computes the Compound Climate Risk Index (CCRI) for each zone:
            CCRI = (w_heat * HVI) + (w_flood * FIR) - (sponge_factor * SpongeCapacity)
        Bounded between 0.0 (Minimal Risk) and 1.0 (Extreme Compound Threat).
        """
        w_sum = weight_heat + weight_flood
        if w_sum > 0:
            norm_w_heat = weight_heat / w_sum
            norm_w_flood = weight_flood / w_sum
        else:
            norm_w_heat, norm_w_flood = 0.5, 0.5

        results = []
        for zone in self.GCC_ZONES:
            hvi = zone["heat_vulnerability_index"]
            fir = zone["flood_inundation_risk"]
            sponge = zone["sponge_capacity_index"]

            raw_ccri = (norm_w_heat * hvi) + (norm_w_flood * fir) - (sponge_mitigation_factor * sponge)
            ccri = round(max(0.05, min(0.99, raw_ccri)), 3)

            # Categorize compound severity
            if ccri >= 0.75:
                tier = "CRITICAL_COMPOUND_HOTSPOT"
                tier_color = "#ef4444"
                action = "Deploy combined bioswales, high-albedo roofs, and emergency misting fleet"
            elif ccri >= 0.60:
                tier = "HIGH_DUAL_VULNERABILITY"
                tier_color = "#f97316"
                action = "Accelerate Miyawaki sponge buffers and permeable pavement retrofits"
            elif ccri >= 0.45:
                tier = "MODERATE_RISK"
                tier_color = "#eab308"
                action = "Maintain stormwater canals and preserve existing urban tree canopy"
            else:
                tier = "LOW_RESILIENT_ZONE"
                tier_color = "#10b981"
                action = "Benchmark for ecological sponge resilience and canal absorption"

            results.append({
                **zone,
                "compound_risk_index": ccri,
                "risk_tier": tier,
                "tier_color": tier_color,
                "priority_action": action,
            })

        # Rank zones by compound risk descending
        results.sort(key=lambda x: x["compound_risk_index"], reverse=True)
        return results

    def calculate_sponge_co_benefits(
        self,
        budget_crores: float = 50.0,
        miyawaki_fraction: float = 0.40,
        bioswale_fraction: float = 0.35,
        cool_roof_fraction: float = 0.25,
    ) -> Dict[str, Any]:
        """
        Quantifies the dual co-benefits of sponge infrastructure capital expenditure:
        1. Summer Heat Mitigation (°C drop)
        2. Monsoon Flood Inundation Buffer (Stormwater absorption in m³)
        3. Economic Benefit-Cost Ratio (BCR)
        """
        # Normalize fractions
        total_frac = miyawaki_fraction + bioswale_fraction + cool_roof_fraction
        if total_frac > 0:
            m_pct = miyawaki_fraction / total_frac
            b_pct = bioswale_fraction / total_frac
            c_pct = cool_roof_fraction / total_frac
        else:
            m_pct, b_pct, c_pct = 0.4, 0.35, 0.25

        budget_m = budget_crores * m_pct
        budget_b = budget_crores * b_pct
        budget_c = budget_crores * c_pct

        # Physical metrics
        # Miyawaki: 1 Cr = 1.2 ha canopy, -0.06°C drop, 15,000 m³ water absorbed/season
        # Bioswales: 1 Cr = 3.5 km bioswales, -0.02°C drop, 38,000 m³ stormwater retention
        # Cool Roofs: 1 Cr = 2.5 ha cool roofs, -0.09°C drop, 4,000 m³ seepage prevention
        cooling_celsius = round((budget_m * 0.06) + (budget_b * 0.02) + (budget_c * 0.09), 2)
        stormwater_retained_m3 = round((budget_m * 15000) + (budget_b * 38000) + (budget_c * 4000), 0)
        canopy_added_hectares = round(budget_m * 1.2, 1)
        cool_roofs_hectares = round(budget_c * 2.5, 1)

        # Economic Valuation (Tamil Nadu PWD & Disaster Avoidance Model)
        # Heat health savings: ₹0.82 Cr per Cr invested
        # Flood damage avoidance: ₹1.05 Cr per Cr invested
        heat_health_savings_cr = round(budget_crores * 0.82, 2)
        flood_damage_avoided_cr = round(budget_crores * 1.05, 2)
        total_economic_benefit_cr = round(heat_health_savings_cr + flood_damage_avoided_cr, 2)
        benefit_cost_ratio = round(total_economic_benefit_cr / max(1.0, budget_crores), 2)

        return {
            "budget_allocated_crores": budget_crores,
            "allocation_breakdown": {
                "miyawaki_forests_cr": round(budget_m, 2),
                "bioswales_ponds_cr": round(budget_b, 2),
                "cool_reflective_roofs_cr": round(budget_c, 2),
            },
            "physical_impacts": {
                "net_heat_mitigation_celsius": cooling_celsius,
                "stormwater_retention_capacity_m3": int(stormwater_retained_m3),
                "canopy_added_hectares": canopy_added_hectares,
                "cool_roofs_hectares": cool_roofs_hectares,
            },
            "economic_co_benefits": {
                "heat_mortality_avoided_crores": heat_health_savings_cr,
                "monsoon_flood_damage_avoided_crores": flood_damage_avoided_cr,
                "total_monetary_resilience_benefit_crores": total_economic_benefit_cr,
                "benefit_cost_ratio": benefit_cost_ratio,
            },
            "policy_brief": (
                f"A capital deployment of ₹{budget_crores} Cr achieves a combined dual benefit of "
                f"-{cooling_celsius}°C thermal relief and {int(stormwater_retained_m3):,} m³ "
                f"monsoon retention, delivering a {benefit_cost_ratio}x return on investment."
            ),
        }


hazard_service = HazardService()
