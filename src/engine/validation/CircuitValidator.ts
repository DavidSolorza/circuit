import type { EngineCircuit, EngineValidationResult } from '../types';
import { GROUND_NODE_ID } from '../types';
import { CircuitGraph } from '../core/CircuitGraph';
import { bfsOnNumbers } from '../graph/Traversal';

/**
 * CircuitValidator — pre-simulation structural and electrical checks.
 */
export class CircuitValidator {
  validate(circuit: EngineCircuit, graph: CircuitGraph): EngineValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const comps = circuit.components;
    const wires = circuit.wires;

    if (Object.keys(comps).length === 0) {
      errors.push('El circuito no tiene componentes.');
      return { valid: false, errors, warnings };
    }

    // Ground check
    const groundComps = Object.values(comps).filter((c) => c.type === 'ground');
    if (groundComps.length === 0) {
      errors.push('El circuito debe incluir un componente de tierra (GND).');
    }
    if (groundComps.length > 1) {
      errors.push('Múltiples tierras incompatibles: solo debe haber una referencia GND principal.');
    }

    const snapshot = graph.buildFromCircuit(circuit);
    const { terminalNode, numericAdjacency } = snapshot;

    // Duplicate wires
    const wirePairs = new Set<string>();
    for (const w of Object.values(wires)) {
      const pair = [w.fromTerminalId, w.toTerminalId].sort().join('|');
      if (wirePairs.has(pair)) {
        errors.push(`Cable duplicado entre terminales ${w.fromTerminalId} y ${w.toTerminalId}.`);
      }
      wirePairs.add(pair);
    }

    // Duplicate component ids (structural)
    const ids = new Set<string>();
    for (const comp of Object.values(comps)) {
      if (ids.has(comp.id)) {
        errors.push(`Componente duplicado con id '${comp.id}'.`);
      }
      ids.add(comp.id);
    }

    // Open circuits / dangling terminals
    warnings.push(...graph.detectOpenCircuits(circuit));

    // Short circuits
    errors.push(...graph.detectShortCircuits(circuit));

    // Floating nodes (numeric components without ground)
    for (const component of snapshot.numericComponents) {
      if (!component.includes(GROUND_NODE_ID) && groundComps.length > 0) {
        const hasSource = this.componentTouchesNodes(circuit, component, terminalNode);
        if (hasSource) {
          errors.push(
            `Nodo flotante: subcircuito [${component.join(', ')}] no conectado a tierra.`,
          );
        }
      }
    }

    // Connectivity to ground via BFS
    if (groundComps.length > 0) {
      const groundTerm = circuit.terminals[groundComps[0]!.terminalIds[0]];
      if (groundTerm) {
        const groundNode = terminalNode.get(groundTerm.id) ?? GROUND_NODE_ID;
        const visited = new Set(bfsOnNumbers(groundNode, numericAdjacency));

        for (const comp of Object.values(comps)) {
          if (comp.type === 'ground') continue;
          const nodes = comp.terminalIds
            .map((tid) => terminalNode.get(tid))
            .filter((n): n is number => n !== undefined);
          const reachesGround = nodes.some((n) => visited.has(n));
          if (!reachesGround) {
            errors.push(`Componente '${comp.label || comp.id}' no tiene retorno a tierra.`);
          }
        }
      }
    }

    // Isolated components (graph-level)
    const isolated = graph.getIsolatedComponents();
    if (isolated.length > 0) {
      warnings.push(`${isolated.length} terminal(es) aislado(s) detectado(s).`);
    }

    // Per-element validation
    for (const comp of Object.values(comps)) {
      // Element validation delegated via registry in engine — basic checks here
      if (comp.type === 'resistor' && (comp.params.resistance ?? 0) <= 0) {
        errors.push(`Resistencia '${comp.label}' inválida (R <= 0).`);
      }
      if (comp.type === 'capacitor' && (comp.params.capacitance ?? 0) <= 0) {
        errors.push(`Capacitor '${comp.label}' inválido (C <= 0).`);
      }
      if (comp.type === 'inductor' && (comp.params.inductance ?? 0) <= 0) {
        errors.push(`Inductor '${comp.label}' inválido (L <= 0).`);
      }
    }

    // Sources without return (voltage/current source not in ground-connected component)
    for (const comp of Object.values(comps)) {
      if (comp.type !== 'voltageSource' && comp.type !== 'currentSource') continue;
      const [t0, t1] = comp.terminalIds;
      const n0 = terminalNode.get(t0);
      const n1 = terminalNode.get(t1);
      if (n0 === undefined || n1 === undefined) {
        errors.push(`Fuente '${comp.label}' tiene terminales sin resolver.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private componentTouchesNodes(
    circuit: EngineCircuit,
    nodes: number[],
    terminalNode: Map<string, number>,
  ): boolean {
    const nodeSet = new Set(nodes);
    for (const comp of Object.values(circuit.components)) {
      if (comp.type === 'voltageSource' || comp.type === 'currentSource') {
        for (const tid of comp.terminalIds) {
          const n = terminalNode.get(tid);
          if (n !== undefined && nodeSet.has(n)) return true;
        }
      }
    }
    return false;
  }
}

export const circuitValidator = new CircuitValidator();
