import { Group, Line, Circle, Text, Arrow, Rect } from 'react-konva';
import type { CircuitComponent } from '../../core/types';
import { COMPONENT_WIDTH, COMPONENT_HEIGHT, TERMINAL_RADIUS, COLORS } from '../../core/constants';
import { useCircuitStore } from '../../store/circuitStore';

interface Props {
  component: CircuitComponent;
  isSelected: boolean;
  isConnecting: boolean;
  onDragEnd: (pos: { x: number; y: number }) => void;
  onTerminalClick: (terminalId: string) => void;
  onClick: () => void;
}

function fmtOhm(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  return `${v.toFixed(0)}`;
}
function fmtFarad(v: number): string {
  if (v >= 1) return `${v.toFixed(2)}F`;
  if (v >= 1e-3) return `${(v * 1e3).toFixed(1)}mF`;
  if (v >= 1e-6) return `${(v * 1e6).toFixed(0)}\u00B5F`;
  return `${(v * 1e9).toFixed(0)}nF`;
}
function fmtHenry(v: number): string {
  if (v >= 1) return `${v.toFixed(2)}H`;
  if (v >= 1e-3) return `${(v * 1e3).toFixed(1)}mH`;
  return `${(v * 1e6).toFixed(0)}\u00B5H`;
}
function fmtAmp(v: number): string {
  if (v >= 1) return `${v.toFixed(2)}A`;
  if (v >= 1e-3) return `${(v * 1e3).toFixed(1)}mA`;
  return `${(v * 1e6).toFixed(0)}\u00B5A`;
}

function compLabel(comp: CircuitComponent): string {
  switch (comp.type) {
    case 'resistor': return `${fmtOhm(comp.params.resistance ?? 1000)}\u03A9`;
    case 'capacitor': return fmtFarad(comp.params.capacitance ?? 1e-6);
    case 'inductor': return fmtHenry(comp.params.inductance ?? 1e-3);
    case 'voltageSource': return `${(comp.params.voltage ?? 9).toFixed(1)}V`;
    case 'currentSource': return fmtAmp(comp.params.current ?? 0.01);
    case 'switch': return comp.params.isClosed ? 'ON' : 'OFF';
    case 'led': return `${(comp.params.forwardVoltage ?? 2.0).toFixed(1)}V`;
    case 'ground': return 'GND';
  }
}

function compName(comp: CircuitComponent): string {
  switch (comp.type) {
    case 'resistor': return 'R';
    case 'capacitor': return 'C';
    case 'inductor': return 'L';
    case 'voltageSource': return 'V';
    case 'currentSource': return 'I';
    case 'switch': return 'SW';
    case 'led': return 'LED';
    case 'ground': return '';
  }
}

function drawInductor(w: number, h: number): number[] {
  const pts: number[] = [];
  const loops = 4;
  const loopW = w / (loops + 1);
  const amp = h * 0.35;
  const r = loopW * 0.45;
  const firstCx = -w / 2 + loopW;
  pts.push(-w / 2, 0);
  pts.push(firstCx - r, 0);
  for (let i = 0; i < loops; i++) {
    const cx = -w / 2 + (i + 1) * loopW;
    pts.push(cx, -amp);
    pts.push(cx + r, 0);
    if (i < loops - 1) {
      const nextCx = -w / 2 + (i + 2) * loopW;
      pts.push(nextCx - r, 0);
    }
  }
  pts.push(w / 2, 0);
  return pts;
}

