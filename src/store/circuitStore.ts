import { create } from 'zustand';
import type {
  AppState,
  Terminal,
  MeasurementProbe,
  SimResults,
  ComponentType,
  Point,
  CircuitState,
  ToolType,
} from '../types';
import { genId, makeComponent, makeTerminal, initCircuitState, snapToGrid } from '../utils/circuit';

interface CircuitStore extends AppState {
  addComponent: (type: ComponentType, position: Point) => void;
  removeComponent: (id: string) => void;
  updateComponentParam: (id: string, key: string, value: number) => void;
  moveComponent: (id: string, position: Point) => void;
  rotateComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  setActiveTool: (tool: ToolType) => void;
  connectTerminals: (fromTerminalId: string, toTerminalId: string) => void;
  startConnection: (terminalId: string) => void;
  completeConnection: (terminalId: string) => void;
  cancelConnection: () => void;
  toggleSimulation: () => void;
  setSimResults: (results: SimResults) => void;
  setSimTime: (t: number) => void;
  setSimError: (err: string | null) => void;
  addProbe: (type: 'voltage' | 'current', componentId: string, terminalIndex?: 0 | 1) => void;
  removeProbe: (id: string) => void;
  toggleProbeVisibility: (id: string) => void;
  appendOscData: (probeId: string, t: number, v: number) => void;
  clearOscData: () => void;
  resetSimulation: () => void;
  undo: () => void;
  redo: () => void;
  pushUndo: () => void;
}

