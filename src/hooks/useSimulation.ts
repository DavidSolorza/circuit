import { useLayoutEffect, useRef } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import type { CircuitState, MeasurementProbe, SimResults } from '../types';
import {
  resetLocalSimulation,
  runLocalSimulationStep,
  validateLocalCircuit,
} from '../services/localSimulation';
import { toastError, toastWarning } from '../shared/store/toastStore';
import { readProbeSample } from '../utils/probeSample';
import { DT } from '../core/constants';

const runtimeWarningsShown = new Set<string>();
const MAX_OSC_POINTS = 3000;

function appendProbeSamples(
  probes: MeasurementProbe[],
  oscData: Record<string, Array<{ t: number; v: number }>>,
  circuit: CircuitState,
  res: SimResults,
  simTime: number,
): Record<string, Array<{ t: number; v: number }>> {
  const newOscData = { ...oscData };
  const t = simTime + DT;

  for (const probe of probes) {
    const bucket = newOscData[probe.id];
    if (!bucket) continue;
    const value = readProbeSample(circuit, res, probe);
    if (value === null) continue;

    const nd = [...bucket];
    if (simTime === 0 && nd.length === 0) {
      nd.push({ t: 0, v: value });
    }
    nd.push({ t, v: value });
    if (nd.length > MAX_OSC_POINTS) nd.splice(0, nd.length - MAX_OSC_POINTS);
    newOscData[probe.id] = nd;
  }

  return newOscData;
}

function applySimulationResults(): void {
  const state = useCircuitStore.getState();
  if (!state.simulationRunning) return;

  const circuit = state.circuit;
  const res = runLocalSimulationStep(circuit, DT);
  const current = useCircuitStore.getState();
  if (!current.simulationRunning) return;

  if (res.status.success) {
    const t = current.simTime + DT;
    const newOscData = appendProbeSamples(
      current.probes,
      current.oscData,
      circuit,
      res,
      current.simTime,
    );

    useCircuitStore.setState({
      simResults: res,
      simError: null,
      simTime: t,
      oscData: newOscData,
    });

    for (const w of res.validation.warnings) {
      if (!runtimeWarningsShown.has(w)) {
        runtimeWarningsShown.add(w);
        toastWarning('Advertencia de simulación', w);
      }
    }
  } else {
    const msg = res.status.error || res.validation.errors[0] || 'Simulación fallida';
    useCircuitStore.setState({
      simError: msg,
      simResults: null,
      simulationRunning: false,
    });
    toastError('Error de simulación', msg);
  }
}

function showPreSimulationWarnings(warnings: string[]): void {
  if (warnings.length === 0) return;

  for (const w of warnings.slice(0, 3)) {
    toastWarning('Antes de simular', w);
  }
  if (warnings.length > 3) {
    toastWarning(
      'Antes de simular',
      `+${warnings.length - 3} advertencias más (ver propiedades)`,
    );
  }
}

export function useSimulation() {
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const preSimWarningsShown = useRef(false);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);

  useLayoutEffect(() => {
    if (!simulationRunning) {
      cancelAnimationFrame(rafRef.current);
      runtimeWarningsShown.clear();
      preSimWarningsShown.current = false;
      return;
    }

    const circuit = useCircuitStore.getState().circuit;
    const validation = validateLocalCircuit(circuit);

    if (!validation.valid) {
      const msg = validation.errors.join('; ');
      useCircuitStore.setState({
        simulationRunning: false,
        simError: msg,
        simResults: null,
      });
      toastError('No se puede simular', msg);
      return;
    }

    if (!preSimWarningsShown.current) {
      preSimWarningsShown.current = true;
      showPreSimulationWarnings(validation.warnings);
    }

    resetLocalSimulation();
    useCircuitStore.getState().clearOscData();
    useCircuitStore.getState().setSimTime(0);
    useCircuitStore.getState().setSimError(null);
    lastTickRef.current = performance.now();

    const loop = (now: number) => {
      if (!useCircuitStore.getState().simulationRunning) return;

      const elapsed = now - lastTickRef.current;
      if (elapsed >= DT * 1000) {
        lastTickRef.current = now - (elapsed % (DT * 1000));
        applySimulationResults();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [simulationRunning]);

  return { simulationRunning };
}
