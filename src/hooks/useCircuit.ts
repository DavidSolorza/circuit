import { useCircuitStore } from '../store/circuitStore';

export function useCircuit() {
  const components = useCircuitStore((s) => s.circuit.components);
  const wires = useCircuitStore((s) => s.circuit.wires);
  const terminals = useCircuitStore((s) => s.circuit.terminals);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const selectedComp = selectedId ? components[selectedId] : null;

  const add = useCircuitStore((s) => s.addComponent);
  const remove = useCircuitStore((s) => s.removeComponent);
  const move = useCircuitStore((s) => s.moveComponent);
  const rotate = useCircuitStore((s) => s.rotateComponent);
  const duplicate = useCircuitStore((s) => s.duplicateComponent);
  const select = useCircuitStore((s) => s.selectComponent);
  const updateParam = useCircuitStore((s) => s.updateComponentParam);
  const undo = useCircuitStore((s) => s.undo);
  const redo = useCircuitStore((s) => s.redo);
  const undoCount = useCircuitStore((s) => s.undoStack.length);
  const redoCount = useCircuitStore((s) => s.redoStack.length);

  return {
    components,
    wires,
    terminals,
    selectedId,
    selectedComp,
    count: Object.keys(components).length,
    wireCount: Object.keys(wires).length,
    addComponent: add,
    removeComponent: remove,
    moveComponent: move,
    rotateComponent: rotate,
    duplicateComponent: duplicate,
    selectComponent: select,
    updateParam,
    undo,
    redo,
    undoCount,
    redoCount,
  };
}