function bodyPoints(type: string, w: number, h: number): number[] {
  switch (type) {
    case 'resistor': {
      const pts: number[] = [];
      const seg = 6;
      const sw = w / seg;
      const amp = h * 0.35;
      pts.push(-w / 2, 0);
      for (let i = 0; i < seg; i++) {
        const sx = -w / 2 + i * sw;
        const ex = -w / 2 + (i + 1) * sw;
        const mx = (sx + ex) / 2;
        pts.push(mx, (i % 2 === 0 ? 1 : -1) * amp);
        pts.push(ex, 0);
      }
      return pts;
    }
    case 'capacitor': {
      const g = 8;
      const lx = -g / 2;
      const rx = g / 2;
      return [-w / 2, 0, lx, 0, lx, -h / 2 + 4, lx, h / 2 - 4, rx, -h / 2 + 4, rx, h / 2 - 4, rx, 0, w / 2, 0];
    }
    case 'inductor':
      return drawInductor(w, h);
    case 'voltageSource': {
      const pts: number[] = [];
      const r = Math.min(w, h) * 0.4;
      for (let i = 0; i <= 24; i++) {
        const a = (Math.PI * 2 * i) / 24;
        pts.push(Math.cos(a) * r, Math.sin(a) * r);
      }
      return pts;
    }
    case 'currentSource': {
      const pts: number[] = [];
      const r = Math.min(w, h) * 0.4;
      for (let i = 0; i <= 24; i++) {
        const a = (Math.PI * 2 * i) / 24;
        pts.push(Math.cos(a) * r, Math.sin(a) * r);
      }
      return pts;
    }
    case 'led': {
      return [];
    }
    case 'switch':
      return [-w / 2, 0, w / 2, 0];
    case 'ground':
      return [0, -h / 2, 0, 0, -w * 0.3, 0, w * 0.3, 0, -w * 0.2, 6, w * 0.2, 6, -w * 0.1, 12, w * 0.1, 12];
    default:
      return [-w / 2, 0, w / 2, 0];
  }
}

function compColor(type: string): string {
  switch (type) {
    case 'resistor': return COLORS.resistor;
    case 'capacitor': return COLORS.capacitor;
    case 'inductor': return COLORS.inductor;
    case 'voltageSource': return COLORS.voltageSource;
    case 'currentSource': return COLORS.currentSource;
    case 'switch': return COLORS.switch;
    case 'led': return COLORS.led;
    case 'ground': return COLORS.ground;
    default: return '#666';
  }
}

