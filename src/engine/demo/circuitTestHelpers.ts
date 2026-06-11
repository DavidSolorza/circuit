import type { EngineCircuit, EngineComponent, EngineElementType } from '../types';

export interface CompSpec {
  id: string;
  type: EngineElementType;
  label: string;
  params?: Record<string, number>;
}

export interface WireSpec {
  id: string;
  from: string;
  to: string;
}

export function term(
  id: string,
  compId: string,
  index: 0 | 1,
  nodeId: number,
): EngineCircuit['terminals'][string] {
  return { id, componentId: compId, index, nodeId };
}

export function wire(id: string, from: string, to: string): EngineCircuit['wires'][string] {
  return { id, fromTerminalId: from, toTerminalId: to };
}

/** Batería + cadena serie de componentes + GND. Polo − a nodo 0. */
export function buildBatterySeriesCircuit(
  name: string,
  chain: CompSpec[],
  voltage = 9,
  extraWires: WireSpec[] = [],
): EngineCircuit {
  const components: Record<string, EngineComponent> = {};
  const terminals: EngineCircuit['terminals'] = {};
  const wires: EngineCircuit['wires'] = {};

  const batId = `bat_${name}`;
  components[batId] = {
    id: batId,
    type: 'voltageSource',
    label: 'Bat',
    params: { voltage },
    terminalIds: [`t_${batId}_0`, `t_${batId}_1`],
  };
  terminals[`t_${batId}_0`] = term(`t_${batId}_0`, batId, 0, 1);
  terminals[`t_${batId}_1`] = term(`t_${batId}_1`, batId, 1, 2);

  let prevTerm = `t_${batId}_1`;
  let nodeId = 3;

  for (const spec of chain) {
    const t0 = `t_${spec.id}_0`;
    const t1 = `t_${spec.id}_1`;
    components[spec.id] = {
      id: spec.id,
      type: spec.type,
      label: spec.label,
      params: spec.params ?? {},
      terminalIds: [t0, t1],
    };
    terminals[t0] = term(t0, spec.id, 0, nodeId - 1);
    terminals[t1] = term(t1, spec.id, 1, nodeId);
    wires[`w_${spec.id}_in`] = {
      id: `w_${spec.id}_in`,
      fromTerminalId: prevTerm,
      toTerminalId: t0,
    };
    prevTerm = t1;
    nodeId++;
  }

  const gndId = `gnd_${name}`;
  components[gndId] = {
    id: gndId,
    type: 'ground',
    label: 'GND',
    params: {},
    terminalIds: [`t_${gndId}_0`, `t_${gndId}_1`],
  };
  terminals[`t_${gndId}_0`] = term(`t_${gndId}_0`, gndId, 0, 0);
  terminals[`t_${gndId}_1`] = term(`t_${gndId}_1`, gndId, 1, 0);

  wires[`w_${name}_to_gnd`] = {
    id: `w_${name}_to_gnd`,
    fromTerminalId: prevTerm,
    toTerminalId: `t_${gndId}_0`,
  };
  wires[`w_${name}_bat_gnd`] = {
    id: `w_${name}_bat_gnd`,
    fromTerminalId: `t_${batId}_0`,
    toTerminalId: `t_${gndId}_0`,
  };

  for (const ew of extraWires) {
    wires[ew.id] = { id: ew.id, fromTerminalId: ew.from, toTerminalId: ew.to };
  }

  return { components, terminals, wires };
}
