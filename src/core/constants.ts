import type { ComponentType, ComponentCategory } from '../types';

export const GRID_SIZE = 30;
export const CANVAS_WIDTH = 2000;
export const CANVAS_HEIGHT = 2000;

export const COMPONENT_WIDTH = 100;
export const COMPONENT_HEIGHT = 50;
export const TERMINAL_RADIUS = 6;

export const DT = 1 / 60;

export const COLORS = {
  grid: '#E8E0D0',
  gridMinor: '#F5F0E6',
  background: '#F8F5EF',
  wire: '#64748b',
  wireHighlight: '#3b82f6',
  terminal: '#3b82f6',
  terminalHover: '#60a5fa',
  currentDot: '#f59e0b',
  resistor: '#a78bfa',
  capacitor: '#22d3ee',
  inductor: '#fbbf24',
  voltageSource: '#f87171',
  currentSource: '#fb923c',
  switch: '#34d399',
  led: '#facc15',
  diode: '#f472b6',
  transistor: '#818cf8',
  potentiometer: '#64748b',
  ground: '#64748b',
  voltmeter: '#60a5fa',
  ammeter: '#60a5fa',
  selected: '#3b82f6',
  error: '#ef4444',
  success: '#22c55e',
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

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: 'Fuentes',
    types: ['voltageSource', 'currentSource'],
  },
  {
    name: 'Pasivos',
    types: ['resistor', 'capacitor', 'inductor', 'potentiometer'],
  },
  {
    name: 'Semiconductores',
    types: ['led', 'diode', 'transistor'],
  },
  {
    name: 'Lógicos',
    types: ['switch'],
  },
  {
    name: 'Medidores',
    types: ['voltmeter', 'ammeter'],
  },
  {
    name: 'Misceláneos',
    types: ['ground'],
  },
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

export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  resistor: {
    type: 'resistor',
    label: 'Resistencia',
    defaultParams: { resistance: 1000 },
    paramDefs: [
      {
        key: 'resistance',
        label: 'Resistencia',
        min: 1,
        max: 10_000_000,
        step: 100,
        unit: '\u03A9',
      },
    ],
  },
  capacitor: {
    type: 'capacitor',
    label: 'Capacitor',
    defaultParams: { capacitance: 1e-6 },
    paramDefs: [
      { key: 'capacitance', label: 'Capacitancia', min: 1e-12, max: 1e-3, step: 1e-6, unit: 'F' },
    ],
  },
  inductor: {
    type: 'inductor',
    label: 'Inductor',
    defaultParams: { inductance: 1e-3 },
    paramDefs: [
      { key: 'inductance', label: 'Inductancia', min: 1e-9, max: 10, step: 1e-3, unit: 'H' },
    ],
  },
  voltageSource: {
    type: 'voltageSource',
    label: 'Bater\u00EDa',
    defaultParams: { voltage: 9 },
    paramDefs: [{ key: 'voltage', label: 'Voltaje', min: 0.1, max: 30, step: 0.1, unit: 'V' }],
  },
  currentSource: {
    type: 'currentSource',
    label: 'Fuente Corriente',
    defaultParams: { current: 0.01 },
    paramDefs: [
      { key: 'current', label: 'Corriente', min: 0.0001, max: 5, step: 0.001, unit: 'A' },
    ],
  },
  led: {
    type: 'led',
    label: 'LED',
    defaultParams: { forwardVoltage: 2.0 },
    paramDefs: [
      { key: 'forwardVoltage', label: 'V. directa', min: 0.5, max: 3.3, step: 0.1, unit: 'V' },
    ],
  },
  diode: {
    type: 'diode',
    label: 'Diodo',
    defaultParams: { forwardVoltage: 0.7 },
    paramDefs: [
      { key: 'forwardVoltage', label: 'V. directa', min: 0.1, max: 1.5, step: 0.05, unit: 'V' },
    ],
  },
  transistor: {
    type: 'transistor',
    label: 'Transistor',
    defaultParams: { beta: 100 },
    paramDefs: [{ key: 'beta', label: '\u03B2', min: 10, max: 1000, step: 10, unit: '' }],
  },
  potentiometer: {
    type: 'potentiometer',
    label: 'Potenciómetro',
    defaultParams: { maxResistance: 10000, wiper: 0.5 },
    paramDefs: [
      {
        key: 'maxResistance',
        label: 'R. máxima',
        min: 100,
        max: 1_000_000,
        step: 100,
        unit: '\u03A9',
      },
      { key: 'wiper', label: 'Cursor', min: 0, max: 1, step: 0.01, unit: '' },
    ],
  },
  switch: {
    type: 'switch',
    label: 'Interruptor',
    defaultParams: { isClosed: 0 },
    paramDefs: [{ key: 'isClosed', label: 'Cerrado', min: 0, max: 1, step: 1, unit: '' }],
  },
  ground: {
    type: 'ground',
    label: 'Tierra',
    defaultParams: {},
    paramDefs: [],
  },
  voltmeter: {
    type: 'voltmeter',
    label: 'Voltímetro',
    defaultParams: {},
    paramDefs: [],
  },
  ammeter: {
    type: 'ammeter',
    label: 'Amperímetro',
    defaultParams: {},
    paramDefs: [],
  },
};
