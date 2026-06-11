import { GRID_SIZE } from '../core/constants';
import { useCircuitStore } from '../store/circuitStore';
import type { ComponentType } from '../types';
import { initCircuitState } from './circuit';
import { notifyDemoLoaded } from './demoUi';

type Store = ReturnType<typeof useCircuitStore.getState>;

function snap(p: { x: number; y: number }) {
  return {
    x: Math.round(p.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(p.y / GRID_SIZE) * GRID_SIZE,
  };
}

function byType(s: Store, type: ComponentType) {
  const c = Object.values(s.circuit.components).find((x) => x.type === type);
  if (!c) throw new Error(`Demo: falta componente ${type}`);
  return c;
}

/** Espaciado uniforme de la cuadrícula del demo (cuadrado). */
export const DEMO_CELL = GRID_SIZE * 5;

/**
 * Circuito demo completo — todos los tipos de componente.
 *
 * Lazo en U compacto (~5×4 celdas):
 *        VM   Pot
 *   Bat → SW → A → R
 *   |              ↓
 *   GND ← L ← LED ← D
 *              Cap
 */
export function loadDemo(onReady?: () => void): void {
  const gap = DEMO_CELL;
  const originX = 180;
  const originY = 130;
  const at = (col: number, row: number) =>
    snap({ x: originX + col * gap, y: originY + row * gap });

  useCircuitStore.setState({
    circuit: initCircuitState(),
    selectedComponentId: null,
    selectedWireId: null,
    simulationRunning: false,
    simResults: null,
    simError: null,
    probes: [],
    oscData: {},
    connectingFrom: null,
    simTime: 0,
    undoStack: [],
    redoStack: [],
  });

  const gs = () => useCircuitStore.getState();

  // Rama serie (→ y luego ←)
  gs().addComponent('voltageSource', at(1, 1));
  gs().addComponent('switch', at(2, 1));
  gs().addComponent('ammeter', at(3, 1));
  gs().addComponent('resistor', at(4, 1));
  gs().addComponent('diode', at(4, 2));
  gs().addComponent('led', at(3, 2));
  gs().addComponent('inductor', at(2, 2));
  gs().addComponent('ground', at(1, 3));
  // Paralelos alineados
  gs().addComponent('capacitor', at(3, 3));
  gs().addComponent('voltmeter', at(3, 0));
  gs().addComponent('potentiometer', at(4, 0));
  gs().addComponent('transistor', at(0, 2));
  gs().addComponent('currentSource', at(0, 0));

  const s = gs();
  const bat = byType(s, 'voltageSource');
  const sw = byType(s, 'switch');
  const amm = byType(s, 'ammeter');
  const res = byType(s, 'resistor');
  const dio = byType(s, 'diode');
  const led = byType(s, 'led');
  const ind = byType(s, 'inductor');
  const cap = byType(s, 'capacitor');
  const gnd = byType(s, 'ground');
  const vm = byType(s, 'voltmeter');
  const pot = byType(s, 'potentiometer');
  const trans = byType(s, 'transistor');

  s.updateComponentParam(sw.id, 'isClosed', 1);
  s.updateComponentParam(res.id, 'resistance', 470);
  // Rama serie principal
  s.connectTerminals(bat.terminalIds[1], sw.terminalIds[0]);
  s.connectTerminals(sw.terminalIds[1], amm.terminalIds[0]);
  s.connectTerminals(amm.terminalIds[1], res.terminalIds[0]);
  s.connectTerminals(res.terminalIds[1], dio.terminalIds[0]);
  s.connectTerminals(dio.terminalIds[1], led.terminalIds[0]);
  s.connectTerminals(led.terminalIds[1], ind.terminalIds[0]);
  s.connectTerminals(ind.terminalIds[1], gnd.terminalIds[0]);

  // Retorno batería a tierra
  s.connectTerminals(gnd.terminalIds[0], bat.terminalIds[0]);

  // Paralelo LED: capacitor y voltímetro
  s.connectTerminals(led.terminalIds[0], cap.terminalIds[0]);
  s.connectTerminals(led.terminalIds[1], cap.terminalIds[1]);
  s.connectTerminals(led.terminalIds[0], vm.terminalIds[0]);
  s.connectTerminals(led.terminalIds[1], vm.terminalIds[1]);

  // Referencia visual: potenciómetro // resistencia, transistor // LED
  s.connectTerminals(res.terminalIds[0], pot.terminalIds[0]);
  s.connectTerminals(res.terminalIds[1], pot.terminalIds[1]);
  s.connectTerminals(led.terminalIds[0], trans.terminalIds[0]);
  s.connectTerminals(led.terminalIds[1], trans.terminalIds[1]);

  // Sondas de osciloscopio
  s.addProbe('current', amm.id);
  s.addProbe('voltage', led.id, 0);
  s.addProbe('voltage', cap.id, 0);
  s.addProbe('voltage', ind.id, 0);

  s.setActiveTool('select');
  s.selectComponent(sw.id);
  notifyDemoLoaded();
  onReady?.();
}
