import pytest
import numpy as np
from app.services.trajectory_service import TrajectoryService


def test_sens_slope_monotonic_increase():
    """
    Monotonically increasing anomaly series must yield positive Sen's slope and significant p-value.
    """
    # 36 months with slope +0.1 deg/month
    times = np.arange(36, dtype=float)
    anomalies = 0.1 * times + 0.5

    slope = TrajectoryService.calculate_sens_slope(anomalies, times)
    assert pytest.approx(0.1, abs=1e-3) == slope

    z, p_value = TrajectoryService.mann_kendall_test(anomalies)
    assert z > 0
    assert p_value < 0.001


def test_sens_slope_flat_series():
    """
    Flat series must yield zero slope and p-value ~ 1.0.
    """
    anomalies = np.full(36, 2.0)
    slope = TrajectoryService.calculate_sens_slope(anomalies)
    assert slope == 0.0

    z, p_value = TrajectoryService.mann_kendall_test(anomalies)
    assert z == 0.0
    assert p_value == 1.0


def test_pelt_regime_shift_step_function():
    """
    Step function from baseline 0.5°C to 3.0°C in month 20 must trigger PELT detection.
    """
    arr = np.concatenate([np.full(20, 0.5), np.full(16, 3.0)])
    shift = TrajectoryService.detect_regime_shift_pelt(arr, min_size=3)
    assert shift == 1.0


def test_trajectory_state_classification():
    """
    Verify classification of Persistent vs Emerging archetypes.
    """
    # Persistent archetype: high anomaly throughout
    persistent_anoms = np.full(36, 2.6)
    res_persistent = TrajectoryService.classify_trajectory_state(persistent_anoms)
    assert res_persistent["state"] == "PERSISTENT"
    assert res_persistent["probabilities"]["PERSISTENT"] > 0.5
