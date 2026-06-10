import type { CircuitState, MeasurementProbe, SimResults } from '../types';
import { getProbeReading } from './componentReadings';

/** Read instantaneous probe value from a simulation snapshot. */
export function readProbeSample(
  circuit: CircuitState,
  res: SimResults,
  probe: MeasurementProbe,
): number | null {
  return getProbeReading(circuit, res, probe);
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
