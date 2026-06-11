/**
 * Valida y simula el cableado del circuito demo.
 * Run: pnpm dlx tsx src/engine/demo/demoCircuitTest.ts
 */
import { SimulationEngine } from '../SimulationEngine';
import type { EngineCircuit } from '../types';

export function buildDemoCircuit(): EngineCircuit {
  const t = (id: string, compId: string, index: 0 | 1, nodeId: number) => ({
    id,
    componentId: compId,
    index,
    nodeId,
  });

  const components = {
    bat: {
      id: 'bat',
      type: 'voltageSource' as const,
      label: 'Batería',
      params: { voltage: 9 },
      terminalIds: ['t_bat0', 't_bat1'] as [string, string],
    },
    sw: {
      id: 'sw',
      type: 'switch' as const,
      label: 'Interruptor',
      params: { isClosed: 1 },
      terminalIds: ['t_sw0', 't_sw1'] as [string, string],
    },
    amm: {
      id: 'amm',
      type: 'ammeter' as const,
      label: 'Amperímetro',
      params: {},
      terminalIds: ['t_amm0', 't_amm1'] as [string, string],
    },
    res: {
      id: 'res',
      type: 'resistor' as const,
      label: 'Resistencia',
      params: { resistance: 470 },
      terminalIds: ['t_res0', 't_res1'] as [string, string],
    },
    dio: {
      id: 'dio',
      type: 'diode' as const,
      label: 'Diodo',
      params: {},
      terminalIds: ['t_dio0', 't_dio1'] as [string, string],
    },
    led: {
      id: 'led',
      type: 'led' as const,
      label: 'LED',
      params: {},
      terminalIds: ['t_led0', 't_led1'] as [string, string],
    },
    ind: {
      id: 'ind',
      type: 'inductor' as const,
      label: 'Inductor',
      params: { inductance: 0.01 },
      terminalIds: ['t_ind0', 't_ind1'] as [string, string],
    },
    gnd: {
      id: 'gnd',
      type: 'ground' as const,
      label: 'Tierra',
      params: {},
      terminalIds: ['t_gnd0', 't_gnd1'] as [string, string],
    },
    cap: {
      id: 'cap',
      type: 'capacitor' as const,
      label: 'Capacitor',
      params: { capacitance: 47e-6 },
      terminalIds: ['t_cap0', 't_cap1'] as [string, string],
    },
    vm: {
      id: 'vm',
      type: 'voltmeter' as const,
      label: 'Voltímetro',
      params: {},
      terminalIds: ['t_vm0', 't_vm1'] as [string, string],
    },
    pot: {
      id: 'pot',
      type: 'potentiometer' as const,
      label: 'Potenciómetro',
      params: { maxResistance: 10_000, wiper: 0.5 },
      terminalIds: ['t_pot0', 't_pot1'] as [string, string],
    },
    trans: {
      id: 'trans',
      type: 'transistor' as const,
      label: 'Transistor',
      params: {},
      terminalIds: ['t_tr0', 't_tr1'] as [string, string],
    },
  };

  const terminals = {
    t_bat0: t('t_bat0', 'bat', 0, 1),
    t_bat1: t('t_bat1', 'bat', 1, 2),
    t_sw0: t('t_sw0', 'sw', 0, 2),
    t_sw1: t('t_sw1', 'sw', 1, 3),
    t_amm0: t('t_amm0', 'amm', 0, 3),
    t_amm1: t('t_amm1', 'amm', 1, 4),
    t_res0: t('t_res0', 'res', 0, 4),
    t_res1: t('t_res1', 'res', 1, 5),
    t_dio0: t('t_dio0', 'dio', 0, 5),
    t_dio1: t('t_dio1', 'dio', 1, 6),
    t_led0: t('t_led0', 'led', 0, 6),
    t_led1: t('t_led1', 'led', 1, 7),
    t_ind0: t('t_ind0', 'ind', 0, 7),
    t_ind1: t('t_ind1', 'ind', 1, 8),
    t_gnd0: t('t_gnd0', 'gnd', 0, 0),
    t_gnd1: t('t_gnd1', 'gnd', 1, 0),
    t_cap0: t('t_cap0', 'cap', 0, 6),
    t_cap1: t('t_cap1', 'cap', 1, 7),
    t_vm0: t('t_vm0', 'vm', 0, 6),
    t_vm1: t('t_vm1', 'vm', 1, 7),
    t_pot0: t('t_pot0', 'pot', 0, 4),
    t_pot1: t('t_pot1', 'pot', 1, 5),
    t_tr0: t('t_tr0', 'trans', 0, 6),
    t_tr1: t('t_tr1', 'trans', 1, 7),
  };

  const wires = {
    w1: { id: 'w1', fromTerminalId: 't_bat1', toTerminalId: 't_sw0' },
    w2: { id: 'w2', fromTerminalId: 't_sw1', toTerminalId: 't_amm0' },
    w3: { id: 'w3', fromTerminalId: 't_amm1', toTerminalId: 't_res0' },
    w4: { id: 'w4', fromTerminalId: 't_res1', toTerminalId: 't_dio0' },
    w5: { id: 'w5', fromTerminalId: 't_dio1', toTerminalId: 't_led0' },
    w6: { id: 'w6', fromTerminalId: 't_led1', toTerminalId: 't_ind0' },
    w7: { id: 'w7', fromTerminalId: 't_ind1', toTerminalId: 't_gnd0' },
    w8: { id: 'w8', fromTerminalId: 't_gnd0', toTerminalId: 't_bat0' },
    w9: { id: 'w9', fromTerminalId: 't_led0', toTerminalId: 't_cap0' },
    w10: { id: 'w10', fromTerminalId: 't_led1', toTerminalId: 't_cap1' },
    w11: { id: 'w11', fromTerminalId: 't_led0', toTerminalId: 't_vm0' },
    w12: { id: 'w12', fromTerminalId: 't_led1', toTerminalId: 't_vm1' },
    w13: { id: 'w13', fromTerminalId: 't_res0', toTerminalId: 't_pot0' },
    w14: { id: 'w14', fromTerminalId: 't_res1', toTerminalId: 't_pot1' },
    w15: { id: 'w15', fromTerminalId: 't_led0', toTerminalId: 't_tr0' },
    w16: { id: 'w16', fromTerminalId: 't_led1', toTerminalId: 't_tr1' },
  };

  return { components, terminals, wires };
}

const engine = new SimulationEngine();
engine.loadCircuit(buildDemoCircuit());

const validation = engine.validate();
console.log('valid:', validation.valid);
console.log('errors:', validation.errors);
console.log('warnings:', validation.warnings);

if (!validation.valid) process.exit(1);

let last: ReturnType<SimulationEngine['advanceStep']> | null = null;
for (let i = 0; i < 120; i++) {
  last = engine.advanceStep(1 / 60);
  if (!last.results.status.success) {
    console.log('step fail at', i, last.results.status.error);
    process.exit(1);
  }
}
console.log('120 steps OK');
console.log('I_led last:', last?.results.branchCurrents.led);
console.log('I_amm last:', last?.results.branchCurrents.amm);

const iLed = Math.abs(last?.results.branchCurrents.led?.at(-1) ?? 0);
if (iLed < 1e-4) {
  console.warn('WARN: LED current very low — check diode model');
}

console.log('Demo circuit OK');
