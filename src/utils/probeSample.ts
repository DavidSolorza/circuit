import type { CircuitState, MeasurementProbe, SimResults } from '../types';
import { getElectricalNodeForTerminal } from '../services/localSimulation';

/** Read instantaneous probe value from a simulation snapshot. */
export function readProbeSample(
  circuit: CircuitState,
  res: SimResults,
  probe: MeasurementProbe,
): number | null {
  const comp = circuit.components[probe.componentId];
  if (!comp) return null;

  if (probe.type === 'current') {
    return res.branchCurrents[comp.id]?.[0] ?? 0;
  }

  const n0 = getElectricalNodeForTerminal(circuit, comp.terminalIds[0]);
  const n1 = getElectricalNodeForTerminal(circuit, comp.terminalIds[1]);
  const v0 = res.nodeVoltages[String(n0)]?.[0] ?? 0;
  const v1 = res.nodeVoltages[String(n1)]?.[0] ?? 0;

  if (comp.type === 'voltmeter' || comp.type === 'resistor' || comp.type === 'led') {
    return v0 - v1;
  }

  const termId = comp.terminalIds[probe.terminalIndex ?? 0];
  const nodeId = getElectricalNodeForTerminal(circuit, termId);
  return res.nodeVoltages[String(nodeId)]?.[0] ?? 0;
}

/** Freeze the last sample at the current sim time before a topology/param change. */
export function stampOscTransition(
  circuit: CircuitState,
  probes: MeasurementProbe[],
  oscData: Record<string, Array<{ t: number; v: number }>>,
  res: SimResults,
  simTime: number,
): Record<string, Array<{ t: number; v: number }>> {
  const next = { ...oscData };

  for (const probe of probes) {
    const value = readProbeSample(circuit, res, probe);
    if (value === null) continue;

    const bucket = [...(next[probe.id] ?? [])];
    const last = bucket[bucket.length - 1];
    if (!last || last.t < simTime - 1e-9) {
      bucket.push({ t: simTime, v: value });
    } else {
      bucket[bucket.length - 1] = { t: simTime, v: value };
    }
    next[probe.id] = bucket;
  }

  return next;
}
