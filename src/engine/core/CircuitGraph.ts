import type { EngineCircuit } from '../types';
import { GROUND_NODE_ID } from '../types';
import { UnionFind } from '../graph/UnionFind';
import {
  createGraphEdge,
  createGraphNode,
  type GraphEdge,
  type GraphNode,
} from '../graph/GraphTypes';
import {
  detectCycleUndirected,
  findPath,
  getConnectedComponents,
  getNumericConnectedComponents,
} from '../graph/Traversal';

export interface CircuitGraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Map<string, string[]>;
  numericAdjacency: Map<number, Set<number>>;
  connectedComponents: string[][];
  numericComponents: number[][];
  nodeMap: Map<number, number>;
  terminalNode: Map<string, number>;
  nonGroundNodes: number[];
  nodeIndex: Map<number, number>;
}

/**
 * CircuitGraph — topological representation of the circuit as an undirected graph.
 * Terminals are vertices; wires and elements are edges.
 */
export class CircuitGraph {
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, GraphEdge>();
  private adjacencyList = new Map<string, string[]>();
  private numericAdjacency = new Map<number, Set<number>>();
  private connectedComponents: string[][] = [];
  private numericComponents: number[][] = [];
  private nodeMap = new Map<number, number>();
  private terminalNode = new Map<string, number>();
  private nonGroundNodes: number[] = [];
  private nodeIndex = new Map<number, number>();
  private dirty = true;
  private lastCircuit: EngineCircuit | null = null;

  /** Rebuild graph only when topology changes */
  markDirty(): void {
    this.dirty = true;
  }

  isDirty(): boolean {
    return this.dirty;
  }

