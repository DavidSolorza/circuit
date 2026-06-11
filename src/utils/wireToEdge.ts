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

  const srcRot = sourceComp.rotation ?? 0;
  const tgtRot = targetComp.rotation ?? 0;

  return {
    id: wire.id,
    source: fromTerm.componentId,
    target: toTerm.componentId,
    sourceHandle: `term${fromTerm.index}`,
    targetHandle: `term${toTerm.index}`,
    type: 'smoothstep',
    pathOptions: { borderRadius: 18, offset: 10 },
    deletable: true,
    reconnectable: true,
    selected,
    zIndex: selected ? 20 : 10,
    interactionWidth: 28,
    animated: false,
    data: { srcRot, tgtRot },
    style: {
      stroke: selected ? '#C9A86A' : '#4B5563',
      strokeWidth: selected ? 3.5 : 2.5,
    },
    markerEnd: undefined,
  } as Edge;
}
