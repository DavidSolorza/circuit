"""
Circuit Lab Backend — FastAPI + SPICE simulation
=================================================
Endpoints:
  POST /api/simulate       — DC / transient simulation
  POST /api/netlist        — Generate SPICE netlist from JSON
  GET  /api/health         — Health check
"""

from __future__ import annotations
import json
import uuid
from enum import Enum
from typing import Any

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Circuit Lab API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Data models ───────────────────────────────────────────────────────────

class ComponentType(str, Enum):
    resistor = "resistor"
    capacitor = "capacitor"
    inductor = "inductor"
    voltageSource = "voltageSource"
    currentSource = "currentSource"
    switch = "switch"
    led = "led"
    ground = "ground"


class Component(BaseModel):
    id: str
    type: ComponentType
    params: dict[str, float] = {}


class Terminal(BaseModel):
    id: str
    componentId: str
    nodeId: int = 0


class Wire(BaseModel):
    fromTerminalId: str
    toTerminalId: str


class SimulationRequest(BaseModel):
    components: dict[str, Component]
    terminals: dict[str, Terminal]
    wires: list[Wire]
    analysis: str = "dc"          # "dc" | "transient"
    duration: float = 1.0
    timestep: float = 1 / 60


class SimulationResponse(BaseModel):
    time: list[float]
    nodeVoltages: dict[str, list[float]]    # node_id → list over time
    branchCurrents: dict[str, list[float]]  # component_id → list over time
    power: dict[str, list[float]]


# ─── SPICE Netlist generation ──────────────────────────────────────────────

SPICE_MODEL: dict[str, str] = {
    "resistor": "R",
    "capacitor": "C",
    "inductor": "L",
    "voltageSource": "V",
    "currentSource": "I",
    "switch": "S",
    "led": "D",
}


def build_netlist(req: SimulationRequest) -> str:
    """Build a SPICE netlist from the circuit JSON."""
    lines = ["* Circuit Lab — auto-generated netlist", ""]

    # Resolve node IDs through wires (node merging)
    node_map: dict[int, int] = {}
    for t in req.terminals.values():
        node_map[t.nodeId] = t.nodeId

    for w in req.wires:
        ft = req.terminals.get(w.fromTerminalId)
        tt = req.terminals.get(w.toTerminalId)
        if ft is None or tt is None:
            continue
        a, b = ft.nodeId, tt.nodeId
        if a == b:
            continue
        old = max(a, b)
        new = min(a, b)
        merge(node_map, old, new)

    def resolve(n: int) -> int:
        while node_map[n] != n:
            node_map[n] = node_map[node_map[n]]
            n = node_map[n]
        return n

    # Ground node is always 0
    for k in node_map:
        node_map[k] = resolve(k)

    # Write components
    for c in req.components.values():
        t0 = req.terminals.get(c.id + "_0") or next(
            (t for t in req.terminals.values() if t.componentId == c.id and t.index == 0), None
        )
        t1 = req.terminals.get(c.id + "_1") or next(
            (t for t in req.terminals.values() if t.componentId == c.id and t.index == 1), None
        )
        if t0 is None or t1 is None:
            continue

        n0 = resolve(t0.nodeId)
        n1 = resolve(t1.nodeId)
        ref = f"{n0} {n1}"

        if c.type == "resistor":
            r = c.params.get("resistance", 1000)
            lines.append(f"R{c.id} {ref} {r}")
        elif c.type == "capacitor":
            cv = c.params.get("capacitance", 1e-6)
            lines.append(f"C{c.id} {ref} {cv} IC=0")
        elif c.type == "inductor":
            lv = c.params.get("inductance", 1e-3)
            lines.append(f"L{c.id} {ref} {lv} IC=0")
        elif c.type == "voltageSource":
            v = c.params.get("voltage", 9)
            lines.append(f"V{c.id} {n0} 0 DC {v}")
            lines.append(f"R_VSENSE_{c.id} {n1} 0 0.001")  # current sense
        elif c.type == "currentSource":
            i = c.params.get("current", 0.01)
            lines.append(f"I{c.id} {ref} DC {i}")
        elif c.type == "led":
            # LED as diode with forward voltage
            fv = c.params.get("forwardVoltage", 2.0)
            lines.append(f"D{c.id} {ref} DLED_{c.id}")
            lines.append(f".MODEL DLED_{c.id} D(IS=1e-14 N=1.5 VJ={fv})")
        elif c.type == "switch":
            closed = c.params.get("isClosed", 0)
            if closed:
                lines.append(f"R{c.id} {ref} 0.001")  # closed = tiny resistance
            else:
                lines.append(f"R{c.id} {ref} 1e9")    # open = huge resistance

    lines.append("")
    if req.analysis == "dc":
        lines.append(".DC V0 0 0 1")
    else:
        lines.append(f".TRAN {req.timestep} {req.duration} UIC")
    lines.append(".OPTIONS POST=2")
    lines.append(".END")
    return "\n".join(lines)


