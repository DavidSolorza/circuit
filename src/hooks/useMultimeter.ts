import { useCircuitStore } from '../store/circuitStore';
import type { CircuitComponent, MeasurementProbe } from '../types';
import {
  getComponentReadings,
  getProbeReading,
  type ComponentReadings,
} from '../utils/componentReadings';

export function useMultimeter() {
  const simResults = useCircuitStore((s) => s.simResults);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const circuit = useCircuitStore((s) => s.circuit);

  function readComponent(comp: CircuitComponent): ComponentReadings {
    return (
      getComponentReadings(circuit, simResults, comp) ?? { voltage: 0, current: 0, power: 0 }
    );
  }

  function readProbe(probe: MeasurementProbe): number {
    return getProbeReading(circuit, simResults, probe) ?? 0;
  }

  return { isRunning: simulationRunning, results: simResults, readComponent, readProbe };
}
