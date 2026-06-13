import { useMemo } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { computeCircuitStats, type CircuitStats } from '../utils/circuitStats';

export function useCircuitStats(): CircuitStats {
  const circuit = useCircuitStore((s) => s.circuit);
  const probes = useCircuitStore((s) => s.probes.length);
  const simResults = useCircuitStore((s) => s.simResults);

  return useMemo(
    () => computeCircuitStats(circuit, probes, simResults),
    [circuit, probes, simResults],
  );
}
