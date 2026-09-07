import numpy as np
from scipy import stats
import ruptures as rpt
from typing import Dict, Any, List, Tuple


class TrajectoryService:
    """
    Mathematical service for non-parametric trends (Sen's slope, Mann-Kendall),
    regime shift detection (PELT), and calibrated 5-state trajectory classification.
    """

    @staticmethod
    def calculate_sens_slope(values: np.ndarray, times: np.ndarray = None) -> float:
        """
        Computes Sen's slope estimator (median of all pairwise slopes).
        """
        n = len(values)
        if n < 2:
            return 0.0

        if times is None:
            times = np.arange(n, dtype=float)

        slopes = []
        for k in range(n - 1):
            for j in range(k + 1, n):
                dt = times[j] - times[k]
                if dt != 0:
                    slopes.append((values[j] - values[k]) / dt)

        if not slopes:
            return 0.0
        return float(np.median(slopes))

    @staticmethod
    def mann_kendall_test(values: np.ndarray) -> Tuple[float, float]:
        """
        Performs non-parametric Mann-Kendall trend test.
        Returns: (z_statistic, p_value)
        """
        n = len(values)
        if n < 3:
            return 0.0, 1.0

        s = 0
        for k in range(n - 1):
            for j in range(k + 1, n):
                diff = values[j] - values[k]
                if diff > 0:
                    s += 1
                elif diff < 0:
                    s -= 1

        # Calculate tied groups
        unique_vals, counts = np.unique(values, return_counts=True)
        tied_sum = np.sum(counts * (counts - 1) * (2 * counts + 5))

        var_s = (n * (n - 1) * (2 * n + 5) - tied_sum) / 18.0

        if var_s == 0:
            return 0.0, 1.0

        if s > 0:
            z = (s - 1) / np.sqrt(var_s)
        elif s < 0:
            z = (s + 1) / np.sqrt(var_s)
        else:
            z = 0.0

        p_value = 2.0 * (1.0 - stats.norm.cdf(abs(z)))
        return float(z), float(p_value)

    @staticmethod
    def detect_regime_shift_pelt(values: np.ndarray, min_size: int = 3) -> float:
        """
        Structural regime shift detection using PELT with BIC penalty (2 * ln(n)).
        Returns: 1.0 if a change-point is detected in the most recent 18 observations, else 0.0.
        """
        n = len(values)
        if n < min_size * 2:
            return 0.0

        try:
            arr = np.array(values, dtype=float).reshape(-1, 1)
            # RBF model with min_size
            algo = rpt.Pelt(model="rbf", min_size=min_size).fit(arr)
            # BIC penalty: gamma = 2 * ln(n)
            pen = 2.0 * np.log(n)
            result = algo.predict(pen=pen)

            # result includes n as the last index; check for internal change points in recent half
            change_points = [cp for cp in result if cp < n]
            if not change_points:
                return 0.0

            # Check if any change point occurred in the second half (recent 18 months of 36)
            recent_threshold = max(0, n - 18)
            for cp in change_points:
                if cp >= recent_threshold:
                    return 1.0
            return 0.0
        except Exception:
            return 0.0

    @classmethod
    def classify_trajectory_state(
        cls,
        anomalies: np.ndarray,
        times: np.ndarray = None,
        valid_obs_count: int = 36,
    ) -> Dict[str, Any]:
        """
        Classifies cell into PERSISTENT, EMERGING, TEMPORARY, IMPROVING, or WATCH.
        Computes calibrated softmax probability vector.
        """
        n = len(anomalies)
        if n == 0:
            return {
                "state": "WATCH",
                "probabilities": {"WATCH": 1.0, "PERSISTENT": 0.0, "EMERGING": 0.0, "TEMPORARY": 0.0, "IMPROVING": 0.0},
                "confidence": 1.0,
                "mean_anomaly": 0.0,
                "median_anomaly": 0.0,
                "slope": 0.0,
                "p_value": 1.0,
                "recurrence": 0.0,
                "volatility": 0.0,
                "regime_shift": 0.0,
            }

        mean_anom = float(np.mean(anomalies))
        median_anom = float(np.median(anomalies))
        volatility = float(np.std(anomalies))
        recurrence = float(np.sum(anomalies >= 1.5) / n)
        slope = cls.calculate_sens_slope(anomalies, times)
        _, p_value = cls.mann_kendall_test(anomalies)
        regime_shift = cls.detect_regime_shift_pelt(anomalies)
        latest_anom = float(anomalies[-1])

        # Raw scores for softmax calibration
        scores = {
            "PERSISTENT": 0.0,
            "EMERGING": 0.0,
            "TEMPORARY": 0.0,
            "IMPROVING": 0.0,
            "WATCH": 0.0,
        }

        # Rule evaluation & scoring
        if recurrence >= 0.60 and mean_anom >= 1.8:
            scores["PERSISTENT"] += 3.5 + (mean_anom - 1.8) * 2.0
        if slope > 0.025 and p_value < 0.05 and regime_shift > 0.5:
            scores["EMERGING"] += 4.0 + (slope / 0.025)
        elif slope > 0.025 and p_value < 0.05:
            scores["EMERGING"] += 2.5
        if latest_anom >= 2.0 and recurrence < 0.35:
            scores["TEMPORARY"] += 3.0 + (2.0 - recurrence * 5.0)
        if slope < -0.02 and p_value < 0.05:
            scores["IMPROVING"] += 3.5 + abs(slope / 0.02)
        if volatility > 1.8 or valid_obs_count < 8:
            scores["WATCH"] += 3.0

        # Baseline ambient weight to ensure valid softmax distribution
        for k in scores:
            scores[k] += 0.5

        # Softmax computation
        exp_scores = {k: np.exp(v) for k, v in scores.items()}
        sum_exp = sum(exp_scores.values())
        probabilities = {k: float(v / sum_exp) for k, v in exp_scores.items()}

        # Primary state is argmax
        assigned_state = max(probabilities.items(), key=lambda x: x[1])[0]
        confidence = probabilities[assigned_state]

        return {
            "state": assigned_state,
            "probabilities": probabilities,
            "confidence": confidence,
            "mean_anomaly": mean_anom,
            "median_anomaly": median_anom,
            "slope": slope,
            "p_value": p_value,
            "recurrence": recurrence,
            "volatility": volatility,
            "regime_shift": regime_shift,
        }
