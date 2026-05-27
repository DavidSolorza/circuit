import { useCircuitStore } from '../store/circuitStore';
import type { MeasurementProbe } from '../types';

export function useMeasurements() {
  const probes = useCircuitStore((s) => s.probes);
  const simResults = useCircuitStore((s) => s.simResults);
  const terminals = useCircuitStore((s) => s.circuit.terminals);
  const components = useCircuitStore((s) => s.circuit.components);
  const addProbe = useCircuitStore((s) => s.addProbe);
  const removeProbe = useCircuitStore((s) => s.removeProbe);
  const toggleProbe = useCircuitStore((s) => s.toggleProbeVisibility);

  function getProbeValue(probe: MeasurementProbe): number {
    if (!simResults) return 0;
    const comp = components[probe.componentId];
    if (!comp) return 0;
    if (probe.type === 'voltage') {
      const term = terminals[comp.terminalIds[probe.terminalIndex ?? 0]];
      return term ? (simResults.nodeVoltages[term.nodeId] ?? 0) : 0;
    }
    return simResults.branchCurrents[comp.id] ?? 0;
  }

  const probeReadings = probes.map((p) => ({
    ...p,
    value: getProbeValue(p),
  }));

  return { probes, probeReadings, addProbe, removeProbe, toggleProbe, simResults };
}
