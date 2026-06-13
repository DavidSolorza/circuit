import type { CircuitState, ComponentType, SimResults } from '../types';
import { getElectricalNodeForTerminal } from '../services/localSimulation';
import { COMPONENT_TEMPLATES } from '../core/constants';
import { getComponentReadings } from './componentReadings';

export interface CircuitStats {
  components: number;
  wires: number;
  terminals: number;
  probes: number;
  /** Nodos eléctricos únicos (incluye GND = 0) */
  electricalNodes: number;
  /** Nodos de simulación MNA (sin GND) */
  mnaNodes: number;
  branches: number;
  looseComponents: number;
  hasGround: boolean;
  byType: Partial<Record<ComponentType, number>>;
  /** Energía almacenada estimada (J) — solo con simulación activa/pausada */
  capEnergyJ: number;
  indEnergyJ: number;
  totalStoredEnergyJ: number;
}

function countLooseComponents(circuit: CircuitState): number {
  const wired = new Set<string>();
  for (const w of Object.values(circuit.wires)) {
    wired.add(w.fromTerminalId);
    wired.add(w.toTerminalId);
  }

  let loose = 0;
  for (const comp of Object.values(circuit.components)) {
    if (comp.type === 'ground') continue;
    const connected = comp.terminalIds.some((tid) => wired.has(tid));
    if (!connected) loose++;
  }
  return loose;
}

function countElectricalNodes(circuit: CircuitState): Set<number> {
  const nodes = new Set<number>();
  for (const term of Object.values(circuit.terminals)) {
    const n = getElectricalNodeForTerminal(circuit, term.id);
    if (n !== null) nodes.add(n);
  }
  return nodes;
}

function sumStoredEnergy(
  circuit: CircuitState,
  simResults: SimResults | null | undefined,
): { cap: number; ind: number } {
  if (!simResults?.status.success) return { cap: 0, ind: 0 };

  let cap = 0;
  let ind = 0;

  for (const comp of Object.values(circuit.components)) {
    const r = getComponentReadings(circuit, simResults, comp);
    if (!r) continue;

    if (comp.type === 'capacitor') {
      const C = comp.params.capacitance ?? 1e-6;
      cap += 0.5 * C * r.voltage * r.voltage;
    }
    if (comp.type === 'inductor') {
      const L = comp.params.inductance ?? 1e-3;
      ind += 0.5 * L * r.current * r.current;
    }
  }

  return { cap, ind };
}

export function computeCircuitStats(
  circuit: CircuitState,
  probeCount: number,
  simResults?: SimResults | null,
): CircuitStats {
  const components = Object.keys(circuit.components).length;
  const wires = Object.keys(circuit.wires).length;
  const terminals = Object.keys(circuit.terminals).length;
  const nodeSet = countElectricalNodes(circuit);
  const electricalNodes = nodeSet.size;
  const mnaNodes = [...nodeSet].filter((n) => n !== 0).length;

  const byType: Partial<Record<ComponentType, number>> = {};
  for (const comp of Object.values(circuit.components)) {
    byType[comp.type] = (byType[comp.type] ?? 0) + 1;
  }

  const hasGround = (byType.ground ?? 0) > 0;
  const branches = simResults?.status.success
    ? Object.keys(simResults.branchCurrents).length
    : Math.max(0, components - (byType.ground ?? 0));

  const { cap, ind } = sumStoredEnergy(circuit, simResults);

  return {
    components,
    wires,
    terminals,
    probes: probeCount,
    electricalNodes,
    mnaNodes,
    branches,
    looseComponents: countLooseComponents(circuit),
    hasGround,
    byType,
    capEnergyJ: cap,
    indEnergyJ: ind,
    totalStoredEnergyJ: cap + ind,
  };
}

export function formatEnergyJ(j: number): string {
  if (j < 1e-9) return '≈ 0 J';
  if (j < 1e-6) return `${(j * 1e9).toFixed(1)} nJ`;
  if (j < 1e-3) return `${(j * 1e6).toFixed(2)} µJ`;
  if (j < 1) return `${(j * 1e3).toFixed(2)} mJ`;
  return `${j.toFixed(3)} J`;
}

export function typeLabel(type: ComponentType): string {
  return COMPONENT_TEMPLATES[type]?.label ?? type;
}
