import React from 'react';
import type { ComponentType } from '../../types';

const colors: Record<string, string> = {
  resistor: '#a78bfa',
  capacitor: '#22d3ee',
  inductor: '#fbbf24',
  voltageSource: '#f87171',
  currentSource: '#fb923c',
  led: '#facc15',
  switch: '#34d399',
  ground: '#94a3b8',
};

export function getSymbolColor(type: ComponentType): string {
  return colors[type] ?? '#94a3b8';
}

export const ResistorSvg: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = colors.resistor }) => {
  const seg = 6;
  const sw = size / seg;
  const amp = size * 0.25;
  const pts: string[] = [];
  pts.push(`${-size / 2},0`);
  for (let i = 0; i < seg; i++) {
    const sx = -size / 2 + i * sw;
    const ex = -size / 2 + (i + 1) * sw;
    const mx = (sx + ex) / 2;
    pts.push(`${mx},${(i % 2 === 0 ? -1 : 1) * amp}`);
    pts.push(`${ex},0`);
  }
  return (
    <svg width={size} height={size * 0.6} viewBox={`${-size / 2} ${-size * 0.3} ${size} ${size * 0.6}`}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
};

export const CapacitorSvg: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = colors.capacitor }) => {
  const g = 10;
  return (
    <svg width={size} height={size * 0.5} viewBox={`${-size / 2} ${-size * 0.25} ${size} ${size * 0.5}`}>
      <line x1={-size / 2} y1={0} x2={-g / 2} y2={0} stroke={color} strokeWidth={2} />
      <line x1={-g / 2} y1={-size * 0.2} x2={-g / 2} y2={size * 0.2} stroke={color} strokeWidth={2.5} />
      <line x1={g / 2} y1={-size * 0.2} x2={g / 2} y2={size * 0.2} stroke={color} strokeWidth={2.5} />
      <line x1={g / 2} y1={0} x2={size / 2} y2={0} stroke={color} strokeWidth={2} />
    </svg>
  );
};

export const InductorSvg: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = colors.inductor }) => {
  const loops = 4;
  const loopW = size / (loops + 1);
  const amp = size * 0.2;
  const r = loopW * 0.45;
  const pts: string[] = [`${-size / 2},0`];
  pts.push(`${-size / 2 + loopW - r},0`);
  for (let i = 0; i < loops; i++) {
    const cx = -size / 2 + (i + 1) * loopW;
    pts.push(`${cx},${-amp}`);
    pts.push(`${cx + r},0`);
    if (i < loops - 1) {
      const nx = -size / 2 + (i + 2) * loopW;
      pts.push(`${nx - r},0`);
    }
  }
  pts.push(`${size / 2},0`);
  return (
    <svg width={size} height={size * 0.5} viewBox={`${-size / 2} ${-size * 0.25} ${size} ${size * 0.5}`}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export const VoltageSourceSvg: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = colors.voltageSource }) => {
  const r = size * 0.35;
  const cx = size / 2;
  const cy = size * 0.3;
  return (
    <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} />
      <line x1={0} y1={cy} x2={cx - r} y2={cy} stroke={color} strokeWidth={2} />
      <line x1={cx + r} y1={cy} x2={size} y2={cy} stroke={color} strokeWidth={2} />
      <text x={cx - 5} y={cy - r * 0.4} fill={color} fontSize={12} fontWeight="bold" textAnchor="middle">+</text>
      <text x={cx + 5} y={cy + r * 0.5} fill={color} fontSize={12} fontWeight="bold" textAnchor="middle">−</text>
    </svg>
  );
};

export const CurrentSourceSvg: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = colors.currentSource }) => {
  const r = size * 0.35;
  const cx = size / 2;
  const cy = size * 0.3;
  return (
    <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} />
      <line x1={0} y1={cy} x2={cx - r} y2={cy} stroke={color} strokeWidth={2} />
      <line x1={cx + r} y1={cy} x2={size} y2={cy} stroke={color} strokeWidth={2} />
      <polyline points={`${cx},${cy - r * 0.5} ${cx + r * 0.35},${cy} ${cx},${cy + r * 0.5}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const LedSvg: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = colors.led }) => {
  const s = size * 0.3;
  const xL = -size * 0.25;
  const xR = size * 0.12;
  return (
    <svg width={size} height={size * 0.7} viewBox={`${-size / 2} ${-size * 0.35} ${size} ${size * 0.7}`}>
      <line x1={-size / 2} y1={0} x2={xL} y2={0} stroke={color} strokeWidth={2} />
      <polyline points={`${xL},0 ${xR},${-s} ${xL},0 ${xR},${s}`} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <line x1={xR} y1={-s * 0.7} x2={xR} y2={s * 0.7} stroke={color} strokeWidth={2.5} />
      <line x1={xR} y1={0} x2={size / 2} y2={0} stroke={color} strokeWidth={2} />
    </svg>
  );
};

export const SwitchSvg: React.FC<{ size?: number; color?: string; closed?: boolean }> = ({ size = 80, color = colors.switch, closed = false }) => {
  return (
    <svg width={size} height={size * 0.5} viewBox={`${-size / 2} ${-size * 0.25} ${size} ${size * 0.5}`}>
      {closed ? (
        <line x1={-size / 2} y1={0} x2={size / 2} y2={0} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      ) : (
        <>
          <line x1={-size / 2} y1={0} x2={size * 0.15} y2={0} stroke={color} strokeWidth={2.5} />
          <line x1={size * 0.15} y1={0} x2={size * 0.15} y2={-size * 0.35} stroke={color} strokeWidth={2.5} />
          <circle cx={size * 0.2} cy={-size * 0.28} r={3} fill={color} />
          <line x1={size * 0.28} y1={size * 0.05} x2={size / 2} y2={0} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

export const GroundSvg: React.FC<{ size?: number; color?: string }> = ({ size = 80, color = colors.ground }) => {
  const w = size * 0.35;
  return (
    <svg width={size} height={size * 0.4} viewBox={`${-size / 2} ${-size * 0.2} ${size} ${size * 0.4}`}>
      <circle cx={0} cy={-size * 0.2} r={3} fill={color} />
      <line x1={0} y1={-size * 0.2} x2={0} y2={0} stroke={color} strokeWidth={2} />
      <line x1={-w} y1={0} x2={w} y2={0} stroke={color} strokeWidth={2} />
      <line x1={-w * 0.7} y1={6} x2={w * 0.7} y2={6} stroke={color} strokeWidth={1.5} />
      <line x1={-w * 0.4} y1={12} x2={w * 0.4} y2={12} stroke={color} strokeWidth={1} />
    </svg>
  );
};
