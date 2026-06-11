import { useState, useCallback, useMemo } from 'react';
import { symbolComponents } from '../symbols';
import type { ComponentType, ToolType } from '../../types';
import { useCircuitStore } from '../../store/circuitStore';
import { COMPONENT_CATEGORIES, COMPONENT_TEMPLATES, GRID_SIZE } from '../../core/constants';
import { getComponentTooltip, TOOL_DESCRIPTIONS } from '../../core/tooltips';
import { getComponentModelStatus } from '../../utils/circuitModelInfo';
import { loadDemo } from '../../utils/loadDemo';
import { validateLocalCircuit, resetLocalSimulation } from '../../services/localSimulation';
import { toastError, toastSuccess } from '../../shared/store/toastStore';
import { useCircuitStats } from '../../hooks/useCircuitStats';
import type React from 'react';

const CATEGORY_ACCENT: Record<string, string> = {
  Fuentes: 'bg-red-400',
  Pasivos: 'bg-violet-400',
  Semiconductores: 'bg-amber-400',
  Protección: 'bg-orange-400',
  Medidores: 'bg-sky-400',
  Misceláneos: 'bg-slate-400',
};

const TOOLS: Array<{ type: ToolType; label: string; icon: string }> = [
  { type: 'select', label: 'Seleccionar', icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3zM13 13l6 6' },
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
  const stats = useCircuitStats();

  const handleDragStart = useCallback((e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleAddComponent = useCallback(
    (type: ComponentType) => {
      const count = Object.keys(useCircuitStore.getState().circuit.components).length;
      const col = count % 4;
      const row = Math.floor(count / 4);
      const cell = GRID_SIZE * 5;
      addComponent(type, {
        x: 180 + col * cell,
        y: 130 + row * cell,
      });
      setActiveTool('select');
    },
    [addComponent, setActiveTool],
  );

  const filteredCategories = useMemo(() => {
    if (!search) return COMPONENT_CATEGORIES;
    const q = search.toLowerCase();
    return COMPONENT_CATEGORIES.map((cat) => ({
      ...cat,
      types: cat.types.filter((t) => {
        const label = COMPONENT_TEMPLATES[t]?.label ?? t;
        return t.toLowerCase().includes(q) || label.toLowerCase().includes(q);
      }),
    })).filter((cat) => cat.types.length > 0);
  }, [search]);

  return (
    <div className="toolbar-shell flex flex-col h-full">
      <div className="toolbar-header shrink-0">
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          <h2 className="text-sm font-bold text-ink">Paleta</h2>
          <span className="text-[10px] font-mono text-ink-faint tabular-nums">
            {stats.components} comp · {stats.wires} cables · {stats.electricalNodes} nodos
          </span>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar…"
          className="toolbar-search"
        />
      </div>

      <div className="px-3 py-2.5 shrink-0 border-b border-surface-700/60">
        <div className="grid grid-cols-3 gap-1.5">
          {TOOLS.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => setActiveTool(t.type)}
              className={`toolbar-tool-compact ${activeTool === t.type ? 'toolbar-tool-compact-active' : ''}`}
              title={TOOL_DESCRIPTIONS[t.type]}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={t.icon} />
              </svg>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {filteredCategories.length === 0 ? (
          <p className="text-xs text-ink-faint text-center py-8">Nada con “{search}”</p>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.name}>
              <div className="toolbar-category">
                <span className={`toolbar-category-dot ${CATEGORY_ACCENT[cat.name] ?? 'bg-surface-600'}`} />
                {cat.name}
              </div>
              <div className="space-y-1.5">
                {cat.types.map((type) => {
                  const Sym = symbolComponents[type];
                  const isActive = activeTool === type;
                  const label = COMPONENT_TEMPLATES[type]?.label ?? type;
                  const approx = getComponentModelStatus({ type, id: '', label, position: { x: 0, y: 0 }, rotation: 0, params: {}, terminalIds: ['', ''] }).approximated;
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, type)}
                      onClick={() => handleAddComponent(type)}
                      className={`component-card ${isActive ? 'component-card-active' : ''}`}
                      title={getComponentTooltip(type)}
                    >
                      <div className="component-card-icon">
                        {Sym && <Sym size={48} color={isActive ? '#C9A86A' : undefined} />}
                      </div>
                      <span className="flex-1 min-w-0">
                        <span
                          className={`block text-[13px] font-medium truncate ${isActive ? 'text-primary-700' : 'text-ink'}`}
                        >
                          {label}
                        </span>
                        {approx && (
                          <span className="text-[9px] text-gold-600/90">modelo simple</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="toolbar-footer shrink-0">
        <button type="button" onClick={() => loadDemo()} className="btn-toolbar-secondary">
          Ver circuito de ejemplo
        </button>

        <button
          type="button"
          onClick={() => {
            const store = useCircuitStore.getState();
            if (!store.simulationRunning) {
              const check = validateLocalCircuit(store.circuit);
              if (!check.valid) {
                const msg = check.errors[0] ?? 'Circuito inválido';
                store.setSimError(check.errors.join('; '));
                toastError('No se puede simular', msg);
                return;
              }
            }
            store.toggleSimulation();
          }}
          className={simulationRunning ? 'btn-sim-stop' : 'btn-sim-start'}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${simulationRunning ? 'bg-red-500 animate-pulse' : 'bg-white/90'}`}
          />
          {simulationRunning ? 'Detener' : 'Iniciar simulación'}
        </button>

        <button
          type="button"
          onClick={() => {
            const store = useCircuitStore.getState();
            if (store.simulationRunning) store.toggleSimulation();
            store.dischargeCircuit();
            resetLocalSimulation();
            store.clearOscData();
            toastSuccess('Circuito descargado', 'C, L y resultados reiniciados a 0.');
          }}
          className="btn-toolbar-secondary w-full"
          title="Reinicia cargas de capacitores e inductores"
        >
          Descargar C / L
        </button>

        <div className="flex gap-2">
          <button type="button" onClick={undo} disabled={undoCount === 0} className="btn-toolbar-icon">
            ↶ Deshacer
          </button>
          <button type="button" onClick={redo} disabled={redoCount === 0} className="btn-toolbar-icon">
            ↷ Rehacer
          </button>
        </div>

        <p className="text-[10px] text-ink-faint text-center leading-snug">
          {stats.electricalNodes} nodos · {stats.wires} cables · {stats.branches} ramas
          {stats.components > 0 && !simulationRunning && ' · listo para Iniciar'}
          {stats.components > 0 && simulationRunning && ' · simulando…'}
        </p>
      </div>
    </div>
  );
}
