import { useLayoutEffect, useRef } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import {
  getElectricalNodeForTerminal,
  resetLocalSimulation,
  runLocalSimulationStep,
  validateLocalCircuit,
} from '../services/localSimulation';
import { toastError, toastWarning } from '../shared/store/toastStore';
import { DT } from '../core/constants';

const runtimeWarningsShown = new Set<string>();

function applySimulationResults(): void {
  const state = useCircuitStore.getState();
  if (!state.simulationRunning) return;

  const circuit = state.circuit;
  const res = runLocalSimulationStep(circuit, DT);
  const current = useCircuitStore.getState();
  if (!current.simulationRunning) return;

  current.setSimResults(res);

  if (res.status.success) {
    current.setSimError(null);
    const t = current.simTime + DT;

    for (const probe of current.probes) {
      const comp = circuit.components[probe.componentId];
      if (!comp) continue;

      const value =
        probe.type === 'voltage'
          ? (() => {
              const termId = comp.terminalIds[probe.terminalIndex ?? 0];
              const nodeId = getElectricalNodeForTerminal(circuit, termId);
              return res.nodeVoltages[String(nodeId)]?.[0] ?? 0;
            })()
          : (res.branchCurrents[comp.id]?.[0] ?? 0);

      current.appendOscData(probe.id, t, value);
    }

    current.setSimTime(t);

    for (const w of res.validation.warnings) {
      if (!runtimeWarningsShown.has(w)) {
        runtimeWarningsShown.add(w);
        toastWarning('Advertencia de simulación', w);
      }
    }
  } else {
    const msg = res.status.error || res.validation.errors[0] || 'Simulación fallida';
    current.setSimError(msg);
    toastError('Error de simulación', msg);
    useCircuitStore.setState({ simResults: null, simulationRunning: false });
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
