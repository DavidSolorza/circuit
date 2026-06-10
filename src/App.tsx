import React, { useState, useCallback, useEffect, Suspense, memo } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { MultimeterDisplay } from './components/multimeter/MultimeterDisplay';
import { GraphPanel } from './components/graph/GraphPanel';
import { SimulationStatus } from './components/status/SimulationStatus';
import { CalculatorPage } from './components/calculator/CalculatorPage';
import { ToastContainer } from './shared/ui';
import { useSimulation } from './hooks/useSimulation';
import { useCircuit } from './hooks/useCircuit';
import { useCircuitPersistence } from './hooks/useCircuitPersistence';
import { useCircuitStore } from './store/circuitStore';
import { TOOL_DESCRIPTIONS } from './core/tooltips';
import { loadDemo } from './utils/loadDemo';
import { registerDemoLoadedHandler } from './utils/demoUi';
import { placeFirstComponent } from './utils/placeFirstComponent';
import { toastInfo } from './shared/store/toastStore';
import { ShortcutsHelp } from './components/help/ShortcutsHelp';
import { DemoGuidePanel } from './components/guide/DemoGuidePanel';

const CircuitEditor = React.lazy(() => import('./features/editor/CircuitEditor'));

function useContainerSize() {
  const [size, setSize] = useState({ width: 800, height: 600 });
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries)
        setSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    ro.observe(node);
  }, []);
  return { ref, ...size };
}

const toolHints = TOOL_DESCRIPTIONS;

