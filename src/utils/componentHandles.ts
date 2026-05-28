import type { ComponentType, Point } from '../types';

export interface HandleConfig {
  id: string;
  position: 'left' | 'right' | 'top' | 'bottom' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  label?: string;
  isPositive?: boolean; // For battery/sources
}

// Define realistic terminal positions for each component type
export const componentHandleConfigs: Record<ComponentType, HandleConfig[]> = {
  resistor: [
    { id: 'term0', position: 'left', label: '1' },
    { id: 'term1', position: 'right', label: '2' },
  ],
  capacitor: [
    { id: 'term0', position: 'left', label: '1' },
    { id: 'term1', position: 'right', label: '2' },
  ],
  inductor: [
    { id: 'term0', position: 'left', label: '1' },
    { id: 'term1', position: 'right', label: '2' },
  ],
  voltageSource: [
    { id: 'term0', position: 'left', label: '-', isPositive: false },
    { id: 'term1', position: 'right', label: '+', isPositive: true },
  ],
  currentSource: [
    { id: 'term0', position: 'left', label: '1' },
    { id: 'term1', position: 'right', label: '2' },
  ],
  led: [
    { id: 'term0', position: 'left', label: '-' },
    { id: 'term1', position: 'right', label: '+' },
  ],
  diode: [
    { id: 'term0', position: 'left', label: 'K' }, // Cathode
    { id: 'term1', position: 'right', label: 'A' }, // Anode
  ],
  transistor: [
    { id: 'term0', position: 'left', label: 'B' }, // Base
    { id: 'term1', position: 'right', label: 'C' }, // Collector
  ],
  potentiometer: [
    { id: 'term0', position: 'left', label: '1' },
    { id: 'term1', position: 'right', label: '2' },
  ],
  switch: [
    { id: 'term0', position: 'left', label: '1' },
    { id: 'term1', position: 'right', label: '2' },
  ],
  ground: [
    { id: 'term0', position: 'top', label: 'GND' },
  ],
  voltmeter: [
    { id: 'term0', position: 'left', label: '-' },
    { id: 'term1', position: 'right', label: '+' },
  ],
  ammeter: [
    { id: 'term0', position: 'left', label: '1' },
    { id: 'term1', position: 'right', label: '2' },
  ],
};

export function getHandleConfig(componentType: ComponentType): HandleConfig[] {
  return componentHandleConfigs[componentType] || [];
}

// Get CSS position for handle based on its configuration
export function getHandlePositionCSS(handleConfig: HandleConfig, nodeSize: { width: number; height: number }): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    width: '20px',
    height: '20px',
  };

  const positions: Record<string, React.CSSProperties> = {
    left: { left: -10, top: '50%', transform: 'translateY(-50%)' },
    right: { right: -10, top: '50%', transform: 'translateY(-50%)' },
    top: { top: -10, left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: -10, left: '50%', transform: 'translateX(-50%)' },
    topleft: { top: -10, left: -10 },
    topright: { top: -10, right: -10 },
    bottomleft: { bottom: -10, left: -10 },
    bottomright: { bottom: -10, right: -10 },
  };

  return { ...baseStyle, ...positions[handleConfig.position] };
}
