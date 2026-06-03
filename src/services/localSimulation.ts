import type { CircuitState, SimResults } from '../types';
import {
  simulationEngine,
  buildEngineCircuit,
  resolveTerminalNodes,
  engineResultsToSimResults,
} from '../engine/SimulationEngine';
import { DT } from '../core/constants';

let terminalNodeCache: Map<string, number> | null = null;
let terminalCacheFingerprint = '';

function syncTerminalCache(state: CircuitState): Map<string, number> {
  const fp = JSON.stringify({ t: state.terminals, w: state.wires, c: state.components });
  if (fp !== terminalCacheFingerprint || !terminalNodeCache) {
    terminalNodeCache = resolveTerminalNodes(state);
    terminalCacheFingerprint = fp;
  }
  return terminalNodeCache;
}

export function getElectricalNodeForTerminal(state: CircuitState, terminalId: string): number {
  return syncTerminalCache(state).get(terminalId) ?? state.terminals[terminalId]?.nodeId ?? 0;
}

/** Run one realtime simulation step using the local MNA engine */
export function runLocalSimulationStep(state: CircuitState, dt = DT): SimResults {
  simulationEngine.syncFromCircuitState(state);
  return simulationEngine.advanceStep(dt).results;
}

/** Validate circuit without stepping */
export function validateLocalCircuit(state: CircuitState) {
  simulationEngine.syncFromCircuitState(state);
  return simulationEngine.validate();
}

/** Reset transient integrator state (capacitor voltages, inductor currents) */
export function resetLocalSimulation(): void {
  simulationEngine.resetTransientState();
}

/** Full batch simulation (e.g. export or preview) */
export function runLocalBatchSimulation(
  state: CircuitState,
  duration: number,
  timestep = DT,
): SimResults {
  simulationEngine.syncFromCircuitState(state);
  const { circuit, unsupported } = buildEngineCircuit(state);
  simulationEngine.loadCircuit(circuit, unsupported);
  return engineResultsToSimResults(
    simulationEngine.simulate({ analysis: 'transient', duration, timestep }),
  );
}

export { simulationEngine };
