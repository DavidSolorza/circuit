export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltageSource'
  | 'currentSource'
  | 'switch'
  | 'led'
  | 'diode'
  | 'transistor'
  | 'potentiometer'
  | 'ground'
  | 'voltmeter'
  | 'ammeter';

export interface Point {
  x: number;
  y: number;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  label: string;
  position: Point;
  rotation: number;
  params: Record<string, number>;
  terminalIds: [string, string];
}

export interface Terminal {
  id: string;
  componentId: string;
  index: 0 | 1;
  nodeId: number;
}

export interface WireDef {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
}

export interface CircuitState {
  components: Record<string, CircuitComponent>;
  terminals: Record<string, Terminal>;
  wires: Record<string, WireDef>;
  nextNodeId: number;
}

export interface BackendStatus {
  success: boolean;
  message: string;
  error: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SimResults {
  status: BackendStatus;
  time: number[];
  nodeVoltages: Record<string, number[]>;
  branchCurrents: Record<string, number[]>;
  power: Record<string, number[]>;
  validation: ValidationResult;
}

export interface MeasurementProbe {
  id: string;
  label: string;
  type: 'voltage' | 'current';
  componentId: string;
  terminalIndex?: 0 | 1;
  color: string;
  visible: boolean;
}

export interface GraphTrace {
  t: number;
  v: number;
}

export type ToolType = ComponentType | 'select' | 'wire' | 'probe' | 'multimeter';

export interface AppState {
  circuit: CircuitState;
  selectedComponentId: string | null;
  activeTool: ToolType;
  simulationRunning: boolean;
  simResults: SimResults | null;
  simError: string | null;
  probes: MeasurementProbe[];
  oscData: Record<string, GraphTrace[]>;
  connectingFrom: string | null;
  simTime: number;
  darkMode: boolean;
  undoStack: CircuitState[];
  redoStack: CircuitState[];
}

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface ComponentCategory {
  name: string;
  types: ComponentType[];
}
