import { BaseElement } from './BaseElement';
import type { StampContext } from './BaseElement';
import type { EngineComponent } from '../types';

export class ResistorElement extends BaseElement {
  readonly type = 'resistor';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    const R = component.params.resistance ?? 1000;
    if (R <= 0) return;
    this.stampConductance(ctx, nodes[0], nodes[1], 1 / R);
  }

  protected calculateCurrentFromVoltage(voltage: number, _ctx: StampContext, component: EngineComponent): number {
    const R = component.params.resistance ?? 1000;
    if (R <= 0) return 0;
    return voltage / R;
  }

  validate(component: EngineComponent): string[] {
    const R = component.params.resistance ?? 0;
    if (R <= 0) return [`Resistencia '${component.label}' debe ser > 0.`];
    return [];
  }
}

export class CapacitorElement extends BaseElement {
  readonly type = 'capacitor';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    const C = component.params.capacitance ?? 1e-6;
    if (C <= 0 || ctx.dt <= 0) return;

    const Geq = C / ctx.dt;
    const vPrev = ctx.state.vc.get(component.id) ?? 0;
    const Ihist = Geq * vPrev;

    this.stampConductance(ctx, nodes[0], nodes[1], Geq);

    const { nodeIndex } = ctx.topology;
    for (const [nid, sign] of [
      [nodes[0], 1] as const,
      [nodes[1], -1] as const,
    ]) {
      if (nid === 0) continue;
      const i = nodeIndex.get(nid);
      if (i !== undefined) ctx.b[i]! -= sign * Ihist;
    }
  }

  protected calculateCurrentFromVoltage(
    voltage: number,
    ctx: StampContext,
    component: EngineComponent,
  ): number {
    const C = component.params.capacitance ?? 1e-6;
    const vPrev = ctx.state.vc.get(component.id) ?? 0;
    if (ctx.dt <= 0) return 0;
    return C * (voltage - vPrev) / ctx.dt;
  }

  validate(component: EngineComponent): string[] {
    const C = component.params.capacitance ?? 0;
    if (C <= 0) return [`Capacitor '${component.label}' debe tener C > 0.`];
    return [];
  }
}

export class InductorElement extends BaseElement {
  readonly type = 'inductor';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    const L = component.params.inductance ?? 1e-3;
    if (L <= 0 || ctx.dt <= 0) return;

    const col = ctx.inductorVarIndex.get(component.id);
    if (col === undefined) return;

    const Req = L / ctx.dt;
    const iPrev = ctx.state.il.get(component.id) ?? 0;
    const Veq = Req * iPrev;

    const { nodeIndex } = ctx.topology;
    for (const [nid, coef] of [
      [nodes[0], 1] as const,
      [nodes[1], -1] as const,
    ]) {
      if (nid === 0) continue;
      const i = nodeIndex.get(nid);
      if (i !== undefined) ctx.A.add(i, col, coef);
      ctx.A.add(col, i!, coef);
    }
    ctx.A.add(col, col, -Req);
    ctx.b[col] = -Veq;
  }

  calculateCurrent(ctx: StampContext, component: EngineComponent): number {
    const col = ctx.inductorVarIndex.get(component.id);
    if (col === undefined || !ctx.solution) return ctx.state.il.get(component.id) ?? 0;
    return ctx.solution[col] ?? 0;
  }

  validate(component: EngineComponent): string[] {
    const L = component.params.inductance ?? 0;
    if (L <= 0) return [`Inductor '${component.label}' debe tener L > 0.`];
    return [];
  }
}

export class VoltageSourceElement extends BaseElement {
  readonly type = 'voltageSource';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    const col = ctx.voltageSourceVarIndex.get(component.id);
    if (col === undefined) return;

    const V = component.params.voltage ?? 9;
    const { nodeIndex } = ctx.topology;

    for (const [nid, coef] of [
      [nodes[0], 1] as const,
      [nodes[1], -1] as const,
    ]) {
      if (nid === 0) continue;
      const i = nodeIndex.get(nid);
      if (i !== undefined) ctx.A.add(i, col, coef);
      ctx.A.add(col, i!, coef);
    }
    ctx.b[col] = V;
  }

  calculateCurrent(ctx: StampContext, component: EngineComponent): number {
    const col = ctx.voltageSourceVarIndex.get(component.id);
    if (col === undefined || !ctx.solution) return 0;
    return ctx.solution[col] ?? 0;
  }

  validate(component: EngineComponent): string[] {
    const V = component.params.voltage;
    if (V !== undefined && V < 0) {
      return [`Fuente '${component.label}': voltaje negativo (permitido pero revisar polaridad).`];
    }
    return [];
  }
}

export class CurrentSourceElement extends BaseElement {
  readonly type = 'currentSource';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    const I = component.params.current ?? 0.01;
    this.stampCurrentSource(ctx, nodes[0], nodes[1], I);
  }

  protected calculateCurrentFromVoltage(_v: number, _ctx: StampContext, component: EngineComponent): number {
    return component.params.current ?? 0.01;
  }

  validate(_component: EngineComponent): string[] {
    return [];
  }
}

export class SwitchElement extends BaseElement {
  readonly type = 'switch';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    const closed = (component.params.isClosed ?? 0) >= 0.5;
    if (closed) {
      // Closed switch ≈ small resistance (or 0V source — use conductance)
      this.stampConductance(ctx, nodes[0], nodes[1], 1 / 1e-6);
    } else {
      this.stampConductance(ctx, nodes[0], nodes[1], 1 / 1e12);
    }
  }

  protected calculateCurrentFromVoltage(voltage: number, _ctx: StampContext, component: EngineComponent): number {
    const closed = (component.params.isClosed ?? 0) >= 0.5;
    const R = closed ? 1e-6 : 1e12;
    return voltage / R;
  }

  validate(component: EngineComponent): string[] {
    const s = component.params.isClosed;
    if (s !== undefined && s !== 0 && s !== 1) {
      return [`Interruptor '${component.label}': estado inválido (use 0 o 1).`];
    }
    return [];
  }
}

