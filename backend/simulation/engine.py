"""Pure numpy MNA simulation engine (no PySpice required)."""

from __future__ import annotations
import numpy as np
from ..models.circuit import SimulationRequest, ComponentType
from ..models.simulation import SimulationResponse, SimulationStatus, ValidationResult
from ..validators.circuit_validator import validate_circuit

VOLTMETER_R = 1e12
AMMETER_R = 1e-6
DIODE_R_ON = 25.0
DIODE_R_OFF = 1e9
LED_R_ON = 40.0
TRANSISTOR_R = 1e9


def _resolve_nodes(
    req: SimulationRequest,
) -> tuple[dict[int, int], dict[str, int], list[int], dict[int, int]]:
    """Resolve node merging and build index maps."""
    node_map: dict[int, int] = {}
    for t in req.terminals.values():
        node_map[t.nodeId] = t.nodeId

    for w in req.wires:
        ft = req.terminals.get(w.fromTerminalId)
        tt = req.terminals.get(w.toTerminalId)
        if ft is None or tt is None:
            continue
        a, b = ft.nodeId, tt.nodeId
        if a != b:
            old, new = max(a, b), min(a, b)
            for k in list(node_map.keys()):
                if node_map[k] == old:
                    node_map[k] = new

    def resolve(n: int) -> int:
        while node_map[n] != n:
            node_map[n] = node_map[node_map[n]]
            n = node_map[n]
        return n

    for k in node_map:
        node_map[k] = resolve(k)

    all_nodes = set(node_map.values())
    non_ground = sorted(n for n in all_nodes if n != 0)
    node_idx = {n: i for i, n in enumerate(non_ground)}

    term_node: dict[str, int] = {}
    for tid, t in req.terminals.items():
        term_node[tid] = resolve(t.nodeId)

    return node_map, term_node, non_ground, node_idx


def _comp_terminals(
    req: SimulationRequest, term_node: dict[str, int]
) -> dict[str, tuple[int, int]]:
    """Map component IDs to their terminal node pair (pos, neg)."""
    result: dict[str, tuple[int, int]] = {}
    for cid, comp in req.components.items():
        t0 = next(
            (
                t
                for t in req.terminals.values()
                if t.componentId == cid and t.index == 0
            ),
            None,
        )
        t1 = next(
            (
                t
                for t in req.terminals.values()
                if t.componentId == cid and t.index == 1
            ),
            None,
        )
        if t0 is not None and t1 is not None:
            result[cid] = (term_node[t0.id], term_node[t1.id])
    return result


def _stamp_conductance(
    A: np.ndarray,
    B: np.ndarray,
    node_idx: dict[int, int],
    pos: int,
    neg: int,
    G: float,
) -> None:
    """Stamp conductance G between pos and neg nodes (ground = node 0)."""
    if G <= 0:
        return
    for nid, sign in ((pos, 1), (neg, -1)):
        if nid == 0:
            continue
        i = node_idx[nid]
        A[i, i] += G
        other = neg if sign == 1 else pos
        if other != 0:
            j = node_idx[other]
            A[i, j] -= G


def _stamp_current_source(
    B: np.ndarray,
    node_idx: dict[int, int],
    pos: int,
    neg: int,
    current: float,
) -> None:
    """Stamp current entering pos and leaving neg."""
    if pos != 0:
        B[node_idx[pos]] -= current
    if neg != 0:
        B[node_idx[neg]] += current


def _effective_resistance(comp_type: ComponentType, params: dict[str, float]) -> float | None:
    if comp_type == ComponentType.resistor:
        R = params.get("resistance", 1000)
        return R if R > 0 else None
    if comp_type == ComponentType.voltmeter:
        return VOLTMETER_R
    if comp_type == ComponentType.ammeter:
        return AMMETER_R
    if comp_type == ComponentType.potentiometer:
        Rmax = params.get("maxResistance", 10_000)
        wiper = max(0.0, min(1.0, params.get("wiper", 0.5)))
        if wiper < 0.001:
            return DIODE_R_OFF
        return Rmax * wiper
    if comp_type == ComponentType.transistor:
        return TRANSISTOR_R
    return None


def simulate_mna(req: SimulationRequest) -> SimulationResponse:
    """Run DC or transient simulation using numpy MNA solver."""
    valid, errors, warnings = validate_circuit(req)

    validation = ValidationResult(valid=valid, errors=errors, warnings=warnings)
    if not valid:
        return SimulationResponse(
            status=SimulationStatus(success=False, message="Validation failed", error="; ".join(errors)),
            time=[],
            nodeVoltages={},
            branchCurrents={},
            power={},
            validation=validation,
        )

    try:
        return _run_simulation(req)
    except Exception as e:
        return SimulationResponse(
            status=SimulationStatus(success=False, message="Simulation failed", error=str(e)),
            time=[],
            nodeVoltages={},
            branchCurrents={},
            power={},
            validation=validation,
        )


