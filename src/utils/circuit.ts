import type { ComponentType, CircuitState, CircuitComponent, Terminal, Point } from '../types';
import { COMPONENT_TEMPLATES } from '../core/constants';
import { genId } from './id';
import { snapToGrid } from './snapToGrid';
export { genId, snapToGrid };

export function makeComponent(type: ComponentType, position: Point): CircuitComponent {
  const t = COMPONENT_TEMPLATES[type];
  const id = genId('cmp');
  return {
    id,
    type,
    label: t?.label ?? type,
    position: snapToGrid(position),
    rotation: 0,
    params: t ? { ...t.defaultParams } : {},
    terminalIds: [genId('term'), genId('term')],
  };
}

export function makeTerminal(componentId: string, index: 0 | 1, nodeId: number): Terminal {
  return { id: genId('term'), componentId, index, nodeId };
}

export function initCircuitState(): CircuitState {
  return { components: {}, terminals: {}, wires: {}, nextNodeId: 1 };
}
