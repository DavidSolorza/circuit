import type { CircuitState } from '../types';

/** Componentes conectados por cable al componente dado (incluye el propio id). */
export function getWireNeighborComponentIds(
  circuit: CircuitState,
  componentId: string,
): string[] {
  const comp = circuit.components[componentId];
  if (!comp) return [componentId];

  const termSet = new Set(comp.terminalIds);
  const neighbors = new Set<string>([componentId]);

  for (const wire of Object.values(circuit.wires)) {
    const touchesFrom = termSet.has(wire.fromTerminalId);
    const touchesTo = termSet.has(wire.toTerminalId);
    if (!touchesFrom && !touchesTo) continue;

    const otherTermId = touchesFrom ? wire.toTerminalId : wire.fromTerminalId;
    const otherTerm = circuit.terminals[otherTermId];
    if (otherTerm) neighbors.add(otherTerm.componentId);
  }

  return [...neighbors];
}
