from __future__ import annotations
from pydantic import BaseModel


class ValidationResult(BaseModel):
    valid: bool
    errors: list[str]
    warnings: list[str]


class SimulationStatus(BaseModel):
    success: bool
    message: str
    error: str | None = None


class SimulationResponse(BaseModel):
    status: SimulationStatus
    time: list[float]
    nodeVoltages: dict[str, list[float]]
    branchCurrents: dict[str, list[float]]
    power: dict[str, list[float]]
    validation: ValidationResult
