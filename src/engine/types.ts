/** Engine types — independent of React/UI frameworks. */

export type EngineElementType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltageSource'
  | 'currentSource'
  | 'switch'
  | 'ground'
  | 'voltmeter'
  | 'ammeter'
  | 'potentiometer'
  | 'transistor'
  | 'led'
  | 'diode'
  | 'lamp'
  | 'fuse';

export interface EngineTerminal {
  id: string;
  componentId: string;
  index: 0 | 1;
  nodeId: number;
}

export interface EngineComponent {
  id: string;
  type: EngineElementType;
  label: string;
  params: Record<string, number>;
  terminalIds: [string, string];
}

export interface EngineWire {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
}

export interface EngineCircuit {
  components: Record<string, EngineComponent>;
  terminals: Record<string, EngineTerminal>;
  wires: Record<string, EngineWire>;
}

export interface EngineValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EngineSimulationStatus {
  success: boolean;
  message: string;
  error: string | null;
}

export interface EngineSimResults {
  status: EngineSimulationStatus;
  time: number[];
  nodeVoltages: Record<string, number[]>;
  branchCurrents: Record<string, number[]>;
  power: Record<string, number[]>;
  validation: EngineValidationResult;
}

export interface SimulationConfig {
  analysis: 'dc' | 'transient';
  duration: number;
  timestep: number;
  tolerance?: number;
}

export interface ResolvedTopology {
  /** Maps raw node id → canonical electrical node id */
  nodeMap: Map<number, number>;
  /** Maps terminal id → canonical electrical node id */
  terminalNode: Map<string, number>;
  /** Non-ground electrical nodes sorted */
  nonGroundNodes: number[];
  /** Maps electrical node id → MNA matrix row index */
  nodeIndex: Map<number, number>;
  /** Connected components as sets of electrical node ids */
  connectedComponents: number[][];
  adjacencyList: Map<number, Set<number>>;
}

export interface ElementState {
  /** Capacitor voltage across terminals (vc) */
  vc: Map<string, number>;
  /** Inductor branch current (il) */
  il: Map<string, number>;
  /** Diode/LED anode−cathode voltage from prior step (V(T1)−V(T0)) */
  vd: Map<string, number>;
}

export interface SolutionVector {
  values: Float64Array;
  nodeVoltages: Map<number, number>;
  branchCurrents: Map<string, number>;
}

export const GROUND_NODE_ID = 0;
export const DEFAULT_TOLERANCE = 1e-12;
export const VOLTMETER_RESISTANCE = 1e12;
export const AMMETER_RESISTANCE = 1e-6;
export const OPEN_SWITCH_RESISTANCE = 1e12;
export const CLOSED_SWITCH_RESISTANCE = 1e-6;
