import { zeros, lusolve } from 'mathjs';
import type { CircuitState, SimResults } from './types';
import { DT } from './constants';

export class MnaSolver {
  private capPrevV: Map<string, number> = new Map();
  private indPrevI: Map<string, number> = new Map();
  private simTime = 0;

  reset(): void {
    this.capPrevV.clear();
    this.indPrevI.clear();
    this.simTime = 0;
  }

  solve(circuit: CircuitState, dt: number = DT): SimResults {
    const { components, terminals } = circuit;
    const nodeSet = new Set<number>();
    for (const t of Object.values(terminals)) {
      nodeSet.add(t.nodeId);
    }

    const nonGroundNodes = new Set<number>();
    for (const n of nodeSet) {
      if (n !== 0) nonGroundNodes.add(n);
    }
    const nodeList = [...nonGroundNodes].sort((a, b) => a - b);
    const nodeIndex = new Map<number, number>();
    nodeList.forEach((n, i) => nodeIndex.set(n, i));

    interface VsEntry {
      compId: string;
      posNode: number;
      negNode: number;
      voltage: number;
    }
    const voltageSources: VsEntry[] = [];

    const inductorCurrents: Array<{
      compId: string;
      posNode: number;
      negNode: number;
      inductance: number;
    }> = [];

    let extraVars = 0;

    for (const comp of Object.values(components)) {
      if (comp.type === 'voltageSource') {
        const t0 = terminals[comp.terminalIds[0]];
        const t1 = terminals[comp.terminalIds[1]];
        voltageSources.push({
          compId: comp.id,
          posNode: t0.nodeId,
          negNode: t1.nodeId,
          voltage: comp.params.voltage ?? 9,
        });
        extraVars++;
      }
      if (comp.type === 'led') {
        const t0 = terminals[comp.terminalIds[0]];
        const t1 = terminals[comp.terminalIds[1]];
        voltageSources.push({
          compId: comp.id,
          posNode: t0.nodeId,
          negNode: t1.nodeId,
          voltage: comp.params.forwardVoltage ?? 2.0,
        });
        extraVars++;
      }
      if (comp.type === 'switch' && comp.params.isClosed) {
        const t0 = terminals[comp.terminalIds[0]];
        const t1 = terminals[comp.terminalIds[1]];
        voltageSources.push({
          compId: comp.id,
          posNode: t0.nodeId,
          negNode: t1.nodeId,
          voltage: 0,
        });
        extraVars++;
      }
      if (comp.type === 'inductor') {
        const t0 = terminals[comp.terminalIds[0]];
        const t1 = terminals[comp.terminalIds[1]];
        inductorCurrents.push({
          compId: comp.id,
          posNode: t0.nodeId,
          negNode: t1.nodeId,
          inductance: comp.params.inductance ?? 1e-3,
        });
        extraVars++;
      }
    }

    const nVars = nodeList.length + extraVars;
    if (nVars === 0) {
      this.simTime += dt;
      return {
        nodeVoltages: { 0: 0 },
        branchCurrents: {},
        timestep: dt,
        time: this.simTime,
      };
    }

    const A = zeros([nVars, nVars]) as any;
    const B = zeros([nVars, 1]) as any;

    for (const comp of Object.values(components)) {
      const t0 = terminals[comp.terminalIds[0]];
      const t1 = terminals[comp.terminalIds[1]];

      switch (comp.type) {
        case 'resistor': {
          const R = comp.params.resistance ?? 1000;
          if (R <= 0) continue;
          this.stampG(A, t0.nodeId, t1.nodeId, 1 / R, nodeIndex);
          break;
        }
        case 'capacitor': {
          const C = comp.params.capacitance ?? 1e-6;
          const G_eq = C / dt;
          const key = comp.id;
          const vPrev = this.capPrevV.get(key) ?? 0;
          const I_hist = C * vPrev / dt;
          this.stampG(A, t0.nodeId, t1.nodeId, G_eq, nodeIndex);
          this.stampI(B, t0.nodeId, t1.nodeId, I_hist, nodeIndex);
          break;
        }
        case 'currentSource': {
          const I_src = comp.params.current ?? 0.01;
          this.stampI(B, t0.nodeId, t1.nodeId, I_src, nodeIndex);
          break;
        }
      }
    }

    let varOffset = nodeList.length;

    for (let i = 0; i < voltageSources.length; i++) {
      const vs = voltageSources[i];
      const col = varOffset + i;
      const pIdx = nodeIndex.get(vs.posNode);
      const nIdx = nodeIndex.get(vs.negNode);

      if (pIdx !== undefined) {
        A.set([pIdx, col], A.get([pIdx, col]) + 1);
        A.set([col, pIdx], A.get([col, pIdx]) + 1);
      }
      if (nIdx !== undefined) {
        A.set([nIdx, col], A.get([nIdx, col]) - 1);
        A.set([col, nIdx], A.get([col, nIdx]) - 1);
      }
      B.set([col, 0], vs.voltage);
    }

    for (let i = 0; i < inductorCurrents.length; i++) {
      const ind = inductorCurrents[i];
      const col = varOffset + voltageSources.length + i;

      const L = ind.inductance;
      const R_eq = L / dt;
      const key = ind.compId;
      const iPrev = this.indPrevI.get(key) ?? 0;
      const V_eq = R_eq * iPrev;

      const pIdx = nodeIndex.get(ind.posNode);
      const nIdx = nodeIndex.get(ind.negNode);

      if (pIdx !== undefined) {
        A.set([pIdx, col], A.get([pIdx, col]) + 1);
        A.set([col, pIdx], A.get([col, pIdx]) + 1);
      }
      if (nIdx !== undefined) {
        A.set([nIdx, col], A.get([nIdx, col]) - 1);
        A.set([col, nIdx], A.get([col, nIdx]) - 1);
      }
      A.set([col, col], A.get([col, col]) - R_eq);
      B.set([col, 0], -V_eq);
    }

    let x: number[];
    try {
      const result = lusolve(A as any, B as any);
      const arr = (result as any).toArray() as number[][];
      x = arr.map((row: number[]) => row[0]);
    } catch {
      this.simTime += dt;
      return {
        nodeVoltages: { 0: 0 },
        branchCurrents: {},
        timestep: dt,
        time: this.simTime,
      };
    }

    this.simTime += dt;

    const nodeVoltages: Record<number, number> = { 0: 0 };
    nodeList.forEach((n, i) => {
      nodeVoltages[n] = x[i];
    });

    const branchCurrents: Record<string, number> = {};

    for (const comp of Object.values(components)) {
      const t0 = terminals[comp.terminalIds[0]];
      const t1 = terminals[comp.terminalIds[1]];
      const v0 = nodeVoltages[t0.nodeId] ?? 0;
      const v1 = nodeVoltages[t1.nodeId] ?? 0;

      switch (comp.type) {
        case 'resistor': {
          const R = comp.params.resistance ?? 1000;
          branchCurrents[comp.id] = (v0 - v1) / R;
          break;
        }
        case 'capacitor': {
          const C = comp.params.capacitance ?? 1e-6;
          const vDiff = v0 - v1;
          const vPrev = this.capPrevV.get(comp.id) ?? 0;
          branchCurrents[comp.id] = C * (vDiff - vPrev) / dt;
          this.capPrevV.set(comp.id, vDiff);
          break;
        }
        case 'inductor': {
          const iIdx = voltageSources.length + inductorCurrents.findIndex(ind => ind.compId === comp.id);
          const iL = x[nodeList.length + iIdx];
          branchCurrents[comp.id] = iL;
          this.indPrevI.set(comp.id, iL);
          break;
        }
        case 'voltageSource': {
          const vsIdx = voltageSources.findIndex(vs => vs.compId === comp.id);
          if (vsIdx >= 0) {
            branchCurrents[comp.id] = x[nodeList.length + vsIdx];
          }
          break;
        }
        case 'currentSource': {
          branchCurrents[comp.id] = comp.params.current ?? 0.01;
          break;
        }
        case 'led': {
          const vsIdx = voltageSources.findIndex(vs => vs.compId === comp.id);
          if (vsIdx >= 0) {
            branchCurrents[comp.id] = x[nodeList.length + vsIdx];
          }
          break;
        }
        case 'switch': {
          const vsIdx = voltageSources.findIndex(vs => vs.compId === comp.id);
          if (vsIdx >= 0) {
            branchCurrents[comp.id] = x[nodeList.length + vsIdx];
          } else {
            branchCurrents[comp.id] = 0;
          }
          break;
        }
        case 'ground': {
          branchCurrents[comp.id] = 0;
          break;
        }
      }
    }

    return {
      nodeVoltages,
      branchCurrents,
      timestep: dt,
      time: this.simTime,
    };
  }

  private stampG(A: any, nI: number, nJ: number, G: number, idx: Map<number, number>): void {
    const i = idx.get(nI);
    const j = idx.get(nJ);
    if (i !== undefined) A.set([i, i], A.get([i, i]) + G);
    if (j !== undefined) A.set([j, j], A.get([j, j]) + G);
    if (i !== undefined && j !== undefined) {
      A.set([i, j], A.get([i, j]) - G);
      A.set([j, i], A.get([j, i]) - G);
    }
  }

  private stampI(B: any, nI: number, nJ: number, I: number, idx: Map<number, number>): void {
    const i = idx.get(nI);
    const j = idx.get(nJ);
    if (i !== undefined) B.set([i, 0], B.get([i, 0]) - I);
    if (j !== undefined) B.set([j, 0], B.get([j, 0]) + I);
  }
}
