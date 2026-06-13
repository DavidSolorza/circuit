import type { CircuitComponent, ComponentType } from '../types';

const APPROXIMATED_TYPES = new Set<ComponentType>(['led', 'diode', 'transistor']);

export interface ComponentModelStatus {
  supported: boolean;
  approximated: boolean;
  message?: string;
}

export function getComponentModelStatus(comp: CircuitComponent): ComponentModelStatus {
  if (APPROXIMATED_TYPES.has(comp.type)) {
    if (comp.type === 'transistor') {
      return {
        supported: true,
        approximated: true,
        message: 'Alta impedancia entre dos bornes; el parámetro β no afecta la simulación aún.',
      };
    }
    if (comp.type === 'led' || comp.type === 'diode') {
      return {
        supported: true,
        approximated: true,
        message: 'Modelo por tramos: conduce en directa con Vf, bloquea en inversa.',
      };
    }
  }
  return { supported: true, approximated: false };
}

export function isDrawableOnly(type: ComponentType): boolean {
  return false;
}
