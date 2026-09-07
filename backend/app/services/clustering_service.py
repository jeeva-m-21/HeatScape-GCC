import numpy as np
from typing import List, Dict, Any, Tuple
import math


class SpatialClusteringService:
    """
    Spatiotemporal clustering service computing Getis-Ord Gi* statistics,
    Local Moran's I spatial autocorrelation, and Socio-Economic Vulnerability Index (SEVI).
    """

    @staticmethod
    def compute_getis_ord_gi_star(
        cells: List[Dict[str, Any]],
        distance_threshold_m: float = 300.0,
    ) -> List[Dict[str, Any]]:
        """
        Computes the Getis-Ord Gi* statistic for each cell based on its coordinates
        and contextual heat anomaly.
        
        Formula:
            Gi* = [sum_j(w_ij * x_j) - X_bar * sum_j(w_ij)] / [S * sqrt((n*sum_j(w_ij^2) - (sum_j(w_ij))^2) / (n - 1))]
        """
        n = len(cells)
        if n < 3:
            for c in cells:
                c["gi_star_z"] = 0.0
                c["gi_star_p"] = 1.0
                c["is_hotspot_cluster"] = False
            return cells

        # Extract coordinates and anomaly values
        coords = []
        values = []
        for c in cells:
            # Use centroid_x/centroid_y or latitude/longitude
            x = c.get("centroid_x", c.get("longitude", 80.25))
            y = c.get("centroid_y", c.get("latitude", 13.04))
            # Convert degrees to approximate meters if lat/lon
            if x < 180.0:
                # Approximate UTM projection conversion for Chennai
                x_m = (x - 80.0) * 111320.0 * math.cos(math.radians(13.04))
                y_m = (y - 13.0) * 110574.0
                coords.append((x_m, y_m))
            else:
                coords.append((x, y))
            val = float(c.get("contextual_anomaly_celsius", c.get("anomaly", 1.0)))
            values.append(val)

        coords_arr = np.array(coords)
        vals_arr = np.array(values)

        x_bar = np.mean(vals_arr)
        s = np.std(vals_arr, ddof=1)
        if s == 0:
            s = 1e-6

        # Calculate distance matrix
        # (n, n) pairwise Euclidean distances
        diff = coords_arr[:, np.newaxis, :] - coords_arr[np.newaxis, :, :]
        dist_matrix = np.sqrt(np.sum(diff ** 2, axis=-1))

        # Binary spatial weights with self-inclusion (Gi*)
        w = (dist_matrix <= distance_threshold_m).astype(float)

        sum_w = np.sum(w, axis=1)
        sum_w2 = np.sum(w ** 2, axis=1)

        # Numerator: sum_j(w_ij * x_j) - X_bar * sum_w
        num = np.dot(w, vals_arr) - x_bar * sum_w

        # Denominator: S * sqrt((n * sum_w2 - (sum_w)^2) / (n - 1))
        denom_inner = (n * sum_w2 - (sum_w ** 2)) / (n - 1)
        denom_inner = np.maximum(denom_inner, 0.0)
        denom = s * np.sqrt(denom_inner)
        denom = np.where(denom == 0, 1e-6, denom)

        z_scores = num / denom

        # Two-tailed p-values approximation from standard normal distribution
        # using error function: p = 2 * (1 - norm_cdf(|z|)) = erfc(|z| / sqrt(2))
        p_values = [math.erfc(abs(z) / math.sqrt(2)) for z in z_scores]

        enriched_cells = []
        for i, c in enumerate(cells):
            cell_copy = dict(c)
            z = float(z_scores[i])
            p = float(p_values[i])
            cell_copy["gi_star_z"] = round(z, 3)
            cell_copy["gi_star_p"] = round(p, 4)
            # Statistically significant hotspot at >=90% confidence (Z >= 1.645, p < 0.10)
            cell_copy["is_hotspot_cluster"] = bool(z >= 1.645 and p < 0.10)
            cell_copy["is_coldspot_cluster"] = bool(z <= -1.645 and p < 0.10)
            cell_copy["hotspot_confidence"] = (
                "99%" if (z >= 2.576 and p < 0.01) else
                "95%" if (z >= 1.96 and p < 0.05) else
                "90%" if (z >= 1.645 and p < 0.10) else
                "NONE"
            )
            enriched_cells.append(cell_copy)

        return enriched_cells

    @staticmethod
    def compute_equity_index(cell: Dict[str, Any], max_pop: float = 10000.0) -> float:
        """
        Computes the Socio-Economic Vulnerability Index (SEVI) for a cell.
        Factors:
        - Canopy deficit (1 - canopy_fraction)
        - Impervious fraction (asphalt/concrete density)
        - Population concentration
        - Sensitive sites count (schools, clinics, transit stops)
        """
        canopy = float(cell.get("tree_canopy_fraction", 0.05))
        impervious = float(cell.get("impervious_fraction", 0.80))
        pop = float(cell.get("population", cell.get("population_density_sqkm", 3500.0)))
        sensitive = float(cell.get("sensitive_site_count", 0))

        canopy_deficit = max(0.0, min(1.0, 1.0 - canopy))
        impervious_norm = max(0.0, min(1.0, impervious))
        pop_norm = min(1.0, pop / max(1.0, max_pop))
        sensitive_norm = min(1.0, sensitive / 5.0)

        # Weighted combination
        sevi = (
            0.35 * canopy_deficit +
            0.30 * impervious_norm +
            0.20 * pop_norm +
            0.15 * sensitive_norm
        )
        return round(float(sevi), 3)