  buildFromCircuit(circuit: EngineCircuit, force = false): CircuitGraphSnapshot {
    if (!force && !this.dirty && this.lastCircuit === circuit) {
      return this.snapshot();
    }

    this.nodes.clear();
    this.edges.clear();
    this.adjacencyList.clear();
    this.numericAdjacency.clear();
    this.nodeMap.clear();
    this.terminalNode.clear();

    // 1. Create node per terminal
    for (const [tid, terminal] of Object.entries(circuit.terminals)) {
      const nodeId = `term:${tid}`;
      this.nodes.set(
        nodeId,
        createGraphNode(nodeId, terminal.nodeId, {
          terminalId: tid,
          componentId: terminal.componentId,
        }),
      );
      this.adjacencyList.set(nodeId, []);
    }

    // 2. Wire edges + Union-Find merge
    const uf = new UnionFind();
    for (const t of Object.values(circuit.terminals)) {
      uf.makeSet(t.nodeId);
    }

    for (const wire of Object.values(circuit.wires)) {
      const from = circuit.terminals[wire.fromTerminalId];
      const to = circuit.terminals[wire.toTerminalId];
      if (!from || !to) continue;

      uf.union(from.nodeId, to.nodeId);

      const edge = createGraphEdge(
        wire.id,
        `term:${wire.fromTerminalId}`,
        `term:${wire.toTerminalId}`,
        'wire',
      );
      this.edges.set(wire.id, edge);
      this.addAdjacency(edge.nodeAId, edge.nodeBId);
    }

    // 3. Element edges (connect terminals of same component — graph only, no UF merge)
    for (const comp of Object.values(circuit.components)) {
      const [tA, tB] = comp.terminalIds;
      const nodeA = `term:${tA}`;
      const nodeB = `term:${tB}`;
      if (!this.nodes.has(nodeA) || !this.nodes.has(nodeB)) continue;

      const edgeId = `elem:${comp.id}`;
      const edge = createGraphEdge(edgeId, nodeA, nodeB, 'element', {
        elementId: comp.id,
        elementType: comp.type,
      });
      this.edges.set(edgeId, edge);
      this.addAdjacency(nodeA, nodeB);
    }

    // 4. Ground: force terminal nodes in the same UF component as ground to GROUND_NODE_ID
    for (const comp of Object.values(circuit.components)) {
      if (comp.type !== 'ground') continue;
      const groundTerm = circuit.terminals[comp.terminalIds[0]];
      if (!groundTerm) continue;
      uf.makeSet(GROUND_NODE_ID);
      const root = uf.find(groundTerm.nodeId);
      const components = uf.getComponents();
      const groundComponent = [...components.entries()].find(
        ([, members]) => members.includes(groundTerm.nodeId) || members.includes(root),
      )?.[1];
      if (groundComponent) {
        for (const m of groundComponent) {
          this.nodeMap.set(m, GROUND_NODE_ID);
        }
      }
    }

    // 5. Resolve all nodes via Union-Find (nodeMap overrides ground)
    for (const t of Object.values(circuit.terminals)) {
      const mapped = this.nodeMap.get(t.nodeId);
      const canonical = mapped !== undefined ? mapped : uf.find(t.nodeId);
      this.nodeMap.set(t.nodeId, canonical);
    }

    for (const [tid, t] of Object.entries(circuit.terminals)) {
      const resolved = this.nodeMap.get(t.nodeId)!;
      this.terminalNode.set(tid, resolved);
      const gn = this.nodes.get(`term:${tid}`);
      if (gn) gn.electricalNodeId = resolved;
    }

    // 6. Build numeric adjacency (electrical nodes connected by components)
    const compNodeSets = new Map<string, Set<number>>();
    for (const comp of Object.values(circuit.components)) {
      const nodes = new Set<number>();
      for (const tid of comp.terminalIds) {
        const n = this.terminalNode.get(tid);
        if (n !== undefined) nodes.add(n);
      }
      compNodeSets.set(comp.id, nodes);
    }

    const allElectricalNodes = new Set<number>();
    for (const n of this.terminalNode.values()) allElectricalNodes.add(n);

    for (const n of allElectricalNodes) {
      this.numericAdjacency.set(n, new Set());
    }

    for (const nodes of compNodeSets.values()) {
      const list = [...nodes];
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]!;
          const b = list[j]!;
          this.numericAdjacency.get(a)?.add(b);
          this.numericAdjacency.get(b)?.add(a);
        }
      }
    }

    // 7. Reindex non-ground nodes for MNA
    this.nonGroundNodes = [...allElectricalNodes]
      .filter((n) => n !== GROUND_NODE_ID)
      .sort((a, b) => a - b);

    this.nodeIndex.clear();
    for (let i = 0; i < this.nonGroundNodes.length; i++) {
      this.nodeIndex.set(this.nonGroundNodes[i]!, i);
    }

    this.connectedComponents = getConnectedComponents(this.adjacencyList);
    this.numericComponents = getNumericConnectedComponents(this.numericAdjacency);

    this.dirty = false;
    this.lastCircuit = circuit;

    return this.snapshot();
  }

  private addAdjacency(a: string, b: string): void {
    const listA = this.adjacencyList.get(a) ?? [];
    const listB = this.adjacencyList.get(b) ?? [];
    if (!listA.includes(b)) listA.push(b);
    if (!listB.includes(a)) listB.push(a);
    this.adjacencyList.set(a, listA);
    this.adjacencyList.set(b, listB);
  }

  findPath(fromTerminalId: string, toTerminalId: string): string[] | null {
    return findPath(`term:${fromTerminalId}`, `term:${toTerminalId}`, this.adjacencyList);
  }

  detectCycles(): boolean {
    return detectCycleUndirected(this.adjacencyList);
  }

  getIsolatedComponents(): string[][] {
    return this.connectedComponents.filter((c) => c.length === 1);
  }

  /** Voltage source or wire shorting same electrical node */
  detectShortCircuits(circuit: EngineCircuit): string[] {
    const errors: string[] = [];
    for (const comp of Object.values(circuit.components)) {
      if (comp.type !== 'voltageSource' && comp.type !== 'switch') continue;
      const [t0, t1] = comp.terminalIds;
      const n0 = this.terminalNode.get(t0);
      const n1 = this.terminalNode.get(t1);
      if (n0 !== undefined && n1 !== undefined && n0 === n1) {
        if (comp.type === 'voltageSource' && (comp.params.voltage ?? 0) !== 0) {
          errors.push(
            `Cortocircuito: fuente de voltaje '${comp.label || comp.id}' tiene ambos terminales en el mismo nodo.`,
          );
        }
        if (comp.type === 'switch' && (comp.params.isClosed ?? 0) >= 0.5) {
          errors.push(
            `Cortocircuito potencial: interruptor '${comp.label || comp.id}' con terminales en el mismo nodo.`,
          );
        }
      }
    }
    return errors;
  }

  detectOpenCircuits(circuit: EngineCircuit): string[] {
    const warnings: string[] = [];
    const wiredTerminals = new Set<string>();
    for (const w of Object.values(circuit.wires)) {
      wiredTerminals.add(w.fromTerminalId);
      wiredTerminals.add(w.toTerminalId);
    }

    for (const comp of Object.values(circuit.components)) {
      for (const tid of comp.terminalIds) {
        if (!wiredTerminals.has(tid) && comp.type !== 'ground') {
          warnings.push(
            `Circuito abierto: terminal desconectado en '${comp.label || comp.id}'.`,
          );
        }
      }
    }
    return warnings;
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  snapshot(): CircuitGraphSnapshot {
    return {
      nodes: [...this.nodes.values()],
      edges: [...this.edges.values()],
      adjacencyList: new Map(this.adjacencyList),
      numericAdjacency: new Map(
        [...this.numericAdjacency.entries()].map(([k, v]) => [k, new Set(v)]),
      ),
      connectedComponents: this.connectedComponents.map((c) => [...c]),
      numericComponents: this.numericComponents.map((c) => [...c]),
      nodeMap: new Map(this.nodeMap),
      terminalNode: new Map(this.terminalNode),
      nonGroundNodes: [...this.nonGroundNodes],
      nodeIndex: new Map(this.nodeIndex),
    };
  }
}
