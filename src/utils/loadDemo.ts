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

/**
 * Circuito demo completo — todos los tipos de componente.
 *
 * Rama principal: Bat → SW → A → R → D → LED → L → GND
 * Paralelos: C y VM sobre LED; Pot sobre R; Trans sobre LED (visual).
 * Fuente de corriente en el canvas (sin cablear) para mostrar el símbolo.
 */
export function loadDemo(onReady?: () => void): void {
  const colGap = GRID_SIZE * 7;
  const originX = 90;
  const rowMain = 200;
  const rowVisual = rowMain - GRID_SIZE * 4;
  const rowAux = rowMain + GRID_SIZE * 4;
  const rowGnd = rowMain + GRID_SIZE * 5;
  const x = (col: number) => originX + col * colGap;

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

  gs().addComponent('voltageSource', snap({ x: x(0), y: rowMain }));
  gs().addComponent('switch', snap({ x: x(1), y: rowMain }));
  gs().addComponent('ammeter', snap({ x: x(2), y: rowMain }));
  gs().addComponent('resistor', snap({ x: x(3), y: rowMain }));
  gs().addComponent('diode', snap({ x: x(4), y: rowMain }));
  gs().addComponent('led', snap({ x: x(5), y: rowMain }));
  gs().addComponent('inductor', snap({ x: x(6), y: rowMain }));
  gs().addComponent('capacitor', snap({ x: x(7), y: rowMain }));
  gs().addComponent('ground', snap({ x: x(5), y: rowGnd }));
  gs().addComponent('voltmeter', snap({ x: x(5), y: rowAux }));
  gs().addComponent('currentSource', snap({ x: x(2), y: rowAux }));
  gs().addComponent('potentiometer', snap({ x: x(3), y: rowVisual }));
  gs().addComponent('transistor', snap({ x: x(5), y: rowVisual }));

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
