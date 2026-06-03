import type { Matrix } from '../math/Matrix';
import type { ElementState, EngineComponent, ResolvedTopology } from '../types';

export interface StampContext {
  A: Matrix;
  b: Float64Array;
  topology: ResolvedTopology;
  /** Maps component id → [nodePos, nodeNeg] */
  componentNodes: Map<string, [number, number]>;
  dt: number;
  time: number;
  state: ElementState;
  /** Extra MNA variables: voltage source currents, inductor currents */
  voltageSourceVarIndex: Map<string, number>;
  inductorVarIndex: Map<string, number>;
  numNodeVars: number;
  totalVars: number;
  /** Latest solution for post-processing */
  solution?: Float64Array;
  nodeVoltages?: Map<number, number>;
}

export abstract class BaseElement {
  abstract readonly type: string;

  abstract stamp(ctx: StampContext, component: EngineComponent): void;

  calculateCurrent(
    ctx: StampContext,
    component: EngineComponent,
    nodeVoltages: Map<number, number>,
  ): number {
    const nodes = ctx.componentNodes.get(component.id);
    if (!nodes) return 0;
    const [p, n] = nodes;
    const vp = nodeVoltages.get(p) ?? 0;
    const vn = nodeVoltages.get(n) ?? 0;
    return this.calculateCurrentFromVoltage(vp - vn, ctx, component);
  }

  protected calculateCurrentFromVoltage(
    _voltage: number,
    _ctx: StampContext,
    _component: EngineComponent,
  ): number {
    return 0;
  }

  calculateVoltage(
    _ctx: StampContext,
    component: EngineComponent,
    nodeVoltages: Map<number, number>,
  ): number {
    const nodes = _ctx.componentNodes.get(component.id);
    if (!nodes) return 0;
    const [p, n] = nodes;
    return (nodeVoltages.get(p) ?? 0) - (nodeVoltages.get(n) ?? 0);
  }

  abstract validate(component: EngineComponent): string[];

  serialize(component: EngineComponent): Record<string, unknown> {
    return {
      id: component.id,
      type: component.type,
      label: component.label,
      params: { ...component.params },
      terminalIds: [...component.terminalIds],
    };
  }

  deserialize(data: Record<string, unknown>): EngineComponent {
    return {
      id: String(data.id),
      type: data.type as EngineComponent['type'],
      label: String(data.label ?? ''),
      params: (data.params as Record<string, number>) ?? {},
      terminalIds: data.terminalIds as [string, string],
    };
  }

  /** Stamp conductance G between two nodes (MNA nodal stamp) */
  protected stampConductance(
    ctx: StampContext,
    nodeP: number,
    nodeN: number,
    G: number,
  ): void {
    const { nodeIndex } = ctx.topology;
    for (const [nid, sign] of [
      [nodeP, 1] as const,
      [nodeN, -1] as const,
    ]) {
      if (nid === 0) continue;
      const i = nodeIndex.get(nid);
      if (i === undefined) continue;
      ctx.A.add(i, i, G);
      const other = sign === 1 ? nodeN : nodeP;
      if (other !== 0) {
        const j = nodeIndex.get(other);
        if (j !== undefined) ctx.A.add(i, j, -G);
      }
    }
  }

  /** Stamp current into nodal RHS */
  protected stampCurrentSource(
    ctx: StampContext,
    nodeP: number,
    nodeN: number,
    current: number,
  ): void {
    const { nodeIndex } = ctx.topology;
    for (const [nid, sign] of [
      [nodeP, -1] as const,
      [nodeN, 1] as const,
    ]) {
      if (nid === 0) continue;
      const i = nodeIndex.get(nid);
      if (i !== undefined) ctx.b[i]! += sign * current;
    }
  }

  protected getNodes(ctx: StampContext, component: EngineComponent): [number, number] | null {
    return ctx.componentNodes.get(component.id) ?? null;
  }
}
