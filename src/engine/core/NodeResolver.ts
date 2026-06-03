import type { EngineCircuit, ResolvedTopology } from '../types';
import { GROUND_NODE_ID } from '../types';
import { UnionFind } from '../graph/UnionFind';
import { getNumericConnectedComponents } from '../graph/Traversal';

/**
 * NodeResolver — merges terminals via Union-Find and produces MNA index maps.
 */
export class NodeResolver {
  private uf = new UnionFind();

  resolve(circuit: EngineCircuit): ResolvedTopology {
    this.uf.reset();

    for (const t of Object.values(circuit.terminals)) {
      this.uf.makeSet(t.nodeId);
    }

    for (const wire of Object.values(circuit.wires)) {
      const from = circuit.terminals[wire.fromTerminalId];
      const to = circuit.terminals[wire.toTerminalId];
      if (from && to) this.uf.union(from.nodeId, to.nodeId);
    }

    // Note: component terminals are NOT merged in UF — only wires define equipotential nodes.

    const nodeMap = new Map<number, number>();
    const terminalNode = new Map<string, number>();

    // Ground assignment
    this.uf.makeSet(GROUND_NODE_ID);
    for (const comp of Object.values(circuit.components)) {
      if (comp.type !== 'ground') continue;
      const gt = circuit.terminals[comp.terminalIds[0]];
      if (!gt) continue;
      const root = this.uf.find(gt.nodeId);
      const groups = this.uf.getComponents();
      for (const [, members] of groups) {
        if (members.includes(gt.nodeId) || members.includes(root)) {
          for (const m of members) nodeMap.set(m, GROUND_NODE_ID);
        }
      }
      nodeMap.set(gt.nodeId, GROUND_NODE_ID);
    }

    for (const t of Object.values(circuit.terminals)) {
      const resolved = nodeMap.get(t.nodeId) ?? this.uf.find(t.nodeId);
      nodeMap.set(t.nodeId, resolved);
    }

    for (const [tid, t] of Object.entries(circuit.terminals)) {
      terminalNode.set(tid, nodeMap.get(t.nodeId) ?? this.uf.find(t.nodeId));
    }

    const adjacencyList = new Map<number, Set<number>>();
    const allNodes = new Set<number>(terminalNode.values());
    for (const n of allNodes) adjacencyList.set(n, new Set());

    for (const comp of Object.values(circuit.components)) {
      const nodes = comp.terminalIds
        .map((tid) => terminalNode.get(tid))
        .filter((n): n is number => n !== undefined);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!;
          const b = nodes[j]!;
          adjacencyList.get(a)?.add(b);
          adjacencyList.get(b)?.add(a);
        }
      }
    }

    const nonGroundNodes = [...allNodes].filter((n) => n !== GROUND_NODE_ID).sort((a, b) => a - b);
    const nodeIndex = new Map<number, number>();
    for (let i = 0; i < nonGroundNodes.length; i++) {
      nodeIndex.set(nonGroundNodes[i]!, i);
    }

    return {
      nodeMap,
      terminalNode,
      nonGroundNodes,
      nodeIndex,
      connectedComponents: getNumericConnectedComponents(adjacencyList),
      adjacencyList,
    };
  }
}

/** Map component id → (posNode, negNode) electrical node pair */
export function getComponentTerminals(
  circuit: EngineCircuit,
  terminalNode: Map<string, number>,
): Map<string, [number, number]> {
  const result = new Map<string, [number, number]>();
  for (const comp of Object.values(circuit.components)) {
    const [t0, t1] = comp.terminalIds;
    const n0 = terminalNode.get(t0);
    const n1 = terminalNode.get(t1);
    if (n0 !== undefined && n1 !== undefined) {
      result.set(comp.id, [n0, n1]);
    }
  }
  return result;
}