export function ComponentShape({ component, isSelected, isConnecting, onDragEnd, onTerminalClick, onClick }: Props) {
  const { type, position, rotation, params } = component;
  const w = COMPONENT_WIDTH;
  const h = COMPONENT_HEIGHT;
  const color = compColor(type);
  const body = bodyPoints(type, w, h);
  const tr = isConnecting ? TERMINAL_RADIUS + 3 : TERMINAL_RADIUS;
  const t0 = { x: -w / 2, y: 0 };
  const t1 = { x: w / 2, y: 0 };
  const sc = isSelected ? COLORS.selected : color;
  const sw = isSelected ? 2.5 : 1.5;
  const label = compLabel(component);
  const name = compName(component);

  const simResults = useCircuitStore((s) => s.simResults);
  const ledCurrent = type === 'led' && simResults ? (simResults.branchCurrents[component.id] ?? 0) : 0;
  const ledOn = ledCurrent > 1e-6;
  const ledColor = ledOn ? '#facc15' : '#6b7280';

  return (
    <Group
      x={position.x} y={position.y} rotation={rotation}
      draggable
      onDragEnd={(e) => onDragEnd({ x: e.target.x(), y: e.target.y() })}
      onClick={onClick} onTap={onClick}
    >
      {isSelected && (
        <Rect
          x={-w / 2 - 8} y={-h / 2 - 8}
          width={w + 16} height={h + 48}
          stroke="#3b82f6"
          strokeWidth={1.5}
          cornerRadius={6}
          dash={[4, 3]}
          listening={false}
        />
      )}
      <Rect
        x={-w / 2 - 10} y={-h / 2 - 10}
        width={w + 20} height={h + 50}
        fill="transparent"
        listening={true}
        name="hitArea"
      />
      <Line
        points={body}
        stroke={sc}
        strokeWidth={sw}
        closed={type === 'voltageSource' || type === 'currentSource' || type === 'ground'}
        fill={type === 'voltageSource' || type === 'currentSource' ? '#1e293b' : undefined}
        tension={type === 'inductor' ? 0.3 : 0}
        listening={false}
      />

      {type === 'voltageSource' && (
        <>
          <Text x={-5} y={-h * 0.3} text="+" fontSize={14} fill="#f87171" listening={false} />
          <Text x={2} y={h * 0.15} text="-" fontSize={14} fill="#f87171" listening={false} />
        </>
      )}

      {type === 'currentSource' && (
        <Arrow
          points={[0, h * 0.2, 0, -h * 0.2]}
          stroke="#f97316"
          fill="#f97316"
          strokeWidth={2.5}
          pointerLength={8}
          pointerWidth={6}
          listening={false}
        />
      )}

      {type === 'led' && (
        <>
          {ledOn && (
            <>
              <Circle x={0} y={0} radius={h * 1.0} fill="#facc15" opacity={0.08} listening={false} />
              <Circle x={0} y={0} radius={h * 0.6} fill="#facc15" opacity={0.15} listening={false} />
              <Circle x={0} y={0} radius={h * 0.35} fill="#fef08a" opacity={0.3} listening={false} />
            </>
          )}
          <Line points={[-w / 2, 0, -w * 0.3, 0]} stroke={ledColor} strokeWidth={2} listening={false} />
          <Line points={[-w * 0.3, 0, w * 0.12, -h * 0.35]} stroke={ledColor} strokeWidth={2} listening={false} />
          <Line points={[-w * 0.3, 0, w * 0.12, h * 0.35]} stroke={ledColor} strokeWidth={2} listening={false} />
          <Line points={[w * 0.12, -h * 0.25, w * 0.12, h * 0.25]} stroke={ledColor} strokeWidth={2.5} listening={false} />
          <Line points={[w * 0.12, 0, w / 2, 0]} stroke={ledColor} strokeWidth={2} listening={false} />
        </>
      )}

      {type === 'switch' && params.isClosed ? (
        <Line points={[-w / 2, 0, w / 2, 0]} stroke={sc} strokeWidth={2.5} listening={false} />
      ) : type === 'switch' ? (
        <>
          <Line points={[-w / 2, 0, w * 0.2, 0, w * 0.2, -h * 0.45]} stroke={sc} strokeWidth={2.5} listening={false} />
          <Line points={[w * 0.25, -h * 0.3, w / 2, 0]} stroke={sc} strokeWidth={1.5} listening={false} />
        </>
      ) : null}

      {type === 'ground' && <Circle x={0} y={-h / 2} radius={4} fill={COLORS.ground} listening={false} />}

      {name && (
        <Text x={0} y={h / 2 + 12} text={name} fontSize={11} fill="#9ca3af" align="center" listening={false} />
      )}
      {label && (
        <Text x={0} y={h / 2 + 24} text={label} fontSize={10} fill={color} align="center" listening={false} />
      )}

      {type !== 'ground' && (
        <>
          <Circle
            x={t0.x} y={t0.y} radius={tr}
            fill={isConnecting ? '#fbbf24' : '#fff'}
            stroke={isConnecting ? '#f59e0b' : COLORS.terminal}
            strokeWidth={2}
            onClick={(e) => { e.cancelBubble = true; onTerminalClick(component.terminalIds[0]); }}
          />
          <Circle
            x={t1.x} y={t1.y} radius={tr}
            fill={isConnecting ? '#fbbf24' : '#fff'}
            stroke={isConnecting ? '#f59e0b' : COLORS.terminal}
            strokeWidth={2}
            onClick={(e) => { e.cancelBubble = true; onTerminalClick(component.terminalIds[1]); }}
          />
        </>
      )}
    </Group>
  );
}
