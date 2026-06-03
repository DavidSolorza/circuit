/**
 * LabCircuitos Simulation Engine
 *
 * Professional SPICE-inspired circuit simulator core.
 * Fully decoupled from React/UI — runs standalone in Node or browser.
 */

export * from './types';
export * from './math/Matrix';
export * from './math/GaussianElimination';
export * from './graph/UnionFind';
export * from './graph/GraphTypes';
export * from './graph/Traversal';
export * from './core/CircuitGraph';
export * from './core/NodeResolver';
export * from './core/SimulationTree';
export * from './core/ElementRegistry';
export * from './events/EventBus';
export * from './elements/BaseElement';
export * from './elements';
export * from './solvers/BaseSolver';
export * from './solvers/MatrixBuilder';
export * from './solvers/TransientMNASolver';
export * from './validation/CircuitValidator';
export {
  SimulationEngine,
  simulationEngine,
  circuitStateToEngine,
  buildEngineCircuit,
  engineResultsToSimResults,
  simulateCircuit,
  resolveTerminalNodes,
} from './SimulationEngine';
