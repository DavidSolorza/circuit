import type { ComponentType } from './types';

export const GRID_SIZE = 30;
export const CANVAS_WIDTH = 2000;
export const CANVAS_HEIGHT = 2000;

export const COMPONENT_WIDTH = 100;
export const COMPONENT_HEIGHT = 50;
export const TERMINAL_RADIUS = 6;

export const DT = 1 / 60;

export const COLORS = {
  grid: '#e5e7eb',
  gridMinor: '#f3f4f6',
  background: '#f9fafb',
  wire: '#4b5563',
  wireHighlight: '#3b82f6',
  terminal: '#6b7280',
  terminalHover: '#3b82f6',
  currentDot: '#f59e0b',
  resistor: '#8b5cf6',
  capacitor: '#06b6d4',
  inductor: '#f59e0b',
  voltageSource: '#ef4444',
  currentSource: '#f97316',
  switch: '#10b981',
  led: '#facc15',
  ground: '#6b7280',
  selected: '#3b82f6',
} as const;

export const PROBE_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

export interface ComponentTemplate {
  type: ComponentType;
  label: string;
  defaultParams: Record<string, number>;
  paramDefs: Array<{
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
  }>;
}

export const COMPONENT_TEMPLATES: Record<ComponentType, ComponentTemplate> = {
  resistor: {
    type: 'resistor',
    label: 'Resistor',
    defaultParams: { resistance: 1000 },
    paramDefs: [
      { key: 'resistance', label: 'Resistance', min: 1, max: 10_000_000, step: 100, unit: '\u03A9' },
    ],
  },
  capacitor: {
    type: 'capacitor',
    label: 'Capacitor',
    defaultParams: { capacitance: 1e-6 },
    paramDefs: [
      { key: 'capacitance', label: 'Capacitance', min: 1e-12, max: 1e-3, step: 1e-6, unit: 'F' },
    ],
  },
  inductor: {
    type: 'inductor',
    label: 'Inductor',
    defaultParams: { inductance: 1e-3 },
    paramDefs: [
      { key: 'inductance', label: 'Inductance', min: 1e-9, max: 10, step: 1e-3, unit: 'H' },
    ],
  },
  voltageSource: {
    type: 'voltageSource',
    label: 'Battery',
    defaultParams: { voltage: 9 },
    paramDefs: [
      { key: 'voltage', label: 'Voltage', min: 0.1, max: 30, step: 0.1, unit: 'V' },
    ],
  },
  currentSource: {
    type: 'currentSource',
    label: 'Current Source',
    defaultParams: { current: 0.01 },
    paramDefs: [
      { key: 'current', label: 'Current', min: 0.0001, max: 5, step: 0.001, unit: 'A' },
    ],
  },
  led: {
    type: 'led',
    label: 'LED',
    defaultParams: { forwardVoltage: 2.0 },
    paramDefs: [
      { key: 'forwardVoltage', label: 'Forward V', min: 0.5, max: 3.3, step: 0.1, unit: 'V' },
    ],
  },
  switch: {
    type: 'switch',
    label: 'Switch',
    defaultParams: { isClosed: 0 },
    paramDefs: [
      { key: 'isClosed', label: 'Closed', min: 0, max: 1, step: 1, unit: '' },
    ],
  },
  ground: {
    type: 'ground',
    label: 'Ground',
    defaultParams: {},
    paramDefs: [],
  },
};