function AppInner() {
  const { ref: canvasRef, width: canvasWidth, height: canvasHeight } = useContainerSize();
  const [graphOpen, setGraphOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'properties' | 'multimeter' | 'guide'>('guide');
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { count: compCount, wireCount } = useCircuit();
  const { simulationRunning } = useSimulation();
  const { exportCircuit, importCircuit, clearCircuit } = useCircuitPersistence();
  const activeTool = useCircuitStore((s) => s.activeTool);
  const simErrorMsg = useCircuitStore((s) => s.simError);
  const probeCount = useCircuitStore((s) => s.probes.length);
  const selectedWireId = useCircuitStore((s) => s.selectedWireId);
  const simTime = useCircuitStore((s) => s.simTime);
  const hasCircuit = compCount > 0;

  const handleLoadDemo = useCallback(() => loadDemo(), []);

  useEffect(() => {
    registerDemoLoadedHandler(() => {
      setSidebarOpen(true);
      setSidebarTab('guide');
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        !(e.target instanceof HTMLInputElement)
      ) {
        const s = useCircuitStore.getState();
        if (s.selectedWireId) {
          s.removeWire(s.selectedWireId);
          toastInfo('Cable eliminado');
          return;
        }
        if (s.selectedComponentId) s.removeComponent(s.selectedComponentId);
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        useCircuitStore.getState().redo();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        useCircuitStore.getState().undo();
      } else if (e.key === '?' && !(e.target instanceof HTMLInputElement)) {
        setHelpOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-surface-950 text-ink">
      <header className="h-11 bg-surface-900 border-b border-surface-700 flex items-center px-4 shrink-0 gap-3 shadow-panel">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-[10px] font-bold text-gold-100 shadow-panel">
            ~
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-ink leading-none">LabCircuitos</h1>
            <p className="text-[9px] text-ink-faint leading-none mt-0.5 hidden sm:block">
              Prácticas de circuitos
            </p>
          </div>
        </div>

        <div className="w-px h-5 bg-surface-700" />

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {
              if (confirm('¿Crear un nuevo circuito? Se perderán los cambios no guardados.')) {
                clearCircuit();
              }
            }}
            className="btn-icon"
            title="Nuevo circuito"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) importCircuit(file);
              };
              input.click();
            }}
            className="btn-icon"
            title="Abrir circuito"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </button>
          <button onClick={() => exportCircuit()} className="btn-icon" title="Guardar circuito">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>
        </div>

        <div className="w-px h-5 bg-surface-700" />

        <SimulationStatus />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleLoadDemo}
            className="btn-ghost hidden sm:flex items-center gap-1.5 text-[10px]"
            title="Carga el circuito de ejemplo con guía"
          >
            Ejemplo
          </button>
          <button
            onClick={() => setHelpOpen(true)}
            className="btn-icon"
            title="Atajos de teclado (?)"
          >
            ?
          </button>
          <button
            onClick={() => setCalculatorOpen(true)}
            className="btn-ghost flex items-center gap-1.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="8" y2="10.01" />
              <line x1="12" y1="10" x2="12" y2="10.01" />
              <line x1="16" y1="10" x2="16" y2="10.01" />
              <line x1="8" y1="14" x2="8" y2="14.01" />
              <line x1="12" y1="14" x2="12" y2="14.01" />
              <line x1="16" y1="14" x2="16" y2="14.01" />
              <line x1="8" y1="18" x2="8" y2="18.01" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
              <line x1="16" y1="18" x2="16" y2="18.01" />
            </svg>
            Calculadora
          </button>
          <span className="text-[9px] text-ink-faint hidden md:inline px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">
            v1.0
          </span>
        </div>
      </header>

      {calculatorOpen && <CalculatorPage onClose={() => setCalculatorOpen(false)} />}
      {helpOpen && <ShortcutsHelp onClose={() => setHelpOpen(false)} />}

      {!hasCircuit && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-surface-900/98 backdrop-blur-md rounded-2xl border border-surface-700 px-8 py-7 text-center max-w-md pointer-events-auto shadow-float animate-slide-up">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary-500/15 to-gold-500/15 border border-primary-500/25 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1F4D3A"
                strokeWidth="1.5"
              >
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="6" y1="9" x2="6" y2="15" />
                <line x1="6" y1="12" x2="10" y2="12" />
                <polyline points="10,9 14,12 10,15" />
                <line x1="14" y1="12" x2="18" y2="12" />
                <line x1="18" y1="9" x2="18" y2="15" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink mb-2">LabCircuitos</h3>
            <p className="text-xs text-ink-muted leading-relaxed text-left">
              Saca piezas de la paleta (clic o arrastre), únelas por los círculos de conexión y
              añade una <strong className="font-medium text-ink">tierra GND</strong> antes de
              simular. El osciloscopio queda abajo; mediciones, a la derecha.
            </p>
            <p className="text-[11px] text-ink-faint mt-3 text-left">
              Si prefieres no empezar de cero, carga el ejemplo: trae todos los componentes ya
              cableados y una guía en la pestaña <strong className="text-ink">Guía</strong>.
            </p>
            <button onClick={() => placeFirstComponent('resistor')} className="mt-5 btn-primary w-full">
              Colocar primer componente
            </button>
            <button onClick={handleLoadDemo} className="mt-2 btn-gold w-full">
              Ver circuito de ejemplo
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 relative">
        <aside className="w-[300px] min-w-[300px] bg-surface-900 border-r border-surface-700 shrink-0 flex flex-col shadow-panel">
          <Toolbar />
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div ref={canvasRef} className="flex-1 min-h-0 relative bg-surface-950">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full text-surface-500 text-xs">
                  Cargando editor...
                </div>
              }
            >
              <CircuitEditor width={canvasWidth} height={canvasHeight} />
            </Suspense>

            {simErrorMsg && (
              <div className="absolute top-2 left-2 bg-surface-900/95 backdrop-blur-sm rounded-lg border border-red-300 px-2.5 py-1.5 text-[10px] shadow-lg max-w-xs animate-fade-in">
                <div className="flex items-center gap-1.5 text-red-600 font-semibold tracking-wider mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Error de Simulación
                </div>
                <div className="text-red-500/80">{simErrorMsg}</div>
              </div>
            )}

          </div>

          <div
            className={`border-t border-surface-700 bg-surface-900 transition-all duration-200 ${graphOpen ? 'h-[280px]' : 'h-9'}`}
          >
            <button
              onClick={() => setGraphOpen(!graphOpen)}
              className="w-full h-9 flex items-center justify-between px-4 text-[11px] text-ink-faint hover:text-ink transition-all hover:bg-surface-800/60 border-b border-surface-800"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary-600 font-semibold">Osciloscopio</span>
                <span className="text-surface-600">·</span>
                <span className="text-ink-faint">visor multicanal</span>
              </div>
              <span className="text-ink-faint text-[10px]">{graphOpen ? '\u25BC' : '\u25B2'}</span>
            </button>
            {graphOpen && (
              <div className="h-[calc(100%-36px)]">
                <GraphPanel />
              </div>
            )}
          </div>
        </main>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 h-12 bg-surface-900 border border-surface-700 rounded-l-lg flex items-center justify-center text-ink-faint hover:text-ink hover:w-6 text-[10px] shadow-panel xl:hidden transition-all active:scale-95"
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points={sidebarOpen ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
          </svg>
        </button>

        <aside
          className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-surface-900 border-l border-surface-700 shrink-0 flex flex-col transition-all duration-200 overflow-hidden shadow-panel`}
        >
          <div className="flex border-b border-surface-700 min-w-0">
            <button
              onClick={() => setSidebarTab('guide')}
              className={`sidebar-tab flex-1 ${sidebarTab === 'guide' ? 'sidebar-tab-active' : 'sidebar-tab-inactive'}`}
            >
              Guía
            </button>
            <button
              onClick={() => setSidebarTab('multimeter')}
              className={`sidebar-tab flex-1 ${sidebarTab === 'multimeter' ? 'sidebar-tab-active' : 'sidebar-tab-inactive'}`}
            >
              Multímetro
            </button>
            <button
              onClick={() => setSidebarTab('properties')}
              className={`sidebar-tab flex-1 ${sidebarTab === 'properties' ? 'sidebar-tab-active' : 'sidebar-tab-inactive'}`}
            >
              Propiedades
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'guide' && <DemoGuidePanel />}
            {sidebarTab === 'multimeter' && <MultimeterDisplay />}
            {sidebarTab === 'properties' && <PropertiesPanel />}
          </div>
        </aside>
      </div>

      <ToastContainer />

      <div className="h-7 bg-surface-900 border-t border-surface-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-ink-faint min-w-0">
          <span className="text-primary-600 font-medium shrink-0">
            {selectedWireId
              ? 'Cable seleccionado — Supr elimina · arrastra un extremo para mover'
              : (toolHints[activeTool] ?? '')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-ink-faint shrink-0 ml-4 text-[10px] font-mono tabular-nums">
          {simulationRunning && (
            <>
              <span className="text-green-600">{simTime.toFixed(2)} s</span>
              <span className="text-surface-600">·</span>
            </>
          )}
          <span>{compCount} componentes</span>
          <span className="text-surface-600">·</span>
          <span>{wireCount} cables</span>
          <span className="text-surface-600">·</span>
          <span>{probeCount} sondas</span>
        </div>
      </div>
    </div>
  );
}

export default memo(AppInner);