export class GroundElement extends BaseElement {
  readonly type = 'ground';

  stamp(_ctx: StampContext, _component: EngineComponent): void {
    // Ground is handled via node 0 reference — no stamp needed
  }

  validate(_component: EngineComponent): string[] {
    return [];
  }
}

const VOLTMETER_R = 1e12;
const AMMETER_R = 1e-6;

export class VoltmeterElement extends BaseElement {
  readonly type = 'voltmeter';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    this.stampConductance(ctx, nodes[0], nodes[1], 1 / VOLTMETER_R);
  }

  protected calculateCurrentFromVoltage(voltage: number): number {
    return voltage / VOLTMETER_R;
  }

  validate(_component: EngineComponent): string[] {
    return [];
  }
}

export class AmmeterElement extends BaseElement {
  readonly type = 'ammeter';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    this.stampConductance(ctx, nodes[0], nodes[1], 1 / AMMETER_R);
  }

  protected calculateCurrentFromVoltage(voltage: number): number {
    return voltage / AMMETER_R;
  }

  validate(_component: EngineComponent): string[] {
    return [];
  }
}

/** Variable resistor between two terminals (wiper × Rmax). */
export class PotentiometerElement extends BaseElement {
  readonly type = 'potentiometer';

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    const R = this.effectiveResistance(component);
    if (R <= 0) return;
    this.stampConductance(ctx, nodes[0], nodes[1], 1 / R);
  }

  protected calculateCurrentFromVoltage(voltage: number, _ctx: StampContext, component: EngineComponent): number {
    const R = this.effectiveResistance(component);
    if (R <= 0) return 0;
    return voltage / R;
  }

  validate(component: EngineComponent): string[] {
    const Rmax = component.params.maxResistance ?? 0;
    if (Rmax <= 0) return [`Potenciómetro '${component.label}': R máxima debe ser > 0.`];
    const w = component.params.wiper;
    if (w !== undefined && (w < 0 || w > 1)) {
      return [`Potenciómetro '${component.label}': cursor entre 0 y 1.`];
    }
    return [];
  }

  private effectiveResistance(component: EngineComponent): number {
    const Rmax = component.params.maxResistance ?? 10_000;
    const wiper = Math.min(1, Math.max(0, component.params.wiper ?? 0.5));
    if (wiper < 0.001) return DIODE_R_OFF;
    return Rmax * wiper;
  }
}

const DIODE_R_ON = 25;
const DIODE_R_OFF = 1e9;
const LED_R_ON = 40;

/** Piecewise diode: bloquea inversa, conduce con caída Vf + Ron en directa. */
abstract class PiecewiseDiodeElement extends BaseElement {
  protected abstract readonly defaultVf: number;
  protected get rOn(): number {
    return DIODE_R_ON;
  }

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    const [cathode, anode] = nodes;
    const Vf = component.params.forwardVoltage ?? this.defaultVf;
    const vdPrev = ctx.state.vd.get(component.id) ?? 0;
    const on = vdPrev >= Vf * 0.65;

    if (on) {
      const G = 1 / this.rOn;
      this.stampConductance(ctx, cathode, anode, G);
      this.stampCurrentSource(ctx, cathode, anode, G * Vf);
    } else {
      this.stampConductance(ctx, cathode, anode, 1 / DIODE_R_OFF);
    }
  }

  calculateCurrent(
    ctx: StampContext,
    component: EngineComponent,
    nodeVoltages: Map<number, number>,
  ): number {
    const nodes = ctx.componentNodes.get(component.id);
    if (!nodes) return 0;
    const vc = nodeVoltages.get(nodes[0]) ?? 0;
    const va = nodeVoltages.get(nodes[1]) ?? 0;
    const vd = va - vc;
    const Vf = component.params.forwardVoltage ?? this.defaultVf;
    if (vd >= Vf) {
      return -(vd - Vf) / this.rOn;
    }
    return (va - vc) / DIODE_R_OFF;
  }

  validate(component: EngineComponent): string[] {
    const Vf = component.params.forwardVoltage;
    if (Vf !== undefined && Vf <= 0) {
      return [`'${component.label}': V directa debe ser > 0.`];
    }
    return [];
  }
}

export class DiodeElement extends PiecewiseDiodeElement {
  readonly type = 'diode';
  protected readonly defaultVf = 0.7;
}

export class LedElement extends PiecewiseDiodeElement {
  readonly type = 'led';
  protected readonly defaultVf = 2.0;
  protected override get rOn(): number {
    return LED_R_ON;
  }
}

/** Placeholder: alta impedancia entre terminales (aún no hay modelo BJT). */
export class TransistorElement extends BaseElement {
  readonly type = 'transistor';
  private static readonly R_PLACEHOLDER = 1e9;

  stamp(ctx: StampContext, component: EngineComponent): void {
    const nodes = this.getNodes(ctx, component);
    if (!nodes) return;
    this.stampConductance(ctx, nodes[0], nodes[1], 1 / TransistorElement.R_PLACEHOLDER);
  }

  protected calculateCurrentFromVoltage(voltage: number): number {
    return voltage / TransistorElement.R_PLACEHOLDER;
  }

  validate(_component: EngineComponent): string[] {
    return [];
  }
}
