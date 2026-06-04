import type { CircuitComponent, ComponentType } from '../types';

/** Mirrors engine ADAPTER_ALIASES + SUPPORTED_TYPES (read-only reference, no engine import). */
export const UNSUPPORTED_TYPES = new Set<ComponentType>(['potentiometer', 'transistor']);
const APPROXIMATED_TYPES = new Set<ComponentType>(['led', 'diode']);

export interface ComponentModelStatus {
  supported: boolean;
  approximated: boolean;
  message?: string;
}

export function getComponentModelStatus(comp: CircuitComponent): ComponentModelStatus {
  if (UNSUPPORTED_TYPES.has(comp.type)) {
    return {
      supported: false,
      approximated: false,
      message: 'Este componente aún no está modelado en el motor de simulación.',
    };
  }
  if (APPROXIMATED_TYPES.has(comp.type)) {
    return {
      supported: true,
      approximated: true,
      message: 'Modelo simplificado (fuente de voltaje equivalente).',
    };
  }
  return { supported: true, approximated: false };
}
