/**
 * Prueba 10 circuitos con todos los tipos de componente.
 * Run: pnpm dlx tsx src/engine/demo/allCircuitsTest.ts
 */
import { SimulationEngine } from '../SimulationEngine';
import type { EngineCircuit } from '../types';
import { buildBatterySeriesCircuit, term } from './circuitTestHelpers';
import { buildDemoCircuit } from './demoCircuitTest';

const STEPS = 90;
const DT = 1 / 60;

interface TestCase {
  name: string;
  build: () => EngineCircuit;
  minSteps?: number;
}

function buildRc(): EngineCircuit {
  return buildBatterySeriesCircuit('rc', [
    { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 1000 } },
    { id: 'c1', type: 'capacitor', label: 'C', params: { capacitance: 10e-6 } },
  ]);
}

function buildRl(): EngineCircuit {
  return buildBatterySeriesCircuit('rl', [
    { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 220 } },
    { id: 'l1', type: 'inductor', label: 'L', params: { inductance: 5e-3 } },
  ]);
}

function buildLedCircuit(): EngineCircuit {
  return buildBatterySeriesCircuit('led', [
    { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 330 } },
    { id: 'led1', type: 'led', label: 'LED', params: { forwardVoltage: 2 } },
  ]);
}

function buildDiodeCircuit(): EngineCircuit {
  return buildBatterySeriesCircuit('dio', [
    { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 470 } },
    { id: 'd1', type: 'diode', label: 'D', params: { forwardVoltage: 0.7 } },
  ]);
}

function buildSwitchCircuit(): EngineCircuit {
  return buildBatterySeriesCircuit('sw', [
    { id: 'sw1', type: 'switch', label: 'SW', params: { isClosed: 1 } },
    { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 1000 } },
  ]);
}

function buildMeasureCircuit(): EngineCircuit {
  const base = buildBatterySeriesCircuit(
    'meas',
    [
      { id: 'amm1', type: 'ammeter', label: 'A', params: {} },
      { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 500 } },
    ],
    9,
    [
      { id: 'w_vm0', from: 't_r1_0', to: 't_vm1_0' },
      { id: 'w_vm1', from: 't_r1_1', to: 't_vm1_1' },
    ],
  );
  base.components.vm1 = {
    id: 'vm1',
    type: 'voltmeter',
    label: 'VM',
    params: {},
    terminalIds: ['t_vm1_0', 't_vm1_1'],
  };
  base.terminals.t_vm1_0 = term('t_vm1_0', 'vm1', 0, 4);
  base.terminals.t_vm1_1 = term('t_vm1_1', 'vm1', 1, 5);
  return base;
}

function buildPotCircuit(): EngineCircuit {
  return buildBatterySeriesCircuit('pot', [
    {
      id: 'pot1',
      type: 'potentiometer',
      label: 'Pot',
      params: { maxResistance: 5000, wiper: 0.5 },
    },
    { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 1000 } },
  ]);
}

function buildLampCircuit(): EngineCircuit {
  return buildBatterySeriesCircuit('lamp', [
    { id: 'lamp1', type: 'lamp', label: 'Bombilla', params: { resistance: 220 } },
  ]);
}

function buildFuseCircuit(): EngineCircuit {
  return buildBatterySeriesCircuit('fuse', [
    { id: 'f1', type: 'fuse', label: 'Fusible', params: { isBlown: 0 } },
    { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 100 } },
  ]);
}

function buildTransistorCircuit(): EngineCircuit {
  return buildBatterySeriesCircuit(
    'bjt',
    [
      { id: 'r1', type: 'resistor', label: 'R', params: { resistance: 1000 } },
      { id: 'tr1', type: 'transistor', label: 'Q', params: { beta: 100 } },
    ],
    5,
  );
}

