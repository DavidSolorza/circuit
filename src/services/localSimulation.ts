import type { CircuitState, SimResults } from '../types';
import {
  simulationEngine,
  engineResultsToSimResults,
} from '../engine/SimulationEngine';
import { DT } from '../core/constants';

export function getElectricalNodeForTerminal(state: CircuitState, terminalId: string): number {
  simulationEngine.syncFromCircuitState(state);
  return simulationEngine.getElectricalNode(terminalId) ?? 0;
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
  return engineResultsToSimResults(
    simulationEngine.simulate({ analysis: 'transient', duration, timestep }),
  );
}

export { simulationEngine };
