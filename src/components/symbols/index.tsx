import React from 'react';
import type { ComponentType } from '../../types';

const colors: Record<string, string> = {
  resistor: '#a78bfa',
  capacitor: '#22d3ee',
  inductor: '#fbbf24',
  voltageSource: '#f87171',
  currentSource: '#fb923c',
  led: '#facc15',
  diode: '#f472b6',
  transistor: '#818cf8',
  potentiometer: '#6B7280',
  switch: '#34d399',
  ground: '#6B7280',
  voltmeter: '#60a5fa',
  ammeter: '#60a5fa',
};

export function getSymbolColor(type: ComponentType): string {
  return colors[type] ?? '#6B7280';
}

const sp = (color: string, w = 2) => ({
  fill: 'none' as const,
  stroke: color,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const TerminalDot: React.FC<{ x: number; y: number; color?: string; label?: string }> = ({
  x,
  y,
  color = '#3b82f6',
  label,
}) => (
  <g>
    <circle
      cx={x}
      cy={y}
      r={6}
      fill="#F8F5EF"
      stroke={color}
      strokeWidth={2}
      className="transition-all duration-150"
    />
    <circle cx={x} cy={y} r={3} fill={color} className="transition-all duration-150" />
    {label && (
      <text
        x={x + (x < 0 ? -8 : 8)}
        y={y + 4}
        fill={color}
        fontSize={8}
        fontWeight="bold"
        textAnchor={x < 0 ? 'end' : 'start'}
      >
        {label}
      </text>
    )}
  </g>
);

export const ResistorSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.resistor,
  highlight,
}) => {
  const seg = 6;
  const sw = size / seg;
  const amp = size * 0.2;
  const left = -size / 2;
  const right = size / 2;
  const pts: string[] = [];
  pts.push(`${left},0`);
  for (let i = 0; i < seg; i++) {
    const sx = left + i * sw;
    const ex = left + (i + 1) * sw;
    const mx = (sx + ex) / 2;
    pts.push(`${mx},${(i % 2 === 0 ? -1 : 1) * amp}`);
    pts.push(`${ex},0`);
  }
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg width={size} height={size * 0.5} viewBox={`${left} ${-size * 0.25} ${size} ${size * 0.5}`}>
      <polyline points={pts.join(' ')} {...sp(hc, 2)} />
      <TerminalDot x={left} y={0} color={hc} />
      <TerminalDot x={right} y={0} color={hc} />
    </svg>
  );
};

export const CapacitorSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.capacitor,
  highlight,
}) => {
  const g = 10;
  const left = -size / 2;
  const right = size / 2;
  const hh = size * 0.22;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg width={size} height={size * 0.5} viewBox={`${left} ${-size * 0.25} ${size} ${size * 0.5}`}>
      <line x1={left} y1={0} x2={-g / 2} y2={0} {...sp(hc)} />
      <line
        x1={-g / 2}
        y1={-hh}
        x2={-g / 2}
        y2={hh}
        stroke={hc}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={g / 2}
        y1={-hh}
        x2={g / 2}
        y2={hh}
        stroke={hc}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line x1={g / 2} y1={0} x2={right} y2={0} {...sp(hc)} />
      <TerminalDot x={left} y={0} color={hc} />
      <TerminalDot x={right} y={0} color={hc} />
    </svg>
  );
};

export const InductorSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.inductor,
  highlight,
}) => {
  const loops = 4;
  const loopW = size / (loops + 1);
  const amp = size * 0.22;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  const pts: string[] = [`${left},0`];
  for (let i = 0; i < loops; i++) {
    const cx = left + (i + 1) * loopW;
    pts.push(`${cx - loopW * 0.4},0`);
    pts.push(`${cx},${-amp}`);
    pts.push(`${cx + loopW * 0.4},0`);
  }
  pts.push(`${right},0`);
  return (
    <svg width={size} height={size * 0.5} viewBox={`${left} ${-size * 0.25} ${size} ${size * 0.5}`}>
      <polyline points={pts.join(' ')} {...sp(hc, 2.5)} />
      <TerminalDot x={left} y={0} color={hc} />
      <TerminalDot x={right} y={0} color={hc} />
    </svg>
  );
};

export const VoltageSourceSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.voltageSource,
  highlight,
}) => {
  const r = size * 0.28;
  const cx = 0;
  const cy = 0;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox={`${left} ${-size * 0.28} ${size} ${size * 0.55}`}
    >
      <line x1={left} y1={cy} x2={cx - r} y2={cy} {...sp(hc)} />
      <line x1={cx + r} y1={cy} x2={right} y2={cy} {...sp(hc)} />
      <circle cx={cx} cy={cy} r={r} {...sp(hc, 2)} />
      <line
        x1={cx - r * 0.35}
        y1={cy}
        x2={cx + r * 0.35}
        y2={cy}
        stroke={hc}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy - r * 0.35}
        x2={cx}
        y2={cy + r * 0.35}
        stroke={hc}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <TerminalDot x={left} y={cy} color="#22c55e" label="−" />
      <TerminalDot x={right} y={cy} color="#ef4444" label="+" />
    </svg>
  );
};