function buildCurrentSourceCircuit(): EngineCircuit {
  const components: EngineCircuit['components'] = {};
  const terminals: EngineCircuit['terminals'] = {};
  const wires: EngineCircuit['wires'] = {};

  components.is1 = {
    id: 'is1',
    type: 'currentSource',
    label: 'I',
    params: { current: 0.005 },
    terminalIds: ['t_is1_0', 't_is1_1'],
  };
  components.r1 = {
    id: 'r1',
    type: 'resistor',
    label: 'R',
    params: { resistance: 1000 },
    terminalIds: ['t_r1_0', 't_r1_1'],
  };
  components.gnd1 = {
    id: 'gnd1',
    type: 'ground',
    label: 'GND',
    params: {},
    terminalIds: ['t_gnd1_0', 't_gnd1_1'],
  };

  terminals.t_is1_0 = term('t_is1_0', 'is1', 0, 2);
  terminals.t_is1_1 = term('t_is1_1', 'is1', 1, 0);
  terminals.t_r1_0 = term('t_r1_0', 'r1', 0, 2);
  terminals.t_r1_1 = term('t_r1_1', 'r1', 1, 0);
  terminals.t_gnd1_0 = term('t_gnd1_0', 'gnd1', 0, 0);
  terminals.t_gnd1_1 = term('t_gnd1_1', 'gnd1', 1, 0);

  wires.w1 = { id: 'w1', fromTerminalId: 't_is1_0', toTerminalId: 't_r1_0' };
  wires.w2 = { id: 'w2', fromTerminalId: 't_r1_1', toTerminalId: 't_gnd1_0' };
  wires.w3 = { id: 'w3', fromTerminalId: 't_is1_1', toTerminalId: 't_gnd1_0' };

  return { components, terminals, wires };
}

const TESTS: TestCase[] = [
  { name: '1-RC (R+C)', build: buildRc },
  { name: '2-RL (R+L)', build: buildRl },
  { name: '3-LED (R+LED)', build: buildLedCircuit },
  { name: '4-Diodo (R+D)', build: buildDiodeCircuit },
  { name: '5-Interruptor (SW+R)', build: buildSwitchCircuit },
  { name: '6-Medición (A+R+VM)', build: buildMeasureCircuit },
  { name: '7-Potenciómetro', build: buildPotCircuit },
  { name: '8-Bombilla', build: buildLampCircuit },
  { name: '9-Fusible', build: buildFuseCircuit },
  { name: '10-Demo completo (todos)', build: buildDemoCircuit },
];

// Extra: transistor y fuente de corriente
const EXTRA_TESTS: TestCase[] = [
  { name: 'Extra-Transistor', build: buildTransistorCircuit },
  { name: 'Extra-Fuente I', build: buildCurrentSourceCircuit },
];

function runCase(tc: TestCase): boolean {
  const engine = new SimulationEngine();
  engine.loadCircuit(tc.build());

  const validation = engine.validate();
  if (!validation.valid) {
    console.error(`FAIL ${tc.name} — validación:`, validation.errors);
    return false;
  }

  let last = null;
  const steps = tc.minSteps ?? STEPS;
  for (let i = 0; i < steps; i++) {
    last = engine.advanceStep(DT);
    if (!last.results.status.success) {
      console.error(`FAIL ${tc.name} — paso ${i}:`, last.results.status.error);
      return false;
    }
  }

  const branches = Object.keys(last!.results.branchCurrents).length;
  console.log(`OK  ${tc.name} — ${steps} pasos, ${branches} ramas`);
  return true;
}

console.log('=== Electro+ Lab — 10 circuitos de prueba ===\n');

let passed = 0;
let failed = 0;

for (const tc of TESTS) {
  if (runCase(tc)) passed++;
  else failed++;
}

console.log('\n--- Pruebas adicionales ---');
for (const tc of EXTRA_TESTS) {
  if (runCase(tc)) passed++;
  else failed++;
}

console.log(`\n=== Resultado: ${passed} OK, ${failed} FAIL ===`);
if (failed > 0) process.exit(1);
console.log('Todos los circuitos pasaron.');
