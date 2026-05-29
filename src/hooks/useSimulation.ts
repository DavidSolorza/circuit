import { useEffect, useRef } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { simulate, type SimulateRequest } from '../services/api';
import { DT } from '../core/constants';

async function runSimulationStep(): Promise<void> {
  const state = useCircuitStore.getState();
  if (!state.simulationRunning) return;

  const circuit = state.circuit;
  const components: SimulateRequest['components'] = {};
  for (const [id, c] of Object.entries(circuit.components)) {
    components[id] = { id, type: c.type, label: c.label, params: c.params };
  }
  const terminals: SimulateRequest['terminals'] = {};
  for (const [id, t] of Object.entries(circuit.terminals)) {
    terminals[id] = { id, componentId: t.componentId, index: t.index, nodeId: t.nodeId };
  }
  const wires: SimulateRequest['wires'] = Object.values(circuit.wires).map(w => ({
    fromTerminalId: w.fromTerminalId,
    toTerminalId: w.toTerminalId,
  }));

  const request: SimulateRequest = {
    components, terminals, wires,
    analysis: 'transient',
    duration: DT,
    timestep: DT,
  };

  try {
    const res = await simulate(request);
    const currentState = useCircuitStore.getState();
    if (!currentState.simulationRunning) return;
    currentState.setSimResults(res);
    if (res.status.success) {
      currentState.setSimError(null);
      const baseTime = currentState.simTime;
      for (const probe of currentState.probes) {
        const comp = circuit.components[probe.componentId];
        if (!comp) continue;
        let values: number[] | undefined;
        if (probe.type === 'voltage') {
          const term = circuit.terminals[comp.terminalIds[probe.terminalIndex ?? 0]];
          if (term) values = res.nodeVoltages[String(term.nodeId)];
        } else {
          values = res.branchCurrents[comp.id];
        }
        if (values && values.length > 0) {
          for (let i = 0; i < res.time.length && i < values.length; i++) {
            currentState.appendOscData(probe.id, baseTime + res.time[i], values[i]);
          }
        }
      }
      currentState.setSimTime(baseTime + (res.time[res.time.length - 1] ?? DT));
    } else {
      currentState.setSimError(res.status.error || 'Simulación fallida');
    }
  } catch (err) {
    const currentState = useCircuitStore.getState();
    if (currentState.simulationRunning) {
      currentState.setSimError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
    }
  }
}

export function useSimulation() {
  const timerRef = useRef<number>(0);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);

  useEffect(() => {
    if (!simulationRunning) {
      clearTimeout(timerRef.current);
      return;
    }

    let delay = 100;

    const tick = async () => {
      const wasError = useCircuitStore.getState().simError !== null;
      await runSimulationStep();
      const nowError = useCircuitStore.getState().simError !== null;
      if (!wasError && nowError) {
        delay = Math.min(delay * 2, 5000);
      } else if (!nowError) {
        delay = 100;
      }
      if (useCircuitStore.getState().simulationRunning) {
        timerRef.current = window.setTimeout(tick, delay);
      }
    };

    tick();

    return () => clearTimeout(timerRef.current);
  }, [simulationRunning]);

  return { simulationRunning };
}
