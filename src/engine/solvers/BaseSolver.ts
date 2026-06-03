import type {
  EngineCircuit,
  EngineSimResults,
  EngineValidationResult,
  ResolvedTopology,
  SimulationConfig,
} from '../types';

export interface SolverOptions {
  tolerance?: number;
}

export interface BaseSolver {
  readonly name: string;
  solve(
    circuit: EngineCircuit,
    topology: ResolvedTopology,
    config: SimulationConfig,
    registry?: import('../core/ElementRegistry').ElementRegistry,
    validation?: EngineValidationResult,
  ): EngineSimResults;
}
