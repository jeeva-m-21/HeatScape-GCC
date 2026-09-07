# HeatScape: Analytical & Mathematical Specifications

## 1. Contextual & Neighborhood Normalization Engine

Satellite-derived Land Surface Temperature (LST) is susceptible to broad synoptic weather swings and regional seasonal patterns. HeatScape decouples seasonal cycles and macro-climatic swings from localized micro-urban thermal anomalies.

### 1.1 Temporal Self-Anomaly ($A_{self}$)
For cell $i$ at observation time $t$:
$$A_{self}(i, t) = LST(i, t) - \text{median}\left(\{LST(i, t') \mid t' \in \text{month}(t)\}\right)$$
Where $\text{month}(t)$ denotes all historical observations of cell $i$ occurring in the same calendar month across the multi-year observation window (e.g., April baseline over 3 years).

### 1.2 Spatial Neighborhood Anomaly ($A_{spatial}$)
To detect localized micro-urban heat island intensity relative to surrounding environs:
$$A_{spatial}(i, t) = LST(i, t) - \text{median}_{j \in N(i)}(LST(j, t))$$
Where $N(i)$ represents the set of **Queen-contiguous spatial neighbors** of cell $i$ (all cells sharing an edge or a vertex in the projected 100m grid, $|N(i)| \le 8$).

---

## 2. Non-Parametric Trend Detection: Sen's Slope & Mann-Kendall

Given a time-series of monthly anomalies $\{a_1, a_2, \dots, a_n\}$ observed at time steps $\{t_1, t_2, \dots, t_n\}$:

### 2.1 Sen's Slope Estimator ($\beta$)
Sen's slope provides a robust, non-parametric measure of monotonic trend that is resistant to outliers (e.g., occasional sensor cloud noise or transient rain cooling):
$$\beta = \text{median}\left( \left\{ \frac{a_j - a_k}{t_j - t_k} \ \middle|\ 1 \le k < j \le n \right\} \right)$$
Expressed in units of **°C per month**.

### 2.2 Mann-Kendall Test Statistic ($S$)
The rank correlation test statistic $S$ evaluates whether monotonic upward or downward trends are statistically significant:
$$S = \sum_{k=1}^{n-1} \sum_{j=k+1}^{n} \text{sgn}(a_j - a_k)$$
$$\text{sgn}(\theta) = \begin{cases} +1 & \text{if } \theta > 0 \\ 0 & \text{if } \theta = 0 \\ -1 & \text{if } \theta < 0 \end{cases}$$

Variance of $S$, accounting for tied groups:
$$V(S) = \frac{1}{18}\left[ n(n - 1)(2n + 5) - \sum_{p=1}^{g} t_p(t_p - 1)(2t_p + 5) \right]$$
Where $g$ is the number of tied groups and $t_p$ is the size of the $p$-th group.

Standard test statistic $Z_{MK}$:
$$Z_{MK} = \begin{cases} 
\frac{S - 1}{\sqrt{V(S)}} & \text{if } S > 0 \\
0 & \text{if } S = 0 \\
\frac{S + 1}{\sqrt{V(S)}} & \text{if } S < 0 
\end{cases}$$

Two-tailed $p$-value:
$$p = 2 \cdot \left(1 - \Phi(|Z_{MK}|)\right)$$
Where $\Phi(\cdot)$ is the standard normal cumulative distribution function. Statistical significance is established at $\alpha = 0.05$.

---

## 3. Structural Regime-Shift Detection (PELT)

To detect abrupt shifts in thermal regimes (such as rapid land clearance, new industrial building completion, or tree canopy destruction), HeatScape utilizes the **Pruned Exact Linear Time (PELT)** algorithm from the `ruptures` library.

### 3.1 Cost Function & Optimization
Given sequence $y = \{a_1, a_2, \dots, a_n\}$:
$$\min_{\tau} \sum_{m=1}^{M+1} \left[ c(y_{\tau_{m-1}:\tau_m}) \right] + \gamma f(M)$$
- **Kernel/Cost Model**: Radial Basis Function (`model="rbf"`) or Gaussian change in mean and variance.
- **Minimum Segment Size**: `min_size = 3` (minimum 3 months between change points).
- **Penalty Parameter ($\gamma$)**: Bayesian Information Criterion (BIC):
  $$\gamma = 2 \ln(n)$$
- **Regime Shift Flag**: $\text{regime\_shift\_detected} = 1.0$ if any change-point is detected in the most recent 18-month window; otherwise $0.0$.

---

## 4. Trajectory State Machine & Calibrated Classification

Thermal behavior across the 36-month window is categorized into five mutually exclusive operational states:

| Operational State | Primary Conditions | Description |
| :--- | :--- | :--- |
| **`PERSISTENT`** | $\text{Recurrence} \ge 0.60$ AND $\text{Mean Anomaly} \ge +1.8^\circ\text{C}$ | Chronic thermal trap; constant structural heating requiring permanent shading/green infrastructure. |
| **`EMERGING`** | $\text{Slope} > +0.025^\circ\text{C}/\text{mo}$ AND $p < 0.05$ AND $\text{Shift}=1.0$ | Rapidly degrading microclimate; urgent early-warning priority for GCC planners. |
| **`TEMPORARY`** | $\text{Latest Anomaly} \ge +2.0^\circ\text{C}$ AND $\text{Recurrence} < 0.35$ | Transient spike; likely driven by short-term construction, temporary lack of irrigation, or weather anomaly. |
| **`IMPROVING`** | Historical Anomaly elevated AND $\text{Slope} < -0.02^\circ\text{C}/\text{mo}$ AND $p < 0.05$ | Microclimate cooling; validates past interventions or positive land cover changes. |
| **`WATCH`** | Volatility $\sigma > 1.8^\circ\text{C}$ OR Valid Obs $< 8$ OR unclassified | High noise, cloud-gap frequency, or ambiguous trajectory. Requires ongoing sensor surveillance. |

### 4.1 Softmax State Probability Vector
For every cell $i$, a normalized affinity score $s_k(i)$ is computed for each state $k \in \{\text{PERSISTENT}, \text{EMERGING}, \text{TEMPORARY}, \text{IMPROVING}, \text{WATCH}\}$ and mapped via softmax:
$$P(\text{State} = k \mid i) = \frac{\exp(s_k(i) / \tau)}{\sum_{m=1}^5 \exp(s_m(i) / \tau)}$$
Where temperature parameter $\tau = 1.0$, providing calibrated confidence scores.

---

## 5. Explainable AI: "Why Hot?" & "Why Now?"

### 5.1 "Why Hot?" TreeSHAP Feature Attribution
A trained Gradient Boosted Tree (XGBoost / LightGBM) predicts cell-level mean LST from physical built-environment features:
$$\widehat{LST}(i) = f(\mathbf{x}_i)$$
Where feature vector $\mathbf{x}_i$ includes:
1. `building_density` (building footprint fraction [0, 1])
2. `road_density` (asphalt coverage fraction [0, 1])
3. `impervious_fraction` (total paved area [0, 1])
4. `tree_canopy_fraction` (canopy cover fraction [0, 1])
5. `roof_area_sqm` (total reflective/non-reflective roof area)
6. `elevation_m` (meters above sea level)
7. `water_distance_m` (distance to nearest water body / Adyar, Cooum, Bay of Bengal)

Using **TreeSHAP**:
$$\widehat{LST}(i) - E[LST] = \sum_{j=1}^{M} \phi_j(i)$$
Where $\phi_j(i)$ is the local Shapley contribution of feature $j$. The top positive contributors explain why the cell is elevated above citywide baseline.

### 5.2 "Why Now?" Temporal Drift Attribution
To explain sudden degradation, we partition the 36-month timeline into a **Baseline Period** ($t \in [1, 18]$) and an **Active Evaluation Period** ($t \in [19, 36]$).
We compute temporal divergence metrics:
$$\Delta NDVI = \overline{NDVI}_{active} - \overline{NDVI}_{baseline}$$
$$\Delta LST = \overline{LST}_{active} - \overline{LST}_{baseline}$$
$$\Delta A_{spatial} = \overline{A_{spatial}}_{active} - \overline{A_{spatial}}_{baseline}$$
If $\Delta NDVI < -0.15$ and regime shift is detected, the primary temporal driver is flagged as **Vegetation Loss / Land Clearance**. If impervious fraction increased, it is flagged as **Rapid Urban Densification**.

---

## 6. Prescriptive Optimization: Mixed-Integer Linear Programming (MILP)

GCC urban administrators operate under strict annual budgetary ceilings. The intervention planner formulates this as a bounded Mixed-Integer Linear Program solved via **Google OR-Tools (SCIP engine)**.

### 6.1 Decision Variables
Let $x_{i, a} \ge 0$ denote the quantity of cooling intervention $a \in \mathcal{A}$ assigned to cell $i \in \mathcal{C}$, where:
$$\mathcal{A} = \{\text{COOL\_ROOF}, \text{URBAN\_CANOPY}, \text{COOL\_PAVEMENT}, \text{SHADE\_CANOPY}\}$$

### 6.2 Physical Feasibility Constraints
For each cell $i$:
1. **Cool Roof Area**:
   $$x_{i, \text{COOL\_ROOF}} \le \text{roof\_area\_sqm}(i) \times 0.80$$
2. **Urban Tree Canopy (planting capacity)**:
   $$x_{i, \text{URBAN\_CANOPY}} \le \max\left(0, \frac{10000 \cdot (1.0 - \text{building\_density}_i - \text{road\_density}_i)}{25.0}\right)$$
   *(Assumes minimum $25\text{ m}^2$ per mature urban tree)*
3. **Cool Pavement**:
   $$x_{i, \text{COOL\_PAVEMENT}} \le 10000 \cdot \text{road\_density}_i \times 0.50$$
4. **Public Transit Shade Canopies**:
   $$x_{i, \text{SHADE\_CANOPY}} \le \min\left(4, \text{sensitive\_site\_count}_i \times 2\right)$$

### 6.3 Budget Constraint
$$\sum_{i \in \mathcal{C}} \sum_{a \in \mathcal{A}} \left( \text{UnitCost}(a) \cdot x_{i, a} \right) \le \text{BudgetINR}$$

### 6.4 Objective Function: Maximizing Population-Weighted Heat Vulnerability Reduction
$$\text{Maximize } \sum_{i \in \mathcal{C}} \sum_{a \in \mathcal{A}} \left( \Delta\text{Risk}(i, a) \cdot \text{Population}(i) \cdot w_{\text{state}}(i) \right) \cdot x_{i, a}$$

Where state priority weights are assigned as:
$$w_{\text{state}}(i) = \begin{cases}
2.0 & \text{if State} = \text{EMERGING} \\
1.5 & \text{if State} = \text{PERSISTENT} \\
1.0 & \text{otherwise}
\end{cases}$$

### 6.5 Uncertainty Simulation Modes
- **`EXPECTED` Mode**:
  - $\text{UnitCost}(a) = \frac{\text{UnitCost}_{low}(a) + \text{UnitCost}_{high}(a)}{2}$
  - $\Delta\text{Risk}(i, a) = \frac{\text{Cooling}_{low}(a) + \text{Cooling}_{high}(a)}{2}$
- **`CONSERVATIVE` Mode**:
  - $\text{UnitCost}(a) = \text{UnitCost}_{high}(a)$ (Upper bound / worst-case budget exhaustion)
  - $\Delta\text{Risk}(i, a) = \text{Cooling}_{low}(a)$ (Lower 10th percentile empirical cooling effectiveness)
