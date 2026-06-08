import type { Edge } from 'reactflow';
import type { CircuitComponent, CircuitState, WireDef } from '../types';

/** Build a React Flow edge that always renders regardless of wire direction in storage. */
export function wireToReactFlowEdge(
  wire: WireDef,
  terminals: CircuitState['terminals'],
  components: Record<string, CircuitComponent>,
  selected = false,
): Edge | null {
  const fromTerm = terminals[wire.fromTerminalId];
  const toTerm = terminals[wire.toTerminalId];
  if (!fromTerm || !toTerm) return null;

  const sourceComp = components[fromTerm.componentId];
  const targetComp = components[toTerm.componentId];
  if (!sourceComp || !targetComp) return null;

  return {
    id: wire.id,
    source: fromTerm.componentId,
    target: toTerm.componentId,
    sourceHandle: `term${fromTerm.index}`,
    targetHandle: `term${toTerm.index}`,
    type: 'smoothstep',
    deletable: true,
    reconnectable: true,
    selected,
    zIndex: selected ? 20 : 10,
    interactionWidth: 28,
    style: {
      stroke: selected ? '#C9A86A' : '#374151',
      strokeWidth: selected ? 4 : 3,
    },
    markerEnd: undefined,
  };
}
