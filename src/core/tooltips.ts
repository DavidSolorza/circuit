import type { ComponentType, ToolType } from '../types';
import { COMPONENT_TEMPLATES } from './constants';

export const TOOL_DESCRIPTIONS: Record<ToolType, string> = {
  select: 'Mover piezas, elegir cables. Supr borra.',
  wire: 'Une dos puntos de conexión (círculos).',
  probe: 'Clic en un componente: añade sonda de voltaje.',
  multimeter: 'Lecturas en el panel derecho.',
  resistor: 'Resistencia en ohmios (R en propiedades).',
  capacitor: 'Condensador. Carga y descarga en transitorio.',
  inductor: 'Bobina. Frena cambios de corriente.',
  voltageSource: 'Batería DC. Polo + y −.',
  currentSource: 'Corriente fija entre sus dos terminales.',
  switch: 'Abre o cierra el paso (botón en propiedades).',
  led: 'Conduce en directa con caída ~2 V; bloquea en inversa.',
  diode: 'Conduce en directa con caída ~0,7 V; bloquea en inversa.',
  transistor: 'Alta impedancia (referencia). Sin amplificación aún.',
  potentiometer: 'Resistencia variable: R = Rmax × cursor.',
  lamp: 'Bombilla resistiva; brilla según la potencia disipada.',
  fuse: 'Fusible en serie. Fundido = circuito abierto (prop. Fundido).',
  ground: 'Tierra 0 V. Hace falta una en el circuito.',
  voltmeter: 'Mide tensión entre bornes (casi no consume).',
  ammeter: 'Mide corriente en serie (casi sin caída).',
};

export function getComponentTooltip(type: ComponentType): string {
  const label = COMPONENT_TEMPLATES[type]?.label ?? type;
  const hint = TOOL_DESCRIPTIONS[type];
  return hint ? `${label}: ${hint}` : label;
}
