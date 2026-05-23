import { Line } from 'react-konva';
import { useCircuitStore } from '../../store/circuitStore';
import { COLORS, COMPONENT_WIDTH } from '../../core/constants';

function getTerminalPos(
  comp: { position: { x: number; y: number }; rotation: number } | undefined,
  index: 0 | 1,
): { x: number; y: number } | null {
  if (!comp) return null;
  const dx = index === 0 ? -COMPONENT_WIDTH / 2 : COMPONENT_WIDTH / 2;
  const cos = Math.cos((comp.rotation * Math.PI) / 180);
  const sin = Math.sin((comp.rotation * Math.PI) / 180);
  return {
    x: comp.position.x + dx * cos,
    y: comp.position.y + dx * sin,
  };
}

interface WireLineProps {
  wireId: string;
}

export function WireLine({ wireId }: WireLineProps) {
  const wire = useCircuitStore((s) => s.circuit.wires[wireId]);
  const terminals = useCircuitStore((s) => s.circuit.terminals);
  const components = useCircuitStore((s) => s.circuit.components);

  if (!wire) return null;

  const fromTerm = terminals[wire.fromTerminalId];
  const toTerm = terminals[wire.toTerminalId];
  if (!fromTerm || !toTerm) return null;

  const fromComp = components[fromTerm.componentId];
  const toComp = components[toTerm.componentId];
  if (!fromComp || !toComp) return null;

  const fromPos = getTerminalPos(fromComp, fromTerm.index);
  const toPos = getTerminalPos(toComp, toTerm.index);
  if (!fromPos || !toPos) return null;

  const midX = (fromPos.x + toPos.x) / 2;

  const points = [
    fromPos.x,
    fromPos.y,
    midX,
    fromPos.y,
    midX,
    toPos.y,
    toPos.x,
    toPos.y,
  ];

  return (
    <Line
      points={points}
      stroke={COLORS.wire}
      strokeWidth={2.5}
      lineCap="round"
      lineJoin="round"
      listening={false}
    />
  );
}
