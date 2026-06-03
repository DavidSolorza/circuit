import { useCircuitStore } from '../store/circuitStore';
import type { CircuitComponent, MeasurementProbe } from '../types';
import { getElectricalNodeForTerminal } from '../services/localSimulation';

function getLatest(arr: number[] | undefined): number {
  if (!arr || arr.length === 0) return 0;
  return arr[arr.length - 1];
}

export function useMultimeter() {
  const simResults = useCircuitStore((s) => s.simResults);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const circuit = useCircuitStore((s) => s.circuit);

  function readComponent(comp: CircuitComponent): { voltage: number; current: number } {
    if (!simResults || !simResults.status.success) return { voltage: 0, current: 0 };

    const n0 = getElectricalNodeForTerminal(circuit, comp.terminalIds[0]);
    const n1 = getElectricalNodeForTerminal(circuit, comp.terminalIds[1]);
    const v0 = getLatest(simResults.nodeVoltages[String(n0)]);
    const v1 = getLatest(simResults.nodeVoltages[String(n1)]);
    const i = getLatest(simResults.branchCurrents[comp.id]);
    return { voltage: v0 - v1, current: i };
  }

  function readProbe(probe: MeasurementProbe): number {
    if (!simResults || !simResults.status.success) return 0;
    const comp = circuit.components[probe.componentId];
    if (!comp) return 0;

    if (probe.type === 'voltage') {
      const termId = comp.terminalIds[probe.terminalIndex ?? 0];
      const nodeId = getElectricalNodeForTerminal(circuit, termId);
      return getLatest(simResults.nodeVoltages[String(nodeId)]);
    }
    return getLatest(simResults.branchCurrents[comp.id]);
  }

  return { isRunning: simulationRunning, results: simResults, readComponent, readProbe };
}
