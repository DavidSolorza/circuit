import { GRID_SIZE } from '../core/constants';
import type { ComponentType } from '../types';
import { useCircuitStore } from '../store/circuitStore';
import { DEMO_CELL } from './loadDemo';

/** Coloca el primer componente centrado en la cuadrícula del canvas. */
export function placeFirstComponent(type: ComponentType = 'resistor'): void {
  const { addComponent, setActiveTool } = useCircuitStore.getState();
  addComponent(type, { x: 180 + DEMO_CELL * 2, y: 130 + DEMO_CELL * 2 });
  setActiveTool('select');
}
