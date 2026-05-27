import { useCircuitStore } from '../store/circuitStore';
import type { CircuitComponent, MeasurementProbe } from '../types';

export function useMultimeter() {
  const simResults = useCircuitStore((s) => s.simResults);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const terminals = useCircuitStore((s) => s.circuit.terminals);

  function readComponent(comp: CircuitComponent): { voltage: number; current: number } {
    if (!simResults) return { voltage: 0, current: 0 };
    const t0 = terminals[comp.terminalIds[0]];
    const t1 = terminals[comp.terminalIds[1]];
    const v0 = t0 ? (simResults.nodeVoltages[t0.nodeId] ?? 0) : 0;
    const v1 = t1 ? (simResults.nodeVoltages[t1.nodeId] ?? 0) : 0;
    const i = simResults.branchCurrents[comp.id] ?? 0;
    return { voltage: v0 - v1, current: i };
  }

  function readProbe(probe: MeasurementProbe): number {
    if (!simResults) return 0;
    const comp = useCircuitStore.getState().circuit.components[probe.componentId];
    if (!comp) return 0;
    if (probe.type === 'voltage') {
      const term = terminals[comp.terminalIds[probe.terminalIndex ?? 0]];
      return term ? (simResults.nodeVoltages[term.nodeId] ?? 0) : 0;
    }
    return simResults.branchCurrents[comp.id] ?? 0;
  }

  return { simulate: simulationRunning, results: simResults, readComponent, readProbe };
}