export const CurrentSourceSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.currentSource,
  highlight,
}) => {
  const r = size * 0.28;
  const cx = 0;
  const cy = 0;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox={`${left} ${-size * 0.28} ${size} ${size * 0.55}`}
    >
      <line x1={left} y1={cy} x2={cx - r} y2={cy} {...sp(hc)} />
      <line x1={cx + r} y1={cy} x2={right} y2={cy} {...sp(hc)} />
      <circle cx={cx} cy={cy} r={r} {...sp(hc, 2)} />
      <polyline
        points={`${cx - r * 0.3},${cy + r * 0.35} ${cx + r * 0.3},${cy} ${cx - r * 0.3},${cy - r * 0.35}`}
        {...sp(hc, 2.5)}
      />
      <TerminalDot x={left} y={cy} color={hc} />
      <TerminalDot x={right} y={cy} color={hc} />
    </svg>
  );
};

export const LedSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.led,
  highlight,
}) => {
  const s = size * 0.25;
  const bodyW = size * 0.3;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg width={size} height={size * 0.5} viewBox={`${left} ${-size * 0.25} ${size} ${size * 0.5}`}>
      <line x1={left} y1={0} x2={-bodyW} y2={0} {...sp(hc)} />
      <line x1={-bodyW} y1={-s} x2={-bodyW} y2={s} {...sp(hc, 1.5)} />
      <line x1={-bodyW} y1={0} x2={bodyW * 0.5} y2={-s} {...sp(hc, 2.5)} />
      <line x1={-bodyW} y1={0} x2={bodyW * 0.5} y2={s} {...sp(hc, 2.5)} />
      <line
        x1={bodyW * 0.5}
        y1={-s}
        x2={bodyW * 0.5}
        y2={s}
        stroke={hc}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <line x1={bodyW * 0.5} y1={0} x2={right} y2={0} {...sp(hc)} />
      <polygon
        points={`${-bodyW + 4},${-s + 4} ${-bodyW + 8},${-s + 4} ${-bodyW + 6},${-s - 2}`}
        fill={hc}
      />
      <TerminalDot x={left} y={0} color={hc} />
      <TerminalDot x={right} y={0} color={hc} />
    </svg>
  );
};

export const DiodeSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.diode,
  highlight,
}) => {
  const hh = size * 0.22;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg width={size} height={size * 0.5} viewBox={`${left} ${-size * 0.25} ${size} ${size * 0.5}`}>
      <line x1={left} y1={0} x2={-10} y2={0} {...sp(hc, 2)} />
      <polygon
        points={`-10,0 10,${-hh} 10,${hh}`}
        fill="none"
        stroke={hc}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <line x1={10} y1={-hh} x2={10} y2={hh} stroke={hc} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={10} y1={0} x2={right} y2={0} {...sp(hc, 2)} />
      <TerminalDot x={left} y={0} color={hc} />
      <TerminalDot x={right} y={0} color={hc} />
    </svg>
  );
};

export const TransistorSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.transistor,
  highlight,
}) => {
  const hh = size * 0.22;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  const cx = -4;
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox={`${left} ${-size * 0.28} ${size} ${size * 0.55}`}
    >
      <line x1={left} y1={0} x2={cx} y2={0} {...sp(hc, 2)} />
      <line x1={cx} y1={-hh} x2={cx} y2={hh} stroke={hc} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx} y1={-hh} x2={right - 8} y2={-hh} {...sp(hc, 2)} />
      <line x1={cx} y1={hh} x2={right - 8} y2={hh} {...sp(hc, 2)} />
      <line x1={right - 8} y1={-hh} x2={right} y2={0} {...sp(hc, 2)} />
      <line x1={right - 8} y1={hh} x2={right} y2={0} {...sp(hc, 2)} />
      <polygon
        points={`${right - 6},${hh} ${right - 12},${hh + 5} ${right - 6},${hh + 10}`}
        fill="none"
        stroke={hc}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <TerminalDot x={left} y={0} color={hc} />
      <TerminalDot x={right} y={0} color={hc} />
    </svg>
  );
};

export const PotentiometerSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.potentiometer,
  highlight,
}) => {
  const seg = 5;
  const sw = size * 0.13;
  const amp = size * 0.17;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  const pts: string[] = [];
  const startX = -size * 0.35;
  pts.push(`${startX},0`);
  for (let i = 0; i < seg; i++) {
    const sx = startX + i * sw;
    const ex = startX + (i + 1) * sw;
    const mx = (sx + ex) / 2;
    pts.push(`${mx},${(i % 2 === 0 ? -1 : 1) * amp}`);
    pts.push(`${ex},0`);
  }
  const endX = startX + seg * sw;
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox={`${left} ${-size * 0.28} ${size} ${size * 0.55}`}
    >
      <line x1={left} y1={0} x2={startX} y2={0} {...sp(hc, 2)} />
      <polyline points={pts.join(' ')} {...sp(hc, 2)} />
      <line x1={endX} y1={0} x2={right} y2={0} {...sp(hc, 2)} />
      <line x1={endX - sw * 0.3} y1={0} x2={endX - sw * 1.5} y2={-size * 0.3} {...sp(hc, 1.5)} />
      <polygon
        points={`${endX - sw * 1.5},${-size * 0.3} ${endX - sw * 1.5 + 5},${-size * 0.3 + 4} ${endX - sw * 1.5 - 5},${-size * 0.3 + 4}`}
        fill={hc}
      />
      <TerminalDot x={left} y={0} color={hc} />
      <TerminalDot x={right} y={0} color={hc} />
    </svg>
  );
};

