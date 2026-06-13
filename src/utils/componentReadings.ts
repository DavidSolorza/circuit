import type { CircuitComponent, CircuitState, ComponentType, MeasurementProbe, SimResults } from '../types';
import { getElectricalNodeForTerminal } from '../services/localSimulation';

/** Components where default voltage probe = V(T0) − V(T1) */
const DIFFERENTIAL_VOLTAGE_TYPES = new Set<ComponentType>([
  'resistor',
  'capacitor',
  'inductor',
  'led',
  'diode',
  'switch',
  'potentiometer',
  'voltmeter',
  'ammeter',
  'lamp',
  'fuse',
  'voltageSource',
  'currentSource',
]);

export interface ComponentReadings {
  /** V(T0) − V(T1) */
  voltage: number;
  /** Branch current T0 → T1 (A) */
  current: number;
  power: number;
}

function getLatest(arr: number[] | undefined): number {
  if (!arr || arr.length === 0) return 0;
  return arr[arr.length - 1]!;
}

function nodeVoltage(simResults: SimResults, nodeId: number | null): number | null {
  if (nodeId === null) return null;
  if (nodeId === 0) return 0;
  const arr = simResults.nodeVoltages[String(nodeId)];
  if (!arr || arr.length === 0) return null;
  return getLatest(arr);
}

export function getComponentReadings(
  circuit: CircuitState,
  simResults: SimResults | null | undefined,
  comp: CircuitComponent,
): ComponentReadings | null {
  if (!simResults?.status.success) return null;

  const n0 = getElectricalNodeForTerminal(circuit, comp.terminalIds[0]);
  const n1 = getElectricalNodeForTerminal(circuit, comp.terminalIds[1]);
  const v0 = nodeVoltage(simResults, n0);
  const v1 = nodeVoltage(simResults, n1);
  if (v0 === null || v1 === null) return null;

  const voltage = v0 - v1;
  const current = getLatest(simResults.branchCurrents[comp.id]);

  return { voltage, current, power: voltage * current };
}

export function getProbeReading(
  circuit: CircuitState,
  simResults: SimResults | null | undefined,
  probe: MeasurementProbe,
): number | null {
  if (!simResults?.status.success) return null;

  const comp = circuit.components[probe.componentId];
  if (!comp) return null;

  if (probe.type === 'current') {
    return getLatest(simResults.branchCurrents[comp.id]);
  }

  if (DIFFERENTIAL_VOLTAGE_TYPES.has(comp.type)) {
    return getComponentReadings(circuit, simResults, comp)?.voltage ?? null;
  }

  const termId = comp.terminalIds[probe.terminalIndex ?? 0];
  const nodeId = getElectricalNodeForTerminal(circuit, termId);
  const vTerm = nodeVoltage(simResults, nodeId);
  return vTerm;
}

/** Human label for current direction (+ = T0 → T1) */
export function currentDirectionLabel(current: number): string {
  if (Math.abs(current) < 1e-12) return 'sin corriente';
  return current > 0 ? 'borne 1 → borne 2' : 'borne 2 → borne 1';
}
