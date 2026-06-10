import type { CircuitState, SimResults } from '../types';
import type {
  EngineCircuit,
  EngineSimResults,
  SimulationConfig,
  ElementState,
  ResolvedTopology,
} from './types';
import { CircuitGraph } from './core/CircuitGraph';
import { ElementRegistry, defaultElementRegistry } from './core/ElementRegistry';
import { SimulationTree } from './core/SimulationTree';
import { EventBus } from './events/EventBus';
import { TransientMNASolver, type StepResult } from './solvers/TransientMNASolver';
import { circuitValidator } from './validation/CircuitValidator';

const SUPPORTED_TYPES = new Set([
  'resistor',
  'capacitor',
  'inductor',
  'voltageSource',
  'currentSource',
  'switch',
  'ground',
  'voltmeter',
  'ammeter',
  'potentiometer',
  'transistor',
  'led',
  'diode',
]);

export interface UnsupportedComponentInfo {
  id: string;
  type: string;
  label: string;
}

/**
 * SimulationEngine — orchestrates graph building, validation, and MNA simulation.
 * Maintains transient state (vc, il) across realtime steps.
 */
export class SimulationEngine {
  private circuit: EngineCircuit = { components: {}, terminals: {}, wires: {} };
  private graph = new CircuitGraph();
  private registry: ElementRegistry;
  private solver: TransientMNASolver;
  private events: EventBus;
  private tree: SimulationTree;
  private topologyCache: ResolvedTopology | null = null;
  private transientState: ElementState = { vc: new Map(), il: new Map(), vd: new Map() };
  private simTime = 0;
  private circuitFingerprint = '';
  private unsupported: UnsupportedComponentInfo[] = [];
  private defaultConfig: SimulationConfig = {
    analysis: 'transient',
    duration: 0.1,
    timestep: 1 / 60,
  };

  constructor(options?: {
    registry?: ElementRegistry;
    tolerance?: number;
    eventBus?: EventBus;
  }) {
    this.registry = options?.registry ?? defaultElementRegistry;
    this.solver = new TransientMNASolver(options?.tolerance);
    this.events = options?.eventBus ?? new EventBus();
    this.tree = new SimulationTree();
  }

  get eventBus(): EventBus {
    return this.events;
  }

  get simulationTree(): SimulationTree {
    return this.tree;
  }

  get circuitGraph(): CircuitGraph {
    return this.graph;
  }

  get currentTime(): number {
    return this.simTime;
  }

  get unsupportedComponents(): UnsupportedComponentInfo[] {
    return this.unsupported;
  }

  /** Electrical node id for a terminal (after wire merge + ground resolution) */
  getElectricalNode(terminalId: string): number | undefined {
    return this.getTopology().terminalNode.get(terminalId);
  }

  resetTransientState(): void {
    this.transientState = { vc: new Map(), il: new Map(), vd: new Map() };
    this.simTime = 0;
  }

  loadCircuit(circuit: EngineCircuit, unsupported: UnsupportedComponentInfo[] = []): void {
    this.circuit = circuit;
    this.unsupported = unsupported;
    this.graph.markDirty();
    this.topologyCache = null;
    this.resetTransientState();
    this.rebuildTree();
    this.events.emit('CircuitChanged', { circuit });
  }

  syncFromCircuitState(state: CircuitState): boolean {
    const { circuit, unsupported, fingerprint } = buildEngineCircuit(state);
    const changed = fingerprint !== this.circuitFingerprint;
    if (changed) {
      this.circuitFingerprint = fingerprint;
      this.loadCircuit(circuit, unsupported);
    }
    return changed;
  }

  validate() {
    this.graph.buildFromCircuit(this.circuit);
    const result = circuitValidator.validate(this.circuit, this.graph);
    for (const u of this.unsupported) {
      result.warnings.push(
        `'${u.label}' (${u.type}) no está modelado aún — excluido de la simulación.`,
      );
    }
    return result;
  }

  simulate(config?: Partial<SimulationConfig>): EngineSimResults {
    const cfg: SimulationConfig = { ...this.defaultConfig, ...config };
    this.resetTransientState();
    return this.runBatch(cfg);
  }

  private runBatch(cfg: SimulationConfig): EngineSimResults {
    this.graph.buildFromCircuit(this.circuit);
    const validation = this.validate();

    if (!validation.valid) {
      return {
        status: {
          success: false,
          message: 'Validación fallida',
          error: validation.errors.join('; '),
        },
        time: [],
        nodeVoltages: {},
        branchCurrents: {},
        power: {},
        validation,
      };
    }

    this.events.emit('SimulationStarted', { config: cfg });
    const topology = this.getTopology();
    const results = this.solver.solve(this.circuit, topology, cfg, this.registry, validation);
    this.simTime = results.time.length > 0 ? results.time[results.time.length - 1]! : 0;
    this.events.emit('SimulationStopped', { results });
    return results;
  }

