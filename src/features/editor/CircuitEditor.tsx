import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ComponentNode, { type ComponentNodeData } from './ComponentNode';
import { useCircuitStore } from '../../store/circuitStore';
import type { ComponentType, Point } from '../../types';
import { GRID_SIZE } from '../../core/constants';

const nodeTypes = { component: ComponentNode };

interface Props {
  width: number;
  height: number;
}

function CanvasInner({ width, height }: Props) {
  const rf = useReactFlow();
  const components = useCircuitStore((s) => s.circuit.components);
  const wires = useCircuitStore((s) => s.circuit.wires);
  const terminals = useCircuitStore((s) => s.circuit.terminals);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const activeTool = useCircuitStore((s) => s.activeTool);
  const addComponent = useCircuitStore((s) => s.addComponent);
  const moveComponent = useCircuitStore((s) => s.moveComponent);
  const selectComponent = useCircuitStore((s) => s.selectComponent);
  const removeComponent = useCircuitStore((s) => s.removeComponent);
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);
  const addProbe = useCircuitStore((s) => s.addProbe);

  const nodes: Node<ComponentNodeData>[] = useMemo(
    () =>
      Object.values(components).map((c) => ({
        id: c.id,
        type: 'component',
        position: c.position,
        data: {
          label: c.label,
          type: c.type,
          params: c.params,
          rotation: c.rotation,
          selected: c.id === selectedId,
        },
        selected: c.id === selectedId,
        deletable: true,
        draggable: true,
        selectable: true,
      })),
    [components, selectedId],
  );

  const edges: Edge[] = useMemo(() => {
    const termToComp = (tid: string) => terminals[tid]?.componentId ?? '';
    const termIndex = (tid: string) => terminals[tid]?.index ?? 0;
    return Object.values(wires).map((w) => ({
      id: w.id,
      source: termToComp(w.fromTerminalId),
      target: termToComp(w.toTerminalId),
      sourceHandle: `term${termIndex(w.fromTerminalId)}`,
      targetHandle: `term${termIndex(w.toTerminalId)}`,
      type: 'bezier',
      animated: true,
      style: { stroke: '#6B7280', strokeWidth: 2.5 },
      active: false,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6B7280' },
    }));
  }, [wires, terminals]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const ch of changes) {
        if (ch.type === 'position' && ch.position) {
          moveComponent(ch.id, ch.position as Point);
        }
        if (ch.type === 'remove') {
          removeComponent(ch.id);
        }
        if (ch.type === 'select') {
          if (ch.selected) selectComponent(ch.id);
        }
      }
    },
    [moveComponent, removeComponent, selectComponent],
  );

  const onEdgesChange = useCallback(() => {}, []);

  const onConnect = useCallback((conn: Connection) => {
    if (!conn.source || !conn.target || !conn.sourceHandle || !conn.targetHandle) return;

    const state = useCircuitStore.getState();
    const srcComp = state.circuit.components[conn.source];
    const tgtComp = state.circuit.components[conn.target];

    if (!srcComp || !tgtComp) return;

    // Get handle IDs from connection
    const srcHandleId = conn.sourceHandle;
    const tgtHandleId = conn.targetHandle;

    // Find terminal IDs that match the handles
    const srcTerminal = srcComp.terminalIds.find((tid) => {
      const term = state.circuit.terminals[tid];
      const handleIndex = term?.index ?? 0;
      return srcHandleId === `term${handleIndex}`;
    });

    const tgtTerminal = tgtComp.terminalIds.find((tid) => {
      const term = state.circuit.terminals[tid];
      const handleIndex = term?.index ?? 0;
      return tgtHandleId === `term${handleIndex}`;
    });

    if (srcTerminal && tgtTerminal) {
      state.connectTerminals(srcTerminal, tgtTerminal);

      // Auto-add probes to interesting components for visualization
      const componentsToProbe = ['led', 'capacitor', 'inductor', 'resistor'];
      if (
        componentsToProbe.includes(srcComp.type) &&
        !state.probes.some((p) => p.componentId === srcComp.id && p.type === 'current')
      ) {
        state.addProbe('current', srcComp.id);
      }
      if (
        componentsToProbe.includes(tgtComp.type) &&
        !state.probes.some((p) => p.componentId === tgtComp.id && p.type === 'current')
      ) {
        state.addProbe('current', tgtComp.id);
      }

      // Auto-start simulation after connection
      if (!state.simulationRunning) {
        setTimeout(() => {
          state.toggleSimulation();
        }, 300);
      }
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('componentType') as ComponentType;
      if (!type) return;
      const bounds = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addComponent(type, { x: bounds.x, y: bounds.y });
      setActiveTool('select');
    },
    [rf, addComponent, setActiveTool],
  );

  const handlePaneClick = useCallback(() => {
    if (activeTool !== 'select' && activeTool !== 'wire' && activeTool !== 'probe') {
      setActiveTool('select');
    }
  }, [activeTool, setActiveTool]);

  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => {
      if (activeTool === 'probe') {
        addProbe('voltage', node.id, 0);
        return;
      }
      if (activeTool === 'wire') {
        const state = useCircuitStore.getState();
        const comp = state.circuit.components[node.id];
        if (!comp) return;
        const terminalId =
          state.connectingFrom === null ? comp.terminalIds[1] : comp.terminalIds[0];
        if (state.connectingFrom) {
          state.completeConnection(terminalId);
        } else {
          state.startConnection(terminalId);
        }
        return;
      }
      selectComponent(node.id);
    },
    [activeTool, addProbe, selectComponent],
  );

  return (
    <div
      className="w-full h-full"
      style={{ width: Math.max(width, 200), height: Math.max(height, 200) }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        snapToGrid
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        selectionMode={SelectionMode.Partial}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        nodeDragThreshold={0}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.5 }}
        minZoom={0.1}
        maxZoom={3}
        defaultEdgeOptions={{
          type: 'bezier',
          animated: true,
          style: { stroke: '#6B7280', strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6B7280' },
        }}
      >
        <Background color="#E8E0D0" gap={GRID_SIZE} size={1} />
        <Controls
          showInteractive={false}
          className="!bg-surface-800 !border-surface-700 !rounded-lg !shadow-sm !text-surface-500"
        />
        <MiniMap
          nodeStrokeColor="#1F4D3A"
          nodeColor="#9EBFB0"
          maskColor="rgba(248,245,239,0.6)"
          className="!bg-surface-900 !border !border-surface-700 !rounded-lg !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}

export default function CircuitEditor(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
