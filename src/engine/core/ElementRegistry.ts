import type { BaseElement } from '../elements/BaseElement';
import {
  AmmeterElement,
  CapacitorElement,
  CurrentSourceElement,
  GroundElement,
  InductorElement,
  DiodeElement,
  FuseElement,
  LampElement,
  LedElement,
  PotentiometerElement,
  ResistorElement,
  SwitchElement,
  TransistorElement,
  VoltageSourceElement,
  VoltmeterElement,
} from '../elements';
import type { EngineElementType } from '../types';

/**
 * ElementRegistry — dynamic polymorphic registration for extensibility.
 * New components (diodes, MOSFETs, etc.) register here without modifying the solver.
 */
export class ElementRegistry {
  private registry = new Map<EngineElementType, BaseElement>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register('resistor', new ResistorElement());
    this.register('capacitor', new CapacitorElement());
    this.register('inductor', new InductorElement());
    this.register('voltageSource', new VoltageSourceElement());
    this.register('currentSource', new CurrentSourceElement());
    this.register('switch', new SwitchElement());
    this.register('ground', new GroundElement());
    this.register('voltmeter', new VoltmeterElement());
    this.register('ammeter', new AmmeterElement());
    this.register('potentiometer', new PotentiometerElement());
    this.register('transistor', new TransistorElement());
    this.register('led', new LedElement());
    this.register('diode', new DiodeElement());
    this.register('lamp', new LampElement());
    this.register('fuse', new FuseElement());
  }

  register(type: EngineElementType, element: BaseElement): void {
    this.registry.set(type, element);
  }

  get(type: EngineElementType): BaseElement | undefined {
    return this.registry.get(type);
  }

  has(type: EngineElementType): boolean {
    return this.registry.has(type);
  }

  getAll(): Map<EngineElementType, BaseElement> {
    return new Map(this.registry);
  }
}

export const defaultElementRegistry = new ElementRegistry();
