import type {
  ElementState,
  EngineCircuit,
  EngineSimResults,
  EngineValidationResult,
  ResolvedTopology,
  SimulationConfig,
} from '../types';
import { GROUND_NODE_ID, DEFAULT_TOLERANCE } from '../types';
import { MatrixBuilder } from './MatrixBuilder';
import { gaussianElimination, validateSolution } from '../math/GaussianElimination';
import type { ElementRegistry } from '../core/ElementRegistry';
import { defaultElementRegistry } from '../core/ElementRegistry';

export interface StepResult {
  success: boolean;
  error?: string;
  time: number;
  nodeVoltages: Map<number, number>;
  branchCurrents: Map<string, number>;
  power: Map<string, number>;
}

/**
 * TransientMNASolver — Modified Nodal Analysis with Backward Euler integration.
 */
export class TransientMNASolver {
  readonly name = 'TransientMNA';
  private matrixBuilder = new MatrixBuilder();
  private tolerance: number;

  constructor(tolerance = DEFAULT_TOLERANCE) {
    this.tolerance = tolerance;
  }

  /** Advance one timestep; mutates and returns element state (vc, il). */
  advanceStep(
    circuit: EngineCircuit,
    topology: ResolvedTopology,
    dt: number,
    time: number,
    state: ElementState,
    registry: ElementRegistry = defaultElementRegistry,
  ): StepResult {
    const elements = registry.getAll();
    const { A, b, ctx } = this.matrixBuilder.build(
      circuit,
      topology,
      elements,
      state,
      dt,
      time,
    );

    if (ctx.totalVars === 0) {
      return {
        success: true,
        time,
        nodeVoltages: new Map([[GROUND_NODE_ID, 0]]),
        branchCurrents: new Map(),
        power: new Map(),
      };
    }

    const result = gaussianElimination(A, b.data, this.tolerance);
    if (!result.success) {
      return {
        success: false,
        error: result.message,
        time,
        nodeVoltages: new Map([[GROUND_NODE_ID, 0]]),
        branchCurrents: new Map(),
        power: new Map(),
      };
    }

    const residualOk = validateSolution(A, b.data, result.solution, this.tolerance * 1000);
    if (!residualOk) {
      return {
        success: false,
        error: 'Solución numérica inestable (revisa el circuito)',
        time,
        nodeVoltages: new Map([[GROUND_NODE_ID, 0]]),
        branchCurrents: new Map(),
        power: new Map(),
      };
    }

    ctx.solution = result.solution;
    const nodeVoltages = new Map<number, number>();
    nodeVoltages.set(GROUND_NODE_ID, 0);
    for (const n of topology.nonGroundNodes) {
      const idx = topology.nodeIndex.get(n)!;
      nodeVoltages.set(n, result.solution[idx] ?? 0);
    }
    ctx.nodeVoltages = nodeVoltages;

    const branchCurrents = new Map<string, number>();
    const power = new Map<string, number>();

    for (const comp of Object.values(circuit.components)) {
      const element = elements.get(comp.type);
      if (!element || comp.type === 'ground') continue;

      let current = 0;
      if (comp.type === 'capacitor') {
        const nodes = ctx.componentNodes.get(comp.id);
        if (nodes) {
          const vp = nodeVoltages.get(nodes[0]) ?? 0;
          const vn = nodeVoltages.get(nodes[1]) ?? 0;
          const vDiff = vp - vn;
          const vPrev = state.vc.get(comp.id) ?? 0;
          current = (comp.params.capacitance ?? 1e-6) * (vDiff - vPrev) / dt;
          state.vc.set(comp.id, vDiff);
        }
      } else {
        current = element.calculateCurrent(ctx, comp, nodeVoltages);
      }

      branchCurrents.set(comp.id, current);
      if (comp.type === 'inductor') state.il.set(comp.id, current);

      const nodes = ctx.componentNodes.get(comp.id);
      if (nodes) {
        if (comp.type === 'led' || comp.type === 'diode') {
          const va = nodeVoltages.get(nodes[1]) ?? 0;
          const vc = nodeVoltages.get(nodes[0]) ?? 0;
          state.vd.set(comp.id, va - vc);
        }
        const vp = nodeVoltages.get(nodes[0]) ?? 0;
        const vn = nodeVoltages.get(nodes[1]) ?? 0;
        power.set(comp.id, (vp - vn) * current);
      }
    }

    return { success: true, time, nodeVoltages, branchCurrents, power };
  }

  solve(
    circuit: EngineCircuit,
    topology: ResolvedTopology,
    config: SimulationConfig,
    registry: ElementRegistry = defaultElementRegistry,
    validation: EngineValidationResult,
  ): EngineSimResults {
    const state: ElementState = { vc: new Map(), il: new Map(), vd: new Map() };
    const dt = config.timestep;
    const nSteps =
      config.analysis === 'transient' ? Math.max(1, Math.floor(config.duration / dt)) : 1;

    const timeAxis: number[] = [];
    const nodeData: Record<string, number[]> = {};
    for (const n of topology.nonGroundNodes) nodeData[String(n)] = [];
    nodeData['0'] = [];

    const branchData: Record<string, number[]> = {};
    const powerData: Record<string, number[]> = {};

    if (topology.nonGroundNodes.length === 0 && Object.keys(circuit.components).length === 0) {
      return this.emptyResult(validation);
    }

    for (let step = 0; step < nSteps; step++) {
      const t = step * dt;
      const stepResult = this.advanceStep(circuit, topology, dt, t, state, registry);

      if (!stepResult.success) {
        return {
          status: { success: false, message: 'Simulation failed', error: stepResult.error ?? '' },
          time: timeAxis,
          nodeVoltages: nodeData,
          branchCurrents: branchData,
          power: powerData,
          validation,
        };
      }

      for (const n of topology.nonGroundNodes) {
        nodeData[String(n)]!.push(stepResult.nodeVoltages.get(n) ?? 0);
      }
      nodeData['0']!.push(0);

      for (const [id, i] of stepResult.branchCurrents) {
        if (!branchData[id]) branchData[id] = [];
        branchData[id]!.push(i);
      }
      for (const [id, p] of stepResult.power) {
        if (!powerData[id]) powerData[id] = [];
        powerData[id]!.push(p);
      }

      timeAxis.push(t);
    }

    return {
      status: { success: true, message: 'Simulation completed successfully', error: null },
      time: timeAxis,
      nodeVoltages: nodeData,
      branchCurrents: branchData,
      power: powerData,
      validation,
    };
  }

  private emptyResult(validation: EngineValidationResult): EngineSimResults {
    return {
      status: { success: true, message: 'No variables to solve', error: null },
      time: [0],
      nodeVoltages: { '0': [0] },
      branchCurrents: {},
      power: {},
      validation: {
        ...validation,
        warnings: [...validation.warnings, 'No components to simulate.'],
      },
    };
  }
}
