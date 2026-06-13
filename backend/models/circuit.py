from __future__ import annotations
from enum import Enum
from pydantic import BaseModel, Field


class ComponentType(str, Enum):
    resistor = "resistor"
    capacitor = "capacitor"
    inductor = "inductor"
    voltageSource = "voltageSource"
    currentSource = "currentSource"
    switch = "switch"
    led = "led"
    diode = "diode"
    ground = "ground"
    voltmeter = "voltmeter"
    ammeter = "ammeter"
    potentiometer = "potentiometer"
    transistor = "transistor"


class Component(BaseModel):
    id: str
    type: ComponentType
    label: str = ""
    params: dict[str, float] = {}


class Terminal(BaseModel):
    id: str
    componentId: str
    index: int = 0
    nodeId: int = 0


class Wire(BaseModel):
    fromTerminalId: str
    toTerminalId: str


class SimulationRequest(BaseModel):
    components: dict[str, Component]
    terminals: dict[str, Terminal]
    wires: list[Wire]
    analysis: str = "dc"
    duration: float = 1.0
    timestep: float = 1 / 60
