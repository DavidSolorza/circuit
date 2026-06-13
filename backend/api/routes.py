from __future__ import annotations
from fastapi import APIRouter, HTTPException
from ..models.circuit import SimulationRequest
from ..models.simulation import SimulationResponse
from ..simulation.engine import simulate_mna
from ..spice.builder import build_netlist
from ..validators.circuit_validator import validate_circuit

router = APIRouter(prefix="/api")


@router.get("/health")
def health():
    return {"status": "ok", "version": "0.1.2"}


@router.post("/simulate", response_model=SimulationResponse)
def simulate(req: SimulationRequest):
    try:
        return simulate_mna(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/simulate/validate")
def validate(req: SimulationRequest):
    valid, errors, warnings = validate_circuit(req)
    return {"valid": valid, "errors": errors, "warnings": warnings}


@router.post("/netlist")
def generate_netlist(req: SimulationRequest):
    try:
        netlist = build_netlist(req)
        return {"netlist": netlist}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/simulate/spice", response_model=SimulationResponse)
def simulate_spice(req: SimulationRequest):
    try:
        import PySpice  # noqa: F401
        return simulate_mna(req)
    except ImportError:
        raise HTTPException(
            status_code=501,
            detail="PySpice not installed. Use POST /api/simulate instead.",
        )