function deepCloneCircuit(c: CircuitState): CircuitState {
  return JSON.parse(JSON.stringify(c));
}

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  circuit: initCircuitState(),
  selectedComponentId: null,
  activeTool: 'select',
  simulationRunning: false,
  simResults: null,
  simError: null,
  probes: [],
  oscData: {},
  connectingFrom: null,
  simTime: 0,
  undoStack: [],
  redoStack: [],

  pushUndo: () => {
    const state = get();
    const stack = [...state.undoStack, deepCloneCircuit(state.circuit)];
    if (stack.length > 50) stack.shift();
    set({ undoStack: stack, redoStack: [] });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    const newStack = state.undoStack.slice(0, -1);
    set({
      circuit: deepCloneCircuit(prev),
      undoStack: newStack,
      redoStack: [...state.redoStack, deepCloneCircuit(state.circuit)],
      simResults: null,
      simTime: 0,
      simError: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    const newStack = state.redoStack.slice(0, -1);
    set({
      circuit: deepCloneCircuit(next),
      redoStack: newStack,
      undoStack: [...state.undoStack, deepCloneCircuit(state.circuit)],
      simResults: null,
      simTime: 0,
      simError: null,
    });
  },

  addComponent: (type, position) => {
    const state = get();
    state.pushUndo();
    const comp = makeComponent(type, position);
    let nodeIdA: number, nodeIdB: number;
    if (type === 'ground') {
      nodeIdA = 0;
      nodeIdB = 0;
    } else {
      nodeIdA = state.circuit.nextNodeId;
      nodeIdB = state.circuit.nextNodeId + 1;
    }
    const tA = makeTerminal(comp.id, 0, nodeIdA);
    const tB = makeTerminal(comp.id, 1, nodeIdB);
    const c = { ...comp, terminalIds: [tA.id, tB.id] as [string, string] };
    const next = type === 'ground' ? state.circuit.nextNodeId : nodeIdB + 1;
    set({
      circuit: {
        components: { ...state.circuit.components, [c.id]: c },
        terminals: { ...state.circuit.terminals, [tA.id]: tA, [tB.id]: tB },
        wires: { ...state.circuit.wires },
        nextNodeId: next,
      },
      selectedComponentId: c.id,
    });
  },

  removeComponent: (id) => {
    const state = get();
    const comp = state.circuit.components[id];
    if (!comp) return;
    state.pushUndo();
    const newComponents = { ...state.circuit.components };
    delete newComponents[id];
    const newTerminals = { ...state.circuit.terminals };
    for (const tid of comp.terminalIds) delete newTerminals[tid];
    const newWires = { ...state.circuit.wires };
    for (const [wid, w] of Object.entries(newWires)) {
      const ft = state.circuit.terminals[w.fromTerminalId];
      const tt = state.circuit.terminals[w.toTerminalId];
      if (ft?.componentId === id || tt?.componentId === id) delete newWires[wid];
    }
    const newProbes = state.probes.filter((p) => p.componentId !== id);
    const newOscData: Record<string, Array<{ t: number; v: number }>> = {};
    for (const p of newProbes) if (state.oscData[p.id]) newOscData[p.id] = state.oscData[p.id];
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
      simResults: null,
      simTime: 0,
      simError: null,
    });
  },

  updateComponentParam: (id, key, value) => {
    const state = get();
    const comp = state.circuit.components[id];
    if (!comp) return;
    state.pushUndo();
    set({
      circuit: {
        ...state.circuit,
        components: {
          ...state.circuit.components,
          [id]: { ...comp, params: { ...comp.params, [key]: value } },
        },
      },
      simResults: null,
      simTime: 0,
      simError: null,
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
    state.pushUndo();
    set({
      circuit: {
        ...state.circuit,
        components: {
          ...state.circuit.components,
          [id]: { ...comp, rotation: (comp.rotation + 90) % 360 },
        },
      },
      simResults: null,
      simTime: 0,
      simError: null,
    });
  },

  duplicateComponent: (id) => {
    const state = get();
    const comp = state.circuit.components[id];
    if (!comp) return;
    state.pushUndo();
    const newComp = makeComponent(comp.type, { x: comp.position.x + 40, y: comp.position.y + 40 });
    let nodeIdA: number, nodeIdB: number;
    if (comp.type === 'ground') {
      nodeIdA = 0;
      nodeIdB = 0;
    } else {
      nodeIdA = state.circuit.nextNodeId;
      nodeIdB = state.circuit.nextNodeId + 1;
    }
    const tA = makeTerminal(newComp.id, 0, nodeIdA);
    const tB = makeTerminal(newComp.id, 1, nodeIdB);
    const nc = { ...newComp, terminalIds: [tA.id, tB.id] as [string, string] };
    const next = comp.type === 'ground' ? state.circuit.nextNodeId : nodeIdB + 1;
    set({
      circuit: {
        components: { ...state.circuit.components, [nc.id]: nc },
        terminals: { ...state.circuit.terminals, [tA.id]: tA, [tB.id]: tB },
        wires: { ...state.circuit.wires },
        nextNodeId: next,
      },
      selectedComponentId: nc.id,
    });
  },

  selectComponent: (id) => set({ selectedComponentId: id }),
  setActiveTool: (tool) => set({ activeTool: tool, connectingFrom: null }),

  connectTerminals: (fromTerminalId, toTerminalId) => {
    const state = get();
    const fTerm = state.circuit.terminals[fromTerminalId];
    const tTerm = state.circuit.terminals[toTerminalId];
    if (!fTerm || !tTerm || fTerm.nodeId === tTerm.nodeId) return;
    state.pushUndo();
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
        wires: { ...state.circuit.wires, [wireId]: { id: wireId, fromTerminalId, toTerminalId } },
      },
      connectingFrom: null,
    });
  },

  startConnection: (terminalId) => {
    if (get().activeTool !== 'wire') return;
    set({ connectingFrom: terminalId });
  },

  completeConnection: (terminalId) => {
    const state = get();
    const from = state.connectingFrom;
    if (!from || from === terminalId) {
      set({ connectingFrom: null });
      return;
    }
    const fTerm = state.circuit.terminals[from];
    const tTerm = state.circuit.terminals[terminalId];
    if (!fTerm || !tTerm || fTerm.nodeId === tTerm.nodeId) {
      set({ connectingFrom: null });
      return;
    }
    state.pushUndo();
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
        wires: {
          ...state.circuit.wires,
          [wireId]: { id: wireId, fromTerminalId: from, toTerminalId: terminalId },
        },
      },
      connectingFrom: null,
    });
  },

  cancelConnection: () => set({ connectingFrom: null }),

  toggleSimulation: () => {
    const state = get();
    const willRun = !state.simulationRunning;
    if (willRun && !state.selectedComponentId) {
      const first = Object.values(state.circuit.components).find((c) => c.type !== 'ground');
      if (first) state.selectComponent(first.id);
    }
    set({
      simulationRunning: willRun,
      simTime: willRun ? 0 : state.simTime,
      simError: null,
      simResults: willRun ? null : state.simResults,
    });
  },

  setSimResults: (results) => set({ simResults: results }),
  setSimTime: (t) => set({ simTime: t }),
  setSimError: (err) => set({ simError: err }),

  addProbe: (type, componentId, terminalIndex) => {
    const state = get();
    const comp = state.circuit.components[componentId];
    if (!comp) return;
    const colors = [
      '#3b82f6',
      '#ef4444',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
      '#f97316',
    ];
    if (
      state.probes.find(
        (p) =>
          p.componentId === componentId && p.type === type && p.terminalIndex === terminalIndex,
      )
    )
      return;
    const colorIdx = state.probes.length % colors.length;
    const probe: MeasurementProbe = {
      id: genId('probe'),
      label: `${comp.label} (${type === 'voltage' ? 'V' : 'I'})`,
      type,
      componentId,
      terminalIndex,
      color: colors[colorIdx],
      visible: true,
    };
    set({ probes: [...state.probes, probe], oscData: { ...state.oscData, [probe.id]: [] } });
  },

  removeProbe: (id) => {
    const state = get();
    const o = { ...state.oscData };
    delete o[id];
    set({ probes: state.probes.filter((p) => p.id !== id), oscData: o });
  },

  toggleProbeVisibility: (id) => {
    set({ probes: get().probes.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)) });
  },

  appendOscData: (probeId, t, v) => {
    const state = get();
    const data = state.oscData[probeId];
    if (!data) return;
    const nd = [...data, { t, v }];
    if (nd.length > 3000) nd.splice(0, nd.length - 3000);
    set({ oscData: { ...state.oscData, [probeId]: nd } });
  },

  clearOscData: () => {
    const o: Record<string, Array<{ t: number; v: number }>> = {};
    for (const k of Object.keys(get().oscData)) o[k] = [];
    set({ oscData: o });
  },

  resetSimulation: () => set({ simTime: 0, simResults: null, simError: null }),
}));
