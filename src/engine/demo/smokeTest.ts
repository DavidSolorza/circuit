/**
 * Smoke test — RC circuit with voltage source and ground.
 * Run: npx tsx src/engine/demo/smokeTest.ts
 */
import { SimulationEngine } from '../SimulationEngine';
import type { EngineCircuit } from '../types';

function buildRcCircuit(): EngineCircuit {
  return {
    components: {
      v1: {
        id: 'v1',
        type: 'voltageSource',
        label: 'V1',
        params: { voltage: 5 },
        terminalIds: ['t_v1_0', 't_v1_1'],
      },
      r1: {
        id: 'r1',
        type: 'resistor',
        label: 'R1',
        params: { resistance: 1000 },
        terminalIds: ['t_r1_0', 't_r1_1'],
      },
      c1: {
        id: 'c1',
        type: 'capacitor',
        label: 'C1',
        params: { capacitance: 1e-6 },
        terminalIds: ['t_c1_0', 't_c1_1'],
      },
      gnd: {
        id: 'gnd',
        type: 'ground',
        label: 'GND',
        params: {},
        terminalIds: ['t_gnd_0', 't_gnd_1'],
      },
    },
    terminals: {
      t_v1_0: { id: 't_v1_0', componentId: 'v1', index: 0, nodeId: 1 },
      t_v1_1: { id: 't_v1_1', componentId: 'v1', index: 1, nodeId: 2 },
      t_r1_0: { id: 't_r1_0', componentId: 'r1', index: 0, nodeId: 2 },
      t_r1_1: { id: 't_r1_1', componentId: 'r1', index: 1, nodeId: 3 },
      t_c1_0: { id: 't_c1_0', componentId: 'c1', index: 0, nodeId: 3 },
      t_c1_1: { id: 't_c1_1', componentId: 'c1', index: 1, nodeId: 0 },
      t_gnd_0: { id: 't_gnd_0', componentId: 'gnd', index: 0, nodeId: 0 },
      t_gnd_1: { id: 't_gnd_1', componentId: 'gnd', index: 1, nodeId: 0 },
    },
    wires: {
      w1: { id: 'w1', fromTerminalId: 't_v1_1', toTerminalId: 't_r1_0' },
      w2: { id: 'w2', fromTerminalId: 't_r1_1', toTerminalId: 't_c1_0' },
      w3: { id: 'w3', fromTerminalId: 't_c1_1', toTerminalId: 't_gnd_0' },
      w4: { id: 'w4', fromTerminalId: 't_v1_0', toTerminalId: 't_gnd_0' },
    },
  };
}

const engine = new SimulationEngine();
engine.loadCircuit(buildRcCircuit());

const validation = engine.validate();
console.log('Validation:', validation);

const results = engine.simulate({
  analysis: 'transient',
  duration: 0.01,
  timestep: 1e-4,
});

console.log('Success:', results.status.success);
console.log('Steps:', results.time.length);
const r1 = results.branchCurrents.r1;
console.log('R1 current (last):', r1?.[r1.length - 1]);
console.log('Tree:\n', engine.simulationTree.toAscii());

if (!results.status.success) {
  throw new Error(results.status.error ?? 'Smoke test failed');
}
