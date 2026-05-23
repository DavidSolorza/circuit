import { create } from 'zustand';
import type {
  AppState,
  CircuitComponent,
  Terminal,
  WireDef,
  OscilloscopeProbe,
  SimResults,
  ComponentType,
  Point,
  CircuitState,
} from '../core/types';
import { COMPONENT_TEMPLATES, PROBE_COLORS, GRID_SIZE } from '../core/constants';

let idCounter = 0;
function genId(prefix: string): string {
  return `${prefix}_${++idCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

function snapToGrid(p: Point): Point {
  return {
    x: Math.round(p.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(p.y / GRID_SIZE) * GRID_SIZE,
  };
}

interface CircuitStore extends AppState {
  addComponent: (type: ComponentType, position: Point) => void;
  removeComponent: (id: string) => void;
  updateComponentParam: (id: string, key: string, value: number) => void;
  moveComponent: (id: string, position: Point) => void;
  rotateComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  setActiveTool: (tool: ComponentType | 'select' | 'wire' | 'probe') => void;
  startConnection: (terminalId: string) => void;
  completeConnection: (terminalId: string) => void;
  cancelConnection: () => void;
  toggleSimulation: () => void;
  setSimResults: (results: SimResults) => void;
  addProbe: (type: 'voltage' | 'current', componentId: string, terminalIndex?: 0 | 1) => void;
  removeProbe: (id: string) => void;
  toggleProbeVisibility: (id: string) => void;
  appendOscData: (probeId: string, t: number, v: number) => void;
  clearOscData: () => void;
  getCircuitState: () => CircuitState;
  resetSimulation: () => void;
}

function makeComponent(type: ComponentType, position: Point): CircuitComponent {
  const template = COMPONENT_TEMPLATES[type];
  const cmpId = genId('cmp');
  return {
    id: cmpId,
    type,
    label: template.label,
    position: snapToGrid(position),
    rotation: 0,
    params: { ...template.defaultParams },
    terminalIds: [genId('term'), genId('term')],
  };
}

function makeTerminal(componentId: string, index: 0 | 1, nodeId: number): Terminal {
  return {
    id: genId('term'),
    componentId,
    index,
    nodeId,
  };
}

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  circuit: {
    components: {},
    terminals: {},
    wires: {},
    nextNodeId: 1,
  },
  selectedComponentId: null,
  activeTool: 'select',
  simulationRunning: false,
  simResults: null,
  probes: [],
  oscData: {},
  connectingFrom: null,
  simTime: 0,

  getCircuitState: () => get().circuit,

  addComponent: (type, position) => {
    const state = get();
    const comp = makeComponent(type, position);
    let nodeIdA: number;
    let nodeIdB: number;

    if (type === 'ground') {
      nodeIdA = 0;
      nodeIdB = 0;
    } else {
      nodeIdA = state.circuit.nextNodeId;
      nodeIdB = state.circuit.nextNodeId + 1;
    }

    const tA = makeTerminal(comp.id, 0, nodeIdA);
    const tB = makeTerminal(comp.id, 1, nodeIdB);
    const updatedComp = { ...comp, terminalIds: [tA.id, tB.id] as [string, string] };

    set({
      circuit: {
        components: { ...state.circuit.components, [comp.id]: updatedComp },
        terminals: { ...state.circuit.terminals, [tA.id]: tA, [tB.id]: tB },
        wires: { ...state.circuit.wires },
        nextNodeId: type === 'ground' ? state.circuit.nextNodeId : nodeIdB + 1,
      },
      selectedComponentId: comp.id,
    });
  },

  removeComponent: (id) => {
    const state = get();
    const comp = state.circuit.components[id];
    if (!comp) return;

    const newComponents = { ...state.circuit.components };
    delete newComponents[id];

    const newTerminals = { ...state.circuit.terminals };
    for (const tid of comp.terminalIds) {
      delete newTerminals[tid];
    }

    const newWires = { ...state.circuit.wires };
    for (const [wid, wire] of Object.entries(newWires)) {
      const ft = state.circuit.terminals[wire.fromTerminalId];
      const tt = state.circuit.terminals[wire.toTerminalId];
      if (ft?.componentId === id || tt?.componentId === id) {
        delete newWires[wid];
      }
    }

    const newProbes = state.probes.filter(p => p.componentId !== id);
    const newOscData: Record<string, Array<{ t: number; v: number }>> = {};
    for (const p of newProbes) {
      if (state.oscData[p.id]) newOscData[p.id] = state.oscData[p.id];
    }

    set({
      circuit: {
        components: newComponents,
        terminals: newTerminals,
        wires: newWires,
        nextNodeId: state.circuit.nextNodeId,
      },
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
      probes: newProbes,
      oscData: newOscData,
    });
  },

  updateComponentParam: (id, key, value) => {
    const state = get();
    const comp = state.circuit.components[id];
    if (!comp) return;
    set({
      circuit: {
        ...state.circuit,
        components: {
          ...state.circuit.components,
          [id]: { ...comp, params: { ...comp.params, [key]: value } },
        },
      },
    });
  },

  moveComponent: (id, position) => {
    const state = get();
    const comp = state.circuit.components[id];
    if (!comp) return;
    set({
      circuit: {
        ...state.circuit,
        components: {
          ...state.circuit.components,
          [id]: { ...comp, position: snapToGrid(position) },
        },
      },
    });
  },

  rotateComponent: (id) => {
    const state = get();
    const comp = state.circuit.components[id];
    if (!comp) return;
    set({
      circuit: {
        ...state.circuit,
        components: {
          ...state.circuit.components,
          [id]: { ...comp, rotation: (comp.rotation + 90) % 360 },
        },
      },
    });
  },

  selectComponent: (id) => set({ selectedComponentId: id }),

  setActiveTool: (tool) => set({ activeTool: tool, connectingFrom: null }),

  startConnection: (terminalId) => {
    const state = get();
    if (state.activeTool !== 'wire') return;
    set({ connectingFrom: terminalId });
  },

  completeConnection: (terminalId) => {
    const state = get();
    const from = state.connectingFrom;
    if (!from || from === terminalId) { set({ connectingFrom: null }); return; }

    const fTerm = state.circuit.terminals[from];
    const tTerm = state.circuit.terminals[terminalId];
    if (!fTerm || !tTerm || fTerm.nodeId === tTerm.nodeId) {
      set({ connectingFrom: null });
      return;
    }

    const mergeTo = Math.min(fTerm.nodeId, tTerm.nodeId);
    const mergeFrom = Math.max(fTerm.nodeId, tTerm.nodeId);

    const newTerminals: Record<string, Terminal> = {};
    for (const [tid, term] of Object.entries(state.circuit.terminals)) {
      newTerminals[tid] = term.nodeId === mergeFrom ? { ...term, nodeId: mergeTo } : term;
    }

    const wireId = genId('wire');
    set({
      circuit: {
        ...state.circuit,
        terminals: newTerminals,
        wires: { ...state.circuit.wires, [wireId]: { id: wireId, fromTerminalId: from, toTerminalId: terminalId } },
        nextNodeId: state.circuit.nextNodeId,
      },
      connectingFrom: null,
    });
  },

  cancelConnection: () => set({ connectingFrom: null }),

  toggleSimulation: () => {
    const state = get();
    const willRun = !state.simulationRunning;
    set({
      simulationRunning: willRun,
      simTime: willRun ? 0 : state.simTime,
    });
  },

  setSimResults: (results) => set({ simResults: results }),

  addProbe: (type, componentId, terminalIndex) => {
    const state = get();
    const comp = state.circuit.components[componentId];
    if (!comp) return;
    if (state.probes.find(p => p.componentId === componentId && p.type === type && p.terminalIndex === terminalIndex)) return;

    const colorIdx = state.probes.length % PROBE_COLORS.length;
    const probe: OscilloscopeProbe = {
      id: genId('probe'),
      label: `${comp.label} (${type === 'voltage' ? 'V' : 'I'})`,
      type,
      componentId,
      terminalIndex,
      color: PROBE_COLORS[colorIdx],
      visible: true,
    };

    set({
      probes: [...state.probes, probe],
      oscData: { ...state.oscData, [probe.id]: [] },
    });
  },

  removeProbe: (id) => {
    const state = get();
    const newOscData = { ...state.oscData };
    delete newOscData[id];
    set({
      probes: state.probes.filter(p => p.id !== id),
      oscData: newOscData,
    });
  },

  toggleProbeVisibility: (id) => {
    const state = get();
    set({
      probes: state.probes.map(p => p.id === id ? { ...p, visible: !p.visible } : p),
    });
  },

  appendOscData: (probeId, t, v) => {
    const state = get();
    const data = state.oscData[probeId];
    if (!data) return;
    const maxPoints = 3000;
    const newData = [...data, { t, v }];
    if (newData.length > maxPoints) newData.splice(0, newData.length - maxPoints);
    set({ oscData: { ...state.oscData, [probeId]: newData } });
  },

  clearOscData: () => {
    const state = get();
    const cleared: Record<string, Array<{ t: number; v: number }>> = {};
    for (const key of Object.keys(state.oscData)) cleared[key] = [];
    set({ oscData: cleared });
  },

  resetSimulation: () => {
    set({ simTime: 0, simResults: null });
  },
}));
