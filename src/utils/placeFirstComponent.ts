import { GRID_SIZE } from '../core/constants';
import type { ComponentType } from '../types';
import { useCircuitStore } from '../store/circuitStore';

/** Coloca el primer componente en una posición visible del canvas. */
export function placeFirstComponent(type: ComponentType = 'resistor'): void {
  const { addComponent, setActiveTool } = useCircuitStore.getState();
  addComponent(type, { x: GRID_SIZE * 6, y: GRID_SIZE * 6 });
  setActiveTool('select');
}
