import { useEffect, useRef } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { MnaSolver } from '../core/solver';
import { DT } from '../core/constants';

let solverInstance: MnaSolver | null = null;
function getSolver(): MnaSolver {
  if (!solverInstance) solverInstance = new MnaSolver();
  return solverInstance;
}

export function useSimulationLoop(): void {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let running = true;

    function tick(timestamp: number) {
      if (!running) return;

      const state = useCircuitStore.getState();
      if (!state.simulationRunning) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;

      const elapsed = (timestamp - lastTimeRef.current) / 1000;
      if (elapsed < DT) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTimeRef.current = timestamp;

      const circuit = state.circuit;
      const solver = getSolver();
      const results = solver.solve(circuit, DT);

      useCircuitStore.getState().setSimResults(results);

      for (const probe of state.probes) {
        const comp = circuit.components[probe.componentId];
        if (!comp) continue;

        let value = 0;
        if (probe.type === 'voltage') {
          const term = circuit.terminals[comp.terminalIds[probe.terminalIndex ?? 0]];
          if (term) value = results.nodeVoltages[term.nodeId] ?? 0;
        } else {
          value = results.branchCurrents[comp.id] ?? 0;
        }
        useCircuitStore.getState().appendOscData(probe.id, results.time, value);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, []);
}
