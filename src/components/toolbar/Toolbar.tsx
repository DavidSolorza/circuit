import { useState, useCallback, useMemo } from 'react';
import { symbolComponents } from '../symbols';
import type { ComponentType, ToolType } from '../../types';
import { useCircuitStore } from '../../store/circuitStore';
import { COMPONENT_CATEGORIES, COMPONENT_TEMPLATES } from '../../core/constants';
import { getComponentTooltip, TOOL_DESCRIPTIONS } from '../../core/tooltips';
import type React from 'react';

const nonComponentTools: Array<{ type: ToolType; label: string; icon: string }> = [
  {
    type: 'select',
    label: 'Seleccionar',
    icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3zM13 13l6 6',
  },
  { type: 'wire', label: 'Cable', icon: 'M4 20L20 4M4 4l16 16' },
  { type: 'probe', label: 'Sonda', icon: 'M12 2v4m0 12v4M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0' },
];

export function Toolbar() {
  const [search, setSearch] = useState('');
  const activeTool = useCircuitStore((s) => s.activeTool);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);
  const addComponent = useCircuitStore((s) => s.addComponent);
  const undo = useCircuitStore((s) => s.undo);
  const redo = useCircuitStore((s) => s.redo);
  const undoCount = useCircuitStore((s) => s.undoStack.length);
  const redoCount = useCircuitStore((s) => s.redoStack.length);
  const compCount = useCircuitStore((s) => Object.keys(s.circuit.components).length);
  const wireCount = useCircuitStore((s) => Object.keys(s.circuit.wires).length);

  const handleDragStart = useCallback((e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleAddComponent = useCallback(
    (type: ComponentType) => {
      addComponent(type, { x: 300, y: 200 });
      setActiveTool('select');
    },
    [addComponent, setActiveTool],
  );

  const filteredCategories = useMemo(() => {
    if (!search) return COMPONENT_CATEGORIES;
    const q = search.toLowerCase();
    return COMPONENT_CATEGORIES.map((cat) => ({
      ...cat,
      types: cat.types.filter((t) => t.toLowerCase().includes(q)),
    })).filter((cat) => cat.types.length > 0);
  }, [search]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 pt-2 pb-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar componente..."
          className="w-full px-2.5 py-1.5 text-[11px] bg-surface-800 border border-surface-700 rounded-md text-ink placeholder-ink-faint focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
        />
      </div>

      <div className="flex px-2 pb-1.5 gap-1">
        {nonComponentTools.map((t) => (
          <button
            key={t.type}
            onClick={() => setActiveTool(t.type)}
            className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
              activeTool === t.type
                ? 'bg-primary-600/15 text-primary-600 ring-1 ring-primary-500/25 shadow-sm'
                : 'text-ink-faint hover:text-ink hover:bg-surface-800'
            }`}
            title={TOOL_DESCRIPTIONS[t.type]}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d={t.icon} />
            </svg>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 space-y-2 pb-2">
        {filteredCategories.map((cat) => (
          <div key={cat.name}>
            <div className="text-[9px] text-ink-faint uppercase tracking-wider font-semibold px-1 mb-1.5">
              {cat.name}
            </div>
            <div className="space-y-0.5">
              {cat.types.map((type) => {
                const Sym = symbolComponents[type];
                const isActive = activeTool === type;
                const color = isActive ? '#C9A86A' : undefined;
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type)}
                    onClick={() => handleAddComponent(type)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gold-50 ring-1 ring-gold-500/30 shadow-sm'
                        : 'hover:bg-surface-800'
                    }`}
                    title={getComponentTooltip(type)}
                  >
                    {Sym && (
                      <div className="shrink-0 w-10 h-6 flex items-center justify-center">
                        <Sym size={40} color={color} />
                      </div>
                    )}
                    <span
                      className={`text-[10px] truncate ${isActive ? 'text-primary-600 font-semibold' : 'text-ink-muted'}`}
                    >
                      {COMPONENT_TEMPLATES[type]?.label ?? type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-surface-700 px-2 py-2 space-y-2 bg-surface-950/30">
        <button
          onClick={() => {
            const s = useCircuitStore.getState();
            s.toggleSimulation();
          }}
          title={
            simulationRunning
              ? 'Detener simulación transitoria'
              : 'Iniciar simulación (requiere tierra y circuito válido)'
          }
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all shadow-sm ${
            simulationRunning
              ? 'bg-sim-running/15 text-sim-running border border-sim-running/30 hover:bg-sim-running/20'
              : 'bg-gold-500 text-white border border-gold-600 hover:bg-gold-600 active:scale-[0.98]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${simulationRunning ? 'bg-sim-running animate-pulse' : 'bg-gold-100'}`}
          />
          {simulationRunning ? 'DETENER' : 'INICIAR'}
        </button>

        <div className="flex gap-1">
          <button
            onClick={undo}
            disabled={undoCount === 0}
            className="flex-1 px-2 py-1.5 rounded-md text-[10px] text-ink-faint hover:text-ink hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-surface-700"
            title="Deshacer (Ctrl+Z)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="inline"
            >
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-18-5v0" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={redoCount === 0}
            className="flex-1 px-2 py-1.5 rounded-md text-[10px] text-ink-faint hover:text-ink hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-surface-700"
            title="Rehacer (Ctrl+Shift+Z)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="inline"
            >
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0118-5v0" />
            </svg>
          </button>
        </div>

        <div className="text-[9px] text-ink-faint text-center font-mono tabular-nums">
          {compCount} cmp · {wireCount} cables
        </div>
      </div>
    </div>
  );
}