  /** Single realtime step with persistent capacitor/inductor state */
  advanceStep(timestep?: number): { results: SimResults; step: StepResult } {
    const dt = timestep ?? this.defaultConfig.timestep;
    const validation = this.validate();

    if (!validation.valid) {
      return {
        step: {
          success: false,
          error: validation.errors.join('; '),
          time: this.simTime,
          nodeVoltages: new Map([[0, 0]]),
          branchCurrents: new Map(),
          power: new Map(),
        },
        results: {
          status: { success: false, message: 'Validation failed', error: validation.errors.join('; ') },
          time: [],
          nodeVoltages: {},
          branchCurrents: {},
          power: {},
          validation,
        },
      };
    }

    this.events.emit('SimulationStep', { time: this.simTime });
    const topology = this.getTopology();
    const step = this.solver.advanceStep(
      this.circuit,
      topology,
      dt,
      this.simTime,
      this.transientState,
      this.registry,
    );

    if (!step.success) {
      return {
        step,
        results: {
          status: { success: false, message: 'Simulación fallida', error: step.error ?? '' },
          time: [this.simTime],
          nodeVoltages: {},
          branchCurrents: {},
          power: {},
          validation,
        },
      };
    }

    this.simTime += dt;
    const results = stepResultToSimResults(step, validation);
    this.events.emit('MeasurementUpdated', { results });
    return { results, step };
  }

  getTopology(): ResolvedTopology {
    if (!this.topologyCache || this.graph.isDirty()) {
      const snapshot = this.graph.buildFromCircuit(this.circuit);
      this.topologyCache = {
        nodeMap: snapshot.nodeMap,
        terminalNode: snapshot.terminalNode,
        nonGroundNodes: snapshot.nonGroundNodes,
        nodeIndex: snapshot.nodeIndex,
        connectedComponents: snapshot.numericComponents,
        adjacencyList: snapshot.numericAdjacency,
      };
    }
    return this.topologyCache;
  }

  private rebuildTree(): void {
    this.tree = new SimulationTree();
    const sources = this.tree.addBranch('sources', 'Fuentes');
    const passives = this.tree.addBranch('passives', 'Pasivos');
    const meters = this.tree.addBranch('meters', 'Medidores');
    const other = this.tree.addBranch('other', 'Otros');

    for (const comp of Object.values(this.circuit.components)) {
      let parent = other;
      if (comp.type === 'voltageSource' || comp.type === 'currentSource') parent = sources;
      else if (comp.type === 'resistor' || comp.type === 'capacitor' || comp.type === 'inductor')
        parent = passives;
      else if (comp.type === 'voltmeter' || comp.type === 'ammeter') parent = meters;
      this.tree.addElement(parent, comp.id, comp.type, comp.label || comp.id);
    }
  }
}

function stepResultToSimResults(
  step: StepResult,
  validation: EngineSimResults['validation'],
): SimResults {
  const nodeVoltages: Record<string, number[]> = { '0': [step.nodeVoltages.get(0) ?? 0] };
  for (const [n, v] of step.nodeVoltages) {
    if (n !== 0) nodeVoltages[String(n)] = [v];
  }

  const branchCurrents: Record<string, number[]> = {};
  for (const [id, i] of step.branchCurrents) branchCurrents[id] = [i];

  const power: Record<string, number[]> = {};
  for (const [id, p] of step.power) power[id] = [p];

  return {
    status: { success: true, message: 'OK', error: null },
    time: [step.time],
    nodeVoltages,
    branchCurrents,
    power,
    validation,
  };
}

function fingerprintCircuit(state: CircuitState): string {
  return JSON.stringify({
    c: state.components,
    t: state.terminals,
    w: state.wires,
  });
}

export function buildEngineCircuit(state: CircuitState): {
  circuit: EngineCircuit;
  unsupported: UnsupportedComponentInfo[];
  fingerprint: string;
} {
  const components: EngineCircuit['components'] = {};
  const terminals: EngineCircuit['terminals'] = {};
  const wires: EngineCircuit['wires'] = { ...state.wires };
  const unsupported: UnsupportedComponentInfo[] = [];

  for (const [id, comp] of Object.entries(state.components)) {
    if (!SUPPORTED_TYPES.has(comp.type)) {
      unsupported.push({ id, type: comp.type, label: comp.label || id });
      continue;
    }

    components[id] = {
      id: comp.id,
      type: comp.type as EngineCircuit['components'][string]['type'],
      label: comp.label,
      params: { ...comp.params },
      terminalIds: [...comp.terminalIds] as [string, string],
    };
  }

  const usedCompIds = new Set(Object.keys(components));
  for (const [tid, term] of Object.entries(state.terminals)) {
    if (usedCompIds.has(term.componentId)) terminals[tid] = { ...term };
  }

  return {
    circuit: { components, terminals, wires },
    unsupported,
    fingerprint: fingerprintCircuit(state),
  };
}

/** @deprecated Use buildEngineCircuit */
export function circuitStateToEngine(circuit: CircuitState): EngineCircuit {
  return buildEngineCircuit(circuit).circuit;
}

export function engineResultsToSimResults(results: EngineSimResults): SimResults {
  return {
    status: results.status,
    time: results.time,
    nodeVoltages: results.nodeVoltages,
    branchCurrents: results.branchCurrents,
    power: results.power,
    validation: results.validation,
  };
}

export const simulationEngine = new SimulationEngine();

export function simulateCircuit(circuit: CircuitState, config?: Partial<SimulationConfig>): SimResults {
  simulationEngine.syncFromCircuitState(circuit);
  return engineResultsToSimResults(simulationEngine.simulate(config));
}

/** Resolve all terminal → electrical node mappings for UI probes */
export function resolveTerminalNodes(state: CircuitState): Map<string, number> {
  simulationEngine.syncFromCircuitState(state);
  return simulationEngine.getTopology().terminalNode;
}
