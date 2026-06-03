import { Matrix, Vector } from '../math/Matrix';
import type { StampContext } from '../elements/BaseElement';
import type { BaseElement } from '../elements/BaseElement';
import type { ElementState, EngineCircuit, ResolvedTopology } from '../types';
import { GROUND_NODE_ID } from '../types';
import { getComponentTerminals } from '../core/NodeResolver';

export interface MatrixSystem {
  A: Matrix;
  b: Vector;
  ctx: StampContext;
}

/**
 * MatrixBuilder — constructs MNA matrix A and vector b via element stamping.
 */
export class MatrixBuilder {
  build(
    circuit: EngineCircuit,
    topology: ResolvedTopology,
    elements: Map<string, BaseElement>,
    state: ElementState,
    dt: number,
    time: number,
  ): MatrixSystem {
    const componentNodes = getComponentTerminals(circuit, topology.terminalNode);
    const numNodeVars = topology.nonGroundNodes.length;

    const voltageSourceVarIndex = new Map<string, number>();
    const inductorVarIndex = new Map<string, number>();
    const vsList: string[] = [];
    const indList: string[] = [];

    for (const comp of Object.values(circuit.components)) {
      if (comp.type === 'ground' || comp.type === 'voltmeter' || comp.type === 'ammeter') continue;
      if (comp.type === 'voltageSource') vsList.push(comp.id);
      if (comp.type === 'switch' && (comp.params.isClosed ?? 0) >= 0.5) {
        // Closed switch uses conductance stamp, not extra var
      } else if (comp.type === 'inductor') indList.push(comp.id);
    }

    let varOffset = numNodeVars;
    for (const id of vsList) {
      voltageSourceVarIndex.set(id, varOffset++);
    }
    for (const id of indList) {
      inductorVarIndex.set(id, varOffset++);
    }

    const totalVars = varOffset;
    const A = Matrix.zeros(totalVars, totalVars);
    const b = Vector.zeros(totalVars);

    const ctx: StampContext = {
      A,
      b: b.data,
      topology,
      componentNodes,
      dt,
      time,
      state,
      voltageSourceVarIndex,
      inductorVarIndex,
      numNodeVars,
      totalVars,
    };

    for (const comp of Object.values(circuit.components)) {
      if (comp.type === 'ground') continue;
      const element = elements.get(comp.type);
      if (!element) continue;
      element.stamp(ctx, comp);
    }

    // Pin ground node if present in index map (reference)
    if (topology.nodeIndex.has(GROUND_NODE_ID)) {
      const gRow = topology.nodeIndex.get(GROUND_NODE_ID)!;
      for (let c = 0; c < totalVars; c++) A.set(gRow, c, 0);
      A.set(gRow, gRow, 1);
      b.set(gRow, 0);
    }

    return { A, b, ctx };
  }
}