export const SwitchSvg: React.FC<{
  size?: number;
  color?: string;
  highlight?: boolean;
  closed?: boolean;
}> = ({ size = 80, color = colors.switch, highlight, closed = false }) => {
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg width={size} height={size * 0.5} viewBox={`${left} ${-size * 0.25} ${size} ${size * 0.5}`}>
      {closed ? (
        <line
          x1={left}
          y1={0}
          x2={right}
          y2={0}
          stroke={hc}
          strokeWidth={3}
          strokeLinecap="round"
        />
      ) : (
        <>
          <line x1={left} y1={0} x2={-size * 0.15} y2={0} {...sp(hc, 2)} />
          <line x1={-size * 0.15} y1={0} x2={size * 0.1} y2={-size * 0.32} {...sp(hc, 2.5)} />
          <line x1={size * 0.25} y1={0} x2={right} y2={0} {...sp(hc, 2)} />
          <circle cx={size * 0.15} cy={-size * 0.3} r={3} fill={hc} />
        </>
      )}
      <TerminalDot x={left} y={0} color={hc} />
      <TerminalDot x={right} y={0} color={hc} />
    </svg>
  );
};

export const GroundSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.ground,
  highlight,
}) => {
  const w = size * 0.4;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox={`${-size / 2} ${-size * 0.25} ${size} ${size * 0.5}`}
    >
      <circle cx={0} cy={-size * 0.18} r={3} fill={hc} />
      <line x1={0} y1={-size * 0.18} x2={0} y2={0} {...sp(hc)} />
      <line x1={-w} y1={0} x2={w} y2={0} stroke={hc} strokeWidth={3} strokeLinecap="round" />
      <line
        x1={-w * 0.7}
        y1={6}
        x2={w * 0.7}
        y2={6}
        stroke={hc}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1={-w * 0.4}
        y1={12}
        x2={w * 0.4}
        y2={12}
        stroke={hc}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const VoltmeterSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.voltmeter,
  highlight,
}) => {
  const r = size * 0.28;
  const cx = 0;
  const cy = 0;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox={`${left} ${-size * 0.28} ${size} ${size * 0.55}`}
    >
      <line x1={left} y1={cy} x2={cx - r} y2={cy} {...sp(hc)} />
      <line x1={cx + r} y1={cy} x2={right} y2={cy} {...sp(hc)} />
      <circle cx={cx} cy={cy} r={r} {...sp(hc, 2)} fill={hc} fillOpacity={0.1} />
      <text
        x={cx}
        y={cy + 4.5}
        fill={hc}
        fontSize={13}
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="serif"
      >
        V
      </text>
      <TerminalDot x={left} y={cy} color={hc} />
      <TerminalDot x={right} y={cy} color={hc} />
    </svg>
  );
};

export const AmmeterSvg: React.FC<{ size?: number; color?: string; highlight?: boolean }> = ({
  size = 80,
  color = colors.ammeter,
  highlight,
}) => {
  const r = size * 0.28;
  const cx = 0;
  const cy = 0;
  const left = -size / 2;
  const right = size / 2;
  const hc = highlight ? '#60a5fa' : color;
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox={`${left} ${-size * 0.28} ${size} ${size * 0.55}`}
    >
      <line x1={left} y1={cy} x2={cx - r} y2={cy} {...sp(hc)} />
      <line x1={cx + r} y1={cy} x2={right} y2={cy} {...sp(hc)} />
      <circle cx={cx} cy={cy} r={r} {...sp(hc, 2)} fill={hc} fillOpacity={0.1} />
      <text
        x={cx}
        y={cy + 4.5}
        fill={hc}
        fontSize={13}
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="serif"
      >
        A
      </text>
      <TerminalDot x={left} y={cy} color={hc} />
      <TerminalDot x={right} y={cy} color={hc} />
    </svg>
  );
};

export const symbolComponents: Record<
  string,
  React.FC<{ size?: number; color?: string; highlight?: boolean; closed?: boolean }>
> = {
  resistor: ResistorSvg,
  capacitor: CapacitorSvg,
  inductor: InductorSvg,
  voltageSource: VoltageSourceSvg,
  currentSource: CurrentSourceSvg,
  led: LedSvg,
  diode: DiodeSvg,
  transistor: TransistorSvg,
  potentiometer: PotentiometerSvg,
  switch: SwitchSvg,
  ground: GroundSvg,
  voltmeter: VoltmeterSvg,
  ammeter: AmmeterSvg,
};
