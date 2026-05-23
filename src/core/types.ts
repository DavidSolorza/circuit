export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltageSource'
  | 'currentSource'
  | 'switch'
  | 'led'
  | 'ground';

export interface Point {
  x: number;
  y: number;
}

export interface Terminal {
  id: string;
  componentId: string;
  index: 0 | 1;
  nodeId: number;
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

export interface WireDef {
  id: string;
  fromTerminalId: string;
  toTerminalId: string;
}

export interface SimResults {
  nodeVoltages: Record<number, number>;
  branchCurrents: Record<string, number>;
  timestep: number;
  time: number;
}

export interface OscilloscopeProbe {
  id: string;
  label: string;
  type: 'voltage' | 'current';
  componentId: string;
  terminalIndex?: 0 | 1;
  color: string;
  visible: boolean;
}

export interface CircuitState {
  components: Record<string, CircuitComponent>;
  terminals: Record<string, Terminal>;
  wires: Record<string, WireDef>;
  nextNodeId: number;
}

export interface AppState {
  circuit: CircuitState;
  selectedComponentId: string | null;
  activeTool: ComponentType | 'select' | 'wire' | 'probe';
  simulationRunning: boolean;
  simResults: SimResults | null;
  probes: OscilloscopeProbe[];
  oscData: Record<string, Array<{ t: number; v: number }>>;
  connectingFrom: string | null;
  simTime: number;
}
