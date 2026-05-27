import { useMemo } from 'react';
import { useCircuitStore } from '../store/circuitStore';

export function useGraph() {
  const oscData = useCircuitStore((s) => s.oscData);
  const probes = useCircuitStore((s) => s.probes);
  const clearData = useCircuitStore((s) => s.clearOscData);

  const traces = useMemo(() => {
    return probes
      .filter((p) => p.visible && oscData[p.id])
      .map((p) => ({
        id: p.id,
        label: p.label,
        color: p.color,
        data: oscData[p.id],
        visible: p.visible,
      }));
  }, [probes, oscData]);

  return { traces, clearData };
}
