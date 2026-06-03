import { useEffect, useRef } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import {
  getElectricalNodeForTerminal,
  resetLocalSimulation,
  runLocalSimulationStep,
} from '../services/localSimulation';
import { DT } from '../core/constants';

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
  } else {
    current.setSimError(res.status.error || res.validation.errors[0] || 'Simulación fallida');
  }
}

export function useSimulation() {
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);

  useEffect(() => {
    if (!simulationRunning) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    resetLocalSimulation();
    useCircuitStore.getState().clearOscData();
    useCircuitStore.getState().setSimTime(0);
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