def _run_simulation(req: SimulationRequest) -> SimulationResponse:
    node_map, term_node, non_ground, node_idx = _resolve_nodes(req)
    comp_terms = _comp_terminals(req, term_node)
    nv = len(non_ground)

    dt = req.timestep
    n_steps = int(req.duration / dt) if req.analysis == "transient" else 1

    # Collect dynamic elements
    vs_list: list[dict] = []
    cap_list: list[dict] = []
    ind_list: list[dict] = []

    for cid, comp in req.components.items():
        nodes = comp_terms.get(cid)
        if nodes is None:
            continue
        p, n = nodes

        if comp.type == ComponentType.voltageSource:
            v_val = comp.params.get("voltage", 9)
            vs_list.append({"id": cid, "pos": p, "neg": n, "v": v_val})

        elif comp.type == ComponentType.switch and comp.params.get("isClosed", 0):
            vs_list.append({"id": cid, "pos": p, "neg": n, "v": 0})

        elif comp.type == ComponentType.inductor:
            ind_list.append(
                {"id": cid, "pos": p, "neg": n, "L": comp.params.get("inductance", 1e-3)}
            )

        elif comp.type == ComponentType.capacitor:
            cap_list.append(
                {"id": cid, "pos": p, "neg": n, "C": comp.params.get("capacitance", 1e-6)}
            )

    n_vs = len(vs_list)
    n_ind = len(ind_list)
    total_vars = nv + n_vs + n_ind

    if total_vars == 0:
        return SimulationResponse(
            status=SimulationStatus(success=True, message="No variables to solve"),
            time=[0],
            nodeVoltages={"0": [0]},
            branchCurrents={},
            power={},
            validation=ValidationResult(
                valid=True, errors=[], warnings=["No components to simulate."]
            ),
        )

    # Time-stepping state
    cap_prev_v: dict[str, float] = {}
    ind_prev_i: dict[str, float] = {}
    vd_state: dict[str, float] = {}

    time_axis: list[float] = []
    node_data: dict[str, list[float]] = {str(n): [] for n in non_ground}
    node_data["0"] = []
    branch_data: dict[str, list[float]] = {}
    power_data: dict[str, list[float]] = {}

    for step in range(n_steps):
        t = step * dt
        A = np.zeros((total_vars, total_vars))
        B = np.zeros(total_vars)

        # Conductance stamps (R, medidores, potenciómetro, transistor)
        for cid, comp in req.components.items():
            nodes = comp_terms.get(cid)
            if nodes is None:
                continue
            p, n = nodes
            R = _effective_resistance(comp.type, comp.params)
            if R is not None:
                _stamp_conductance(A, B, node_idx, p, n, 1.0 / R)
                continue

            if comp.type in (ComponentType.diode, ComponentType.led):
                default_vf = 2.0 if comp.type == ComponentType.led else 0.7
                r_on = LED_R_ON if comp.type == ComponentType.led else DIODE_R_ON
                vf = comp.params.get("forwardVoltage", default_vf)
                vd_prev = vd_state.get(cid, 0.0)
                on = vd_prev >= vf * 0.65
                if on:
                    G = 1.0 / r_on
                    _stamp_conductance(A, B, node_idx, p, n, G)
                    _stamp_current_source(B, node_idx, p, n, G * vf)
                else:
                    _stamp_conductance(A, B, node_idx, p, n, 1.0 / DIODE_R_OFF)

        # Capacitor stamps (Backward Euler)
        for cap in cap_list:
            p, n = cap["pos"], cap["neg"]
            C = cap["C"]
            Geq = C / dt
            key = cap["id"]
            v_prev = cap_prev_v.get(key, 0.0)
            Ihist = Geq * v_prev
            for nid, sign in [(p, 1), (n, -1)]:
                if nid == 0:
                    continue
                i = node_idx[nid]
                A[i, i] += Geq
                other = n if sign == 1 else p
                if other != 0:
                    j = node_idx[other]
                    A[i, j] -= Geq
                B[i] -= sign * Ihist

        # Current source stamps
        for cid, comp in req.components.items():
            if comp.type != ComponentType.currentSource:
                continue
            nodes = comp_terms.get(cid)
            if nodes is None:
                continue
            p, n = nodes
            Isrc = comp.params.get("current", 0.01)
            for nid, sign in [(p, -1), (n, 1)]:
                if nid == 0:
                    continue
                i = node_idx[nid]
                B[i] += sign * Isrc

        # Voltage source stamps
        var_offset = nv
        for j, vs in enumerate(vs_list):
            col = var_offset + j
            for nid, coef in [(vs["pos"], 1), (vs["neg"], -1)]:
                if nid == 0:
                    continue
                i = node_idx[nid]
                A[i, col] += coef
                A[col, i] += coef
            B[col] = vs["v"]

        # Inductor stamps (Backward Euler)
        for j, ind in enumerate(ind_list):
            col = var_offset + n_vs + j
            p, n = ind["pos"], ind["neg"]
            L = ind["L"]
            Req = L / dt
            key = ind["id"]
            i_prev = ind_prev_i.get(key, 0.0)
            Veq = Req * i_prev
            for nid, coef in [(p, 1), (n, -1)]:
                if nid == 0:
                    continue
                i = node_idx[nid]
                A[i, col] += coef
                A[col, i] += coef
            A[col, col] -= Req
            B[col] = -Veq

        # Ground (node 0) pinning: force V(0)=0
        if 0 in node_idx:
            g_row = node_idx[0]
            A[g_row, :] = 0
            A[g_row, g_row] = 1
            B[g_row] = 0

        # Solve
        try:
            x = np.linalg.solve(A, B)
        except np.linalg.LinAlgError:
            x = np.zeros(total_vars)

        # Extract voltages
        voltage_map: dict[int, float] = {n: float(x[node_idx[n]]) for n in non_ground}
        voltage_map[0] = 0.0

        for nid, v in voltage_map.items():
            node_data[str(nid)].append(v)

        # Voltage source / LED branch currents
        for j, vs in enumerate(vs_list):
            branch_data[vs["id"]] = branch_data.get(vs["id"], [])
            branch_data[vs["id"]].append(float(x[nv + j]))

        # Inductor currents
        for j, ind in enumerate(ind_list):
            i_val = float(x[nv + n_vs + j])
            branch_data[ind["id"]] = branch_data.get(ind["id"], [])
            branch_data[ind["id"]].append(i_val)
            ind_prev_i[ind["id"]] = i_val

        # Branch currents for conductance elements
        for cid, comp in req.components.items():
            nodes = comp_terms.get(cid)
            if nodes is None:
                continue
            p, n = nodes
            vp = voltage_map.get(p, 0)
            vn = voltage_map.get(n, 0)
            v_diff = vp - vn

            R = _effective_resistance(comp.type, comp.params)
            if R is not None:
                branch_data[cid] = branch_data.get(cid, [])
                branch_data[cid].append(float(v_diff / R))
                continue

            if comp.type in (ComponentType.diode, ComponentType.led):
                default_vf = 2.0 if comp.type == ComponentType.led else 0.7
                r_on = LED_R_ON if comp.type == ComponentType.led else DIODE_R_ON
                vf = comp.params.get("forwardVoltage", default_vf)
                vd = vn - vp
                vd_state[cid] = vd
                if vd >= vf:
                    i_val = (vd - vf) / r_on
                else:
                    i_val = vd / DIODE_R_OFF
                branch_data[cid] = branch_data.get(cid, [])
                branch_data[cid].append(float(i_val))

        # Capacitor currents
        for cap in cap_list:
            p, n = cap["pos"], cap["neg"]
            C = cap["C"]
            key = cap["id"]
            vp = voltage_map.get(p, 0)
            vn = voltage_map.get(n, 0)
            v_diff = vp - vn
            v_prev = cap_prev_v.get(key, 0.0)
            i_val = C * (v_diff - v_prev) / dt
            branch_data[key] = branch_data.get(key, [])
            branch_data[key].append(float(i_val))
            cap_prev_v[key] = v_diff

        # Power
        for cid in req.components:
            i_vals = branch_data.get(cid)
            if i_vals is None or not i_vals:
                continue
            nodes = comp_terms.get(cid)
            if nodes is None:
                continue
            p, n = nodes
            vp = voltage_map.get(p, 0)
            vn = voltage_map.get(n, 0)
            pwr = float((vp - vn) * i_vals[-1])
            power_data[cid] = power_data.get(cid, [])
            power_data[cid].append(pwr)

        time_axis.append(float(t))

    return SimulationResponse(
        status=SimulationStatus(success=True, message="Simulation completed successfully"),
        time=time_axis,
        nodeVoltages=node_data,
        branchCurrents=branch_data,
        power=power_data,
        validation=ValidationResult(valid=True, errors=[], warnings=[]),
    )


def simulate_transient(req: SimulationRequest) -> SimulationResponse:
    """Run transient analysis (delegates to _run_simulation with transient config)."""
    return _run_simulation(req)