def merge(m: dict[int, int], old: int, new: int):
    """Merge node `old` into node `new`."""
    for k in m:
        while m[k] != m.get(m[k], m[k]):
            m[k] = m[m[k]]
        if m[k] == old:
            m[k] = new


# ─── Native MNA solver (fallback when PySpice not available) ───────────────

def solve_mna(req: SimulationRequest) -> SimulationResponse:
    """Pure-Python MNA solver using numpy (no PySpice required)."""
    terms = req.terminals

    # Resolve merged nodes
    node_map: dict[int, int] = {}
    for t in terms.values():
        node_map[t.nodeId] = t.nodeId
    for w in req.wires:
        ft = terms.get(w.fromTerminalId)
        tt = terms.get(w.toTerminalId)
        if ft is None or tt is None:
            continue
        a, b = ft.nodeId, tt.nodeId
        if a == 0 or b == 0:
            continue
        if a != b:
            old = max(a, b)
            new = min(a, b)
            for k in node_map:
                if node_map[k] == old:
                    node_map[k] = new

    def resolve(n: int) -> int:
        while node_map[n] != n:
            node_map[n] = node_map[node_map[n]]
            n = node_map[n]
        return n

    all_nodes = set(resolve(t.nodeId) for t in terms.values())
    non_ground = sorted(n for n in all_nodes if n != 0)
    nv = len(non_ground)
    node_idx = {n: i for i, n in enumerate(non_ground)}

    dt = req.timestep
    n_steps = int(req.duration / dt) if req.analysis == "transient" else 1

    # Collect voltage sources
    vs_list: list[dict] = []
    cap_list: list[dict] = []
    ind_list: list[dict] = []
    for c in req.components.values():
        t0 = next((t for t in terms.values() if t.componentId == c.id and t.index == 0), None)
        t1 = next((t for t in terms.values() if t.componentId == c.id and t.index == 1), None)
        if t0 is None or t1 is None:
            continue
        p = resolve(t0.nodeId)
        n = resolve(t1.nodeId)
        if c.type in ("voltageSource", "led"):
            v = c.params.get("voltage" if c.type == "voltageSource" else "forwardVoltage", 9 if c.type == "voltageSource" else 2)
            vs_list.append({"id": c.id, "pos": p, "neg": n, "v": v})
        elif c.type == "switch" and c.params.get("isClosed", 0):
            vs_list.append({"id": c.id, "pos": p, "neg": n, "v": 0})
        elif c.type == "inductor":
            ind_list.append({"id": c.id, "pos": p, "neg": n, "L": c.params.get("inductance", 1e-3)})
        elif c.type == "capacitor":
            cap_list.append({"id": c.id, "pos": p, "neg": n, "C": c.params.get("capacitance", 1e-6)})

    n_vs = len(vs_list)
    n_ind = len(ind_list)
    total_vars = nv + n_vs + n_ind

    if total_vars == 0:
        return SimulationResponse(
            time=[0], nodeVoltages={"0": [0]}, branchCurrents={}, power={})

    # State for dynamic elements
    cap_prev_v: dict[str, float] = {}
    ind_prev_i: dict[str, float] = {}

    time_axis: list[float] = []
    node_data: dict[str, list[float]] = {str(n): [] for n in non_ground}
    node_data["0"] = []
    branch_data: dict[str, list[float]] = {}
    power_data: dict[str, list[float]] = {}

    for step in range(n_steps):
        t = step * dt
        A = np.zeros((total_vars, total_vars))
        B = np.zeros(total_vars)

        # Resistor stamps
        for c in req.components.values():
            if c.type != "resistor":
                continue
            t0 = next((t for t in terms.values() if t.componentId == c.id and t.index == 0), None)
            t1 = next((t for t in terms.values() if t.componentId == c.id and t.index == 1), None)
            if t0 is None or t1 is None:
                continue
            p = resolve(t0.nodeId); n = resolve(t1.nodeId)
            R = c.params.get("resistance", 1000)
            if R <= 0:
                continue
            G = 1.0 / R
            for nid, sign in [(p, 1), (n, -1)]:
                if nid == 0:
                    continue
                i = node_idx[nid]
                A[i, i] += G
                other = n if sign == 1 else p
                if other != 0:
                    j = node_idx[other]
                    A[i, j] -= G

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
        for c in req.components.values():
            if c.type != "currentSource":
                continue
            t0 = next((t for t in terms.values() if t.componentId == c.id and t.index == 0), None)
            t1 = next((t for t in terms.values() if t.componentId == c.id and t.index == 1), None)
            if t0 is None or t1 is None:
                continue
            p = resolve(t0.nodeId); n = resolve(t1.nodeId)
            Isrc = c.params.get("current", 0.01)
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

        # Solve
        try:
            x = np.linalg.solve(A, B)
        except np.linalg.LinAlgError:
            x = np.zeros(total_vars)

        # Extract voltages
        voltage_map: dict[int, float] = {n: x[node_idx[n]] for n in non_ground}
        voltage_map[0] = 0.0

        for nid, v in voltage_map.items():
            node_data[str(nid)].append(float(v))

        # Extract branch currents
        for j, vs in enumerate(vs_list):
            branch_data[vs["id"]] = branch_data.get(vs["id"], [])
            i_val = float(x[nv + j])
            branch_data[vs["id"]].append(i_val)

        for j, ind in enumerate(ind_list):
            i_val = float(x[nv + n_vs + j])
            branch_data[ind["id"]] = branch_data.get(ind["id"], [])
            branch_data[ind["id"]].append(i_val)
            ind_prev_i[ind["id"]] = i_val

        # Resistor currents
        for c in req.components.values():
            if c.type != "resistor":
                continue
            t0 = next((t for t in terms.values() if t.componentId == c.id and t.index == 0), None)
            t1 = next((t for t in terms.values() if t.componentId == c.id and t.index == 1), None)
            if t0 is None or t1 is None:
                continue
            p = resolve(t0.nodeId); n = resolve(t1.nodeId)
            R = c.params.get("resistance", 1000)
            if R <= 0:
                continue
            vp = voltage_map.get(p, 0); vn = voltage_map.get(n, 0)
            branch_data[c.id] = branch_data.get(c.id, [])
            i_val = (vp - vn) / R
            branch_data[c.id].append(float(i_val))

        # Capacitor currents
        for cap in cap_list:
            p, n = cap["pos"], cap["neg"]
            C = cap["C"]
            key = cap["id"]
            vp = voltage_map.get(p, 0); vn = voltage_map.get(n, 0)
            v_diff = vp - vn
            v_prev = cap_prev_v.get(key, 0.0)
            i_val = C * (v_diff - v_prev) / dt
            branch_data[key] = branch_data.get(key, [])
            branch_data[key].append(float(i_val))
            cap_prev_v[key] = v_diff

        # Power
        for c in req.components.values():
            i_vals = branch_data.get(c.id)
            if i_vals is None or not i_vals:
                continue
            t0 = next((t for t in terms.values() if t.componentId == c.id and t.index == 0), None)
            t1 = next((t for t in terms.values() if t.componentId == c.id and t.index == 1), None)
            if t0 is None or t1 is None:
                continue
            p = resolve(t0.nodeId); n = resolve(t1.nodeId)
            vp = voltage_map.get(p, 0); vn = voltage_map.get(n, 0)
            pwr = float((vp - vn) * i_vals[-1])
            power_data[c.id] = power_data.get(c.id, [])
            power_data[c.id].append(pwr)

        time_axis.append(float(t))

    return SimulationResponse(
        time=time_axis,
        nodeVoltages=node_data,
        branchCurrents=branch_data,
        power=power_data,
    )


# ─── API endpoints ─────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@app.post("/api/netlist")
def generate_netlist(req: SimulationRequest):
    """Generate a SPICE netlist from the circuit JSON."""
    try:
        netlist = build_netlist(req)
        return {"netlist": netlist}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/simulate", response_model=SimulationResponse)
def simulate(req: SimulationRequest):
    """Run DC or transient simulation using native MNA solver."""
    try:
        return solve_mna(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/simulate/spice", response_model=SimulationResponse)
def simulate_spice(req: SimulationRequest):
    """Run simulation using PySpice (if installed)."""
    try:
        import PySpice
        return solve_mna(req)  # fallback to MNA for now
    except ImportError:
        raise HTTPException(status_code=501, detail="PySpice not installed. Use POST /api/simulate instead.")


# ─── Run ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
