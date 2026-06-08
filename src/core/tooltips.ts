import type { ComponentType, ToolType } from '../types';
import { COMPONENT_TEMPLATES } from './constants';

export const TOOL_DESCRIPTIONS: Record<ToolType, string> = {
  select:
    'Seleccionar componentes o cables · Supr elimina · Arrastra un extremo del cable para reconectar',
  wire: 'Cable: arrastra desde un punto de conexión (círculo) hasta otro componente',
  probe: 'Clic en componente → sonda de voltaje al osciloscopio',
  multimeter: 'Ver mediciones en el panel multímetro',
  resistor: 'Resistencia óhmica · Parámetro R en propiedades',
  capacitor: 'Capacitor · Simulación transitoria (Backward Euler)',
  inductor: 'Inductor · Corriente con memoria en el motor MNA',
  voltageSource: 'Fuente de voltaje DC · Terminal + rojo, − verde',
  currentSource: 'Fuente de corriente constante',
  switch: 'Interruptor ON/OFF · Cambiar en panel propiedades',
  led: 'LED · Modelo simplificado (V directa)',
  diode: 'Diodo · Modelo simplificado (V directa)',
  transistor: 'Transistor · Aún no modelado (excluido de simulación)',
  potentiometer: 'Potenciómetro · Aún no modelado (excluido de simulación)',
  ground: 'Referencia 0 V · Obligatorio para simular',
  voltmeter: 'Voltímetro ideal (alta impedancia)',
  ammeter: 'Amperímetro ideal (baja impedancia)',
};

export function getComponentTooltip(type: ComponentType): string {
  const label = COMPONENT_TEMPLATES[type]?.label ?? type;
  return `${label} — ${TOOL_DESCRIPTIONS[type] ?? 'Arrastrar al canvas o clic para colocar'}`;
}
