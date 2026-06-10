import { useMemo } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import type { MeasurementProbe } from '../types';

export interface OscTrace {
  id: string;
  label: string;
  color: string;
  type: MeasurementProbe['type'];
  data: Array<{ t: number; v: number }>;
  visible: boolean;
}

export function useGraph() {
  const oscData = useCircuitStore((s) => s.oscData);
  const probes = useCircuitStore((s) => s.probes);
  const clearData = useCircuitStore((s) => s.clearOscData);

  const traces = useMemo((): OscTrace[] => {
    return probes
      .filter((p) => p.visible && (oscData[p.id]?.length ?? 0) > 0)
      .map((p) => ({
        id: p.id,
        label: p.label,
        color: p.color,
        type: p.type,
        data: oscData[p.id]!,
        visible: p.visible,
      }));
  }, [probes, oscData]);

  return { traces, clearData };
}
