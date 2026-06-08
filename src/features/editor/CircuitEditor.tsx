import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ComponentNode, { type ComponentNodeData } from './ComponentNode';
import { useCircuitStore } from '../../store/circuitStore';
import { toastInfo, toastSuccess, toastWarning } from '../../shared/store/toastStore';
import { wireConnectMessage } from '../../utils/wireConnect';
import { wireToReactFlowEdge } from '../../utils/wireToEdge';
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
  const selectedWireId = useCircuitStore((s) => s.selectedWireId);
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

  const edges: Edge[] = useMemo(
    () =>
      Object.values(wires)
        .map((w) => wireToReactFlowEdge(w, terminals, components, w.id === selectedWireId))
        .filter((e): e is Edge => e !== null),
    [wires, terminals, components, selectedWireId],
  );

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

  const removeWire = useCircuitStore((s) => s.removeWire);
  const reconnectWire = useCircuitStore((s) => s.reconnectWire);
  const selectWire = useCircuitStore((s) => s.selectWire);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const ch of changes) {
        if (ch.type === 'remove') {
          removeWire(ch.id);
          toastInfo('Cable eliminado');
        }
      }
    },
    [removeWire],
  );

  const resolveTerminalFromHandle = useCallback(
    (componentId: string, handleId: string): string | null => {
      const comp = useCircuitStore.getState().circuit.components[componentId];
      if (!comp) return null;
      return (
        comp.terminalIds.find((tid) => {
          const term = useCircuitStore.getState().circuit.terminals[tid];
          return handleId === `term${term?.index ?? 0}`;
        }) ?? null
      );
    },
    [],
  );

  const onEdgeClick = useCallback((_e: React.MouseEvent, edge: Edge) => {
    selectWire(edge.id);
  }, [selectWire]);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (
        !newConnection.source ||
        !newConnection.target ||
        !newConnection.sourceHandle ||
        !newConnection.targetHandle
      ) {
        toastWarning('Reconexión cancelada', 'Suelta el cable sobre un punto de conexión válido.');
        return;
      }

      const fromTerminal = resolveTerminalFromHandle(
        newConnection.source,
        newConnection.sourceHandle,
      );
      const toTerminal = resolveTerminalFromHandle(newConnection.target, newConnection.targetHandle);

      if (!fromTerminal || !toTerminal) {
        toastWarning('No se pudo reconectar', 'El extremo debe ir a un punto de conexión.');
        return;
      }

      const result = reconnectWire(oldEdge.id, fromTerminal, toTerminal);
      if (!result.ok) {
        toastWarning('No se pudo reconectar', wireConnectMessage(result.reason));
        return;
      }

      selectWire(oldEdge.id);
      toastSuccess('Cable reconectado', 'El extremo se movió al nuevo componente.');
    },
    [reconnectWire, selectWire, resolveTerminalFromHandle],
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target || !conn.sourceHandle || !conn.targetHandle) {
        toastWarning(
          'Conexión incompleta',
          'Arrastra desde un punto de conexión (círculo azul/rojo) hasta otro componente.',
        );
        return;
      }

      const srcTerminal = resolveTerminalFromHandle(conn.source, conn.sourceHandle);
      const tgtTerminal = resolveTerminalFromHandle(conn.target, conn.targetHandle);

      if (!srcTerminal || !tgtTerminal) {
        toastWarning(
          'No se pudo conectar',
          'Suelta el cable sobre el punto de conexión de otro componente.',
        );
        return;
      }

      const result = useCircuitStore.getState().connectTerminals(srcTerminal, tgtTerminal);
      if (!result.ok) {
        const wireCount = Object.keys(useCircuitStore.getState().circuit.wires).length;
        const extra =
          result.reason === 'duplicate' ? ` (${wireCount} cable${wireCount === 1 ? '' : 's'} en el circuito)` : '';
        toastWarning('No se pudo conectar', wireConnectMessage(result.reason) + extra);
        return;
      }

      toastSuccess('Cable conectado', 'Presiona INICIAR cuando el circuito esté listo (con tierra).');
    },
    [resolveTerminalFromHandle],
  );

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
    const state = useCircuitStore.getState();
    if (state.connectingFrom) {
      state.cancelConnection();
      toastInfo('Conexión cancelada');
    }
    state.selectWire(null);
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
        toastInfo(
          'Herramienta Cable',
          'Arrastra desde los círculos de conexión de un componente hasta otro. No hagas clic en el cuerpo del símbolo.',
        );
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
        onEdgeClick={onEdgeClick}
        onReconnect={onReconnect}
        reconnectRadius={24}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        elevateEdgesOnSelect
        edgesFocusable
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
          type: 'smoothstep',
          style: { stroke: '#374151', strokeWidth: 3 },
          interactionWidth: 24,
          deletable: true,
          reconnectable: true,
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
