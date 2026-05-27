import { useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ComponentNode, { type ComponentNodeData } from './ComponentNode';
import { useCircuitStore } from '../../store/circuitStore';
import type { ComponentType, Point } from '../../types';
import { COMPONENT_WIDTH, GRID_SIZE } from '../../core/constants';

const nodeTypes = { component: ComponentNode };

interface Props {
  width: number;
  height: number;
}

function CanvasInner({ width, height }: Props) {
  const rf = useReactFlow();
  const components = useCircuitStore((s) => s.circuit.components);
  const wires = useCircuitStore((s) => s.circuit.wires);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const activeTool = useCircuitStore((s) => s.activeTool);
  const addComponent = useCircuitStore((s) => s.addComponent);
  const moveComponent = useCircuitStore((s) => s.moveComponent);
  const selectComponent = useCircuitStore((s) => s.selectComponent);
  const removeComponent = useCircuitStore((s) => s.removeComponent);
  const startConnection = useCircuitStore((s) => s.startConnection);
  const completeConnection = useCircuitStore((s) => s.completeConnection);
  const cancelConnection = useCircuitStore((s) => s.cancelConnection);
  const connectingFrom = useCircuitStore((s) => s.connectingFrom);
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);
  const addProbe = useCircuitStore((s) => s.addProbe);

  const nodes: Node<ComponentNodeData>[] = useMemo(() =>
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
    })),
    [components, selectedId],
  );

  const edges: Edge[] = useMemo(() =>
    Object.values(wires).map((w) => ({
      id: w.id,
      source: components[w.fromTerminalId]?.id ?? '',
      target: components[w.toTerminalId]?.id ?? '',
      sourceHandle: 'term0',
      targetHandle: 'term1',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
    })),
    [wires, components],
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    for (const ch of changes) {
      if (ch.type === 'position' && ch.dragging === false && ch.position) {
        moveComponent(ch.id, ch.position as Point);
      }
      if (ch.type === 'remove') {
        removeComponent(ch.id);
      }
      if (ch.type === 'select') {
        selectComponent(ch.id ?? null);
      }
    }
  }, [moveComponent, removeComponent, selectComponent]);

  const onEdgesChange = useCallback((_changes: EdgeChange[]) => {
    // edges are managed by our store; no direct edge changes from RF
  }, []);

  const onConnect = useCallback((conn: Connection) => {
    if (!conn.source || !conn.target) return;
    const state = useCircuitStore.getState();
    const srcComp = state.circuit.components[conn.source];
    const tgtComp = state.circuit.components[conn.target];
    if (!srcComp || !tgtComp) return;
    const srcTerm = srcComp.terminalIds[1];
    const tgtTerm = tgtComp.terminalIds[0];
    const fTerm = state.circuit.terminals[srcTerm];
    const tTerm = state.circuit.terminals[tgtTerm];
    if (!fTerm || !tTerm || fTerm.nodeId === tTerm.nodeId) return;
    startConnection(srcTerm);
    setTimeout(() => completeConnection(tgtTerm), 0);
  }, [startConnection, completeConnection]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType') as ComponentType;
    if (!type) return;
    const bounds = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addComponent(type, { x: bounds.x, y: bounds.y });
    setActiveTool('select');
  }, [rf, addComponent, setActiveTool]);

  const onClick = useCallback(() => {
    if (activeTool === 'wire' && connectingFrom) {
      cancelConnection();
    }
  }, [activeTool, connectingFrom, cancelConnection]);

  const handlePaneClick = useCallback(() => {
    if (activeTool === 'wire' && connectingFrom) {
      cancelConnection();
    }
    if (activeTool !== 'select' && activeTool !== 'wire' && activeTool !== 'probe') {
      setActiveTool('select');
    }
  }, [activeTool, connectingFrom, cancelConnection, setActiveTool]);

  const handleNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    if (activeTool === 'probe') {
      addProbe('voltage', node.id, 0);
      setActiveTool('select');
      return;
    }
    selectComponent(node.id);
  }, [activeTool, addProbe, selectComponent, setActiveTool]);

  return (
    <div className="w-full h-full">
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
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.5 }}
        minZoom={0.1}
        maxZoom={3}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#64748b', strokeWidth: 2 },
        }}
      >
        <Background color="#334155" gap={GRID_SIZE} size={1} />
        <Controls showInteractive={false} className="!bg-gray-800 !border-gray-700 !rounded-lg" />
        <MiniMap
          nodeStrokeColor="#3b82f6"
          nodeColor="#1e293b"
          maskColor="rgba(0,0,0,0.7)"
          className="!bg-gray-900 !border !border-gray-700 !rounded-lg"
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
