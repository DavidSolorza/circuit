import { useCircuitStore } from '../store/circuitStore';
import type { CircuitComponent, MeasurementProbe } from '../types';

function getLatest(arr: number[] | undefined): number {
  if (!arr || arr.length === 0) return 0;
  return arr[arr.length - 1];
}

export function useMultimeter() {
  const simResults = useCircuitStore((s) => s.simResults);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const terminals = useCircuitStore((s) => s.circuit.terminals);

  function readComponent(comp: CircuitComponent): { voltage: number; current: number } {
    if (!simResults || !simResults.status.success) return { voltage: 0, current: 0 };
    const t0 = terminals[comp.terminalIds[0]];
    const t1 = terminals[comp.terminalIds[1]];
    const v0 = t0 ? getLatest(simResults.nodeVoltages[String(t0.nodeId)]) : 0;
    const v1 = t1 ? getLatest(simResults.nodeVoltages[String(t1.nodeId)]) : 0;
    const i = getLatest(simResults.branchCurrents[comp.id]);
    return { voltage: v0 - v1, current: i };
  }

  function readProbe(probe: MeasurementProbe): number {
    if (!simResults || !simResults.status.success) return 0;
    const comp = useCircuitStore.getState().circuit.components[probe.componentId];
    if (!comp) return 0;
    if (probe.type === 'voltage') {
      const term = terminals[comp.terminalIds[probe.terminalIndex ?? 0]];
      return term ? getLatest(simResults.nodeVoltages[String(term.nodeId)]) : 0;
    }
    return getLatest(simResults.branchCurrents[comp.id]);
  }

  return { isRunning: simulationRunning, results: simResults, readComponent, readProbe };
}
