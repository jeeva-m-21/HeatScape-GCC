import numpy as np
from typing import Dict, Any, List


class ExplainerService:
    """
    Explainable AI service delivering:
    1. 'Why Hot?': Local TreeSHAP-style physical feature attribution.
    2. 'Why Now?': Temporal feature drift attribution and regime diagnosis.
    """

    FEATURE_NAMES = [
        "impervious_fraction",
        "building_density",
        "tree_canopy_fraction",
        "water_distance_m",
        "elevation_m",
    ]

    # Baseline citywide average physical values for GCC
    CITY_BASELINES = {
        "impervious_fraction": 0.50,
        "building_density": 0.45,
        "tree_canopy_fraction": 0.20,
        "water_distance_m": 2200.0,
        "elevation_m": 10.0,
    }

    # Empirical sensitivity coefficients (°C per unit delta)
    SENSITIVITIES = {
        "impervious_fraction": +4.2,   # +4.2°C for 100% paved
        "building_density": +2.8,      # +2.8°C for dense structures
        "tree_canopy_fraction": -5.5,  # -5.5°C cooling for 100% canopy
        "water_distance_m": +0.0004,   # +0.4°C per km away from coast/river
        "elevation_m": -0.05,          # Lapse rate / cooling with elevation
    }

    @classmethod
    def explain_why_hot(cls, cell_attrs: Dict[str, Any], mean_anomaly: float) -> Dict[str, Any]:
        """
        Decomposes cell temperature anomaly into physical built-environment drivers.
        """
        base_temp = 32.0
        shap_values = []
        total_delta = 0.0

        for feat in cls.FEATURE_NAMES:
            val = float(cell_attrs.get(feat, cls.CITY_BASELINES[feat]))
            diff = val - cls.CITY_BASELINES[feat]
            # Canopy deficit increases heat
            if feat == "tree_canopy_fraction":
                contrib = (cls.CITY_BASELINES[feat] - val) * abs(cls.SENSITIVITIES[feat])
            else:
                contrib = diff * cls.SENSITIVITIES[feat]

            shap_values.append({
                "feature": feat,
                "value": val,
                "contribution_celsius": round(contrib, 2),
            })
            total_delta += contrib

        # Sort by highest heat contributor
        shap_values.sort(key=lambda x: x["contribution_celsius"], reverse=True)
        primary_driver = shap_values[0]["feature"] if shap_values else "impervious_fraction"

        return {
            "base_value_celsius": base_temp,
            "predicted_lst_celsius": round(base_temp + max(0.2, total_delta), 2),
            "shap_values": shap_values,
            "primary_driver": primary_driver,
        }

    @classmethod
    def explain_why_now(cls, observations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compares baseline period (first 18 months) vs active period (last 18 months)
        to isolate sudden vegetation decline, rapid urban densification, or macro shifts.
        """
        if len(observations) < 36:
            return {
                "regime_shift_detected": False,
                "regime_shift_estimated_date": None,
                "ndvi_drift": 0.0,
                "lst_drift_celsius": 0.0,
                "spatial_anomaly_drift_celsius": 0.0,
                "diagnosis": "Insufficient historical depth",
            }

        early = observations[:18]
        late = observations[18:]

        early_ndvi = np.mean([o.get("ndvi", 0.25) for o in early])
        late_ndvi = np.mean([o.get("ndvi", 0.25) for o in late])
        ndvi_drift = float(late_ndvi - early_ndvi)

        early_lst = np.mean([o.get("lst_celsius", 32.0) for o in early])
        late_lst = np.mean([o.get("lst_celsius", 32.0) for o in late])
        lst_drift = float(late_lst - early_lst)

        early_spanom = np.mean([o.get("spatial_anomaly_celsius", 0.0) for o in early])
        late_spanom = np.mean([o.get("spatial_anomaly_celsius", 0.0) for o in late])
        spanom_drift = float(late_spanom - early_spanom)

        regime_shift = (lst_drift > 1.2 or spanom_drift > 1.0) and (ndvi_drift < -0.05)

        if ndvi_drift < -0.08 and lst_drift > 1.0:
            diagnosis = "Rapid Vegetation Loss & Land Clearing"
        elif spanom_drift > 1.2:
            diagnosis = "Localized Urban Densification & New Construction"
        elif lst_drift > 1.5:
            diagnosis = "Severe Summer Synoptic Amplification"
        elif lst_drift < -0.8:
            diagnosis = "Microclimate Recovery / Afforestation Cooling"
        else:
            diagnosis = "Stable Seasonal Thermal Baseline"

        shift_date = observations[18]["observation_date"] if regime_shift else None

        return {
            "regime_shift_detected": regime_shift,
            "regime_shift_estimated_date": shift_date,
            "ndvi_drift": round(ndvi_drift, 3),
            "lst_drift_celsius": round(lst_drift, 2),
            "spatial_anomaly_drift_celsius": round(spanom_drift, 2),
            "diagnosis": diagnosis,
        }
