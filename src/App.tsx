import React, { useState, useCallback, useEffect, Suspense, memo } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { MultimeterDisplay } from './components/multimeter/MultimeterDisplay';
import { GraphPanel } from './components/graph/GraphPanel';
import { SimulationStatus } from './components/status/SimulationStatus';
import { CalculatorPage } from './components/calculator/CalculatorPage';
import { useSimulation } from './hooks/useSimulation';
import { useCircuit } from './hooks/useCircuit';
import { useCircuitPersistence } from './hooks/useCircuitPersistence';
import { useCircuitStore } from './store/circuitStore';
import { GRID_SIZE } from './core/constants';

const CircuitEditor = React.lazy(() => import('./features/editor/CircuitEditor'));

function useContainerSize() {
  const [size, setSize] = useState({ width: 800, height: 600 });
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    ro.observe(node);
  }, []);
  return { ref, ...size };
}

function loadDemo() {
  const gs = () => useCircuitStore.getState();
  const snap = (p: { x: number; y: number }) => ({
    x: Math.round(p.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(p.y / GRID_SIZE) * GRID_SIZE,
  });
  const gap = GRID_SIZE * 6;
  const startX = 300, startY = 280;

  gs().addComponent('voltageSource', snap({ x: startX, y: startY }));
  gs().addComponent('resistor', snap({ x: startX + gap, y: startY }));
  gs().addComponent('led', snap({ x: startX + gap, y: startY + gap }));
  gs().addComponent('capacitor', snap({ x: startX, y: startY + gap * 2 }));
  gs().addComponent('inductor', snap({ x: startX + gap, y: startY + gap * 2 }));
  gs().addComponent('ground', snap({ x: startX, y: startY + gap }));

  let s = gs();
  const bat = Object.values(s.circuit.components).find(c => c.type === 'voltageSource')!;
  const res = Object.values(s.circuit.components).find(c => c.type === 'resistor')!;
  const led = Object.values(s.circuit.components).find(c => c.type === 'led')!;
  const cap = Object.values(s.circuit.components).find(c => c.type === 'capacitor')!;
  const ind = Object.values(s.circuit.components).find(c => c.type === 'inductor')!;
  const gnd = Object.values(s.circuit.components).find(c => c.type === 'ground')!;

  s.setActiveTool('wire');
  const wire = (tA: string, tB: string) => {
    const st = gs();
    if (st.circuit.terminals[tA] && st.circuit.terminals[tB] &&
        st.circuit.terminals[tA].nodeId !== st.circuit.terminals[tB].nodeId) {
      st.startConnection(tA);
      st.completeConnection(tB);
    }
  };
  wire(bat.terminalIds[1], res.terminalIds[0]);
  wire(res.terminalIds[1], led.terminalIds[0]);
  wire(led.terminalIds[1], gnd.terminalIds[0]);
  wire(bat.terminalIds[0], gnd.terminalIds[0]);
  wire(res.terminalIds[1], cap.terminalIds[0]);
  wire(cap.terminalIds[1], ind.terminalIds[0]);
  wire(ind.terminalIds[1], gnd.terminalIds[0]);

  s = gs();
  s.setActiveTool('select');
  s.selectComponent(led.id);
  s.addProbe('voltage', led.id, 0);
  s.addProbe('current', led.id);
  s.addProbe('voltage', cap.id, 0);
  s.addProbe('current', cap.id);
  setTimeout(() => { gs().toggleSimulation(); }, 300);
}

const toolHints: Record<string, string> = {
  select: 'Click: seleccionar · Arrastrar: mover · Ctrl+Z: deshacer',
  wire: 'Click terminal azul para iniciar · Click otro para conectar',
  probe: 'Click componente para añadir sonda de voltaje',
  resistor: 'Colocar resistencia en la cuadrícula',
  capacitor: 'Colocar capacitor en la cuadrícula',
  inductor: 'Colocar inductor en la cuadrícula',
  voltageSource: 'Colocar batería en la cuadrícula',
  currentSource: 'Colocar fuente de corriente',
  led: 'Colocar LED en la cuadrícula',
  diode: 'Colocar diodo en la cuadrícula',
  transistor: 'Colocar transistor en la cuadrícula',
  potentiometer: 'Colocar potenciómetro en la cuadrícula',
  switch: 'Colocar interruptor',
  ground: 'Colocar tierra (0V)',
  voltmeter: 'Colocar voltímetro',
  ammeter: 'Colocar amperímetro',
  multimeter: 'Cambiar a vista multímetro',
};

function AppInner() {
  const { ref: canvasRef, width: canvasWidth, height: canvasHeight } = useContainerSize();
  const [graphOpen, setGraphOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'properties' | 'multimeter'>('multimeter');
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const { count: compCount, wireCount } = useCircuit();
  const { simulationRunning } = useSimulation();
  const { exportCircuit, importCircuit, clearCircuit } = useCircuitPersistence();
  const activeTool = useCircuitStore((s) => s.activeTool);
  const simErrorMsg = useCircuitStore((s) => s.simError);
  const simResults = useCircuitStore((s) => s.simResults);
  const hasCircuit = compCount > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !(e.target instanceof HTMLInputElement)) {
        const s = useCircuitStore.getState();
        if (s.selectedComponentId) s.removeComponent(s.selectedComponentId);
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault(); useCircuitStore.getState().redo();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); useCircuitStore.getState().undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-surface-950 text-slate-200">
      <header className="h-9 bg-surface-900 border-b border-surface-700 flex items-center px-3 shrink-0 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
            ~
          </div>
          <h1 className="text-xs font-bold tracking-wide text-slate-100">LabCircuitos</h1>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              if (confirm('¿Crear un nuevo circuito? Se perderán los cambios no guardados.')) {
                clearCircuit();
              }
            }}
            className="px-2 py-1 text-[10px] text-slate-400 hover:text-white hover:bg-surface-700 rounded transition-all hover:scale-105 active:scale-95" 
            title="Nuevo"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
            className="px-2 py-1 text-[10px] text-slate-400 hover:text-white hover:bg-surface-700 rounded transition-all hover:scale-105 active:scale-95" 
            title="Abrir"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          </button>
          <button 
            onClick={() => exportCircuit()}
            className="px-2 py-1 text-[10px] text-slate-400 hover:text-white hover:bg-surface-700 rounded transition-all hover:scale-105 active:scale-95" 
            title="Guardar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </button>
        </div>

        <div className="w-px h-4 bg-surface-700" />

        <SimulationStatus />

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setCalculatorOpen(true)}
            className="px-2 py-1 text-[10px] bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white rounded border border-surface-700 transition-all hover:scale-105 active:scale-95 font-medium"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/></svg>
            Calculadora
          </button>
          <span className="text-[9px] text-slate-600 hidden md:inline">v1.0</span>
        </div>
      </header>

      {calculatorOpen && <CalculatorPage onClose={() => setCalculatorOpen(false)} />}

      {!hasCircuit && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-surface-900/95 backdrop-blur-sm rounded-xl border border-surface-700 px-8 py-6 text-center max-w-sm pointer-events-auto shadow-2xl animate-slide-up">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 border border-primary-500/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                <line x1="2" y1="12" x2="6" y2="12" /><line x1="6" y1="9" x2="6" y2="15" /><line x1="6" y1="12" x2="10" y2="12" />
                <polyline points="10,9 14,12 10,15" /><line x1="14" y1="12" x2="18" y2="12" /><line x1="18" y1="9" x2="18" y2="15" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Bienvenido a LabCircuitos</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Arrastra componentes desde la barra lateral a la cuadrícula para construir tu circuito.
              <br /><br />
              Usa <span className="text-primary-400 font-medium">Cable</span> para conectar terminales.<br />
              Presiona <span className="text-green-400 font-medium">INICIAR</span> para simular.
            </p>
            <button onClick={() => useCircuitStore.getState().setActiveTool('resistor')} className="mt-4 px-4 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-sm w-full">
              Colocar primer componente
            </button>
            <button onClick={loadDemo} className="mt-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-95 w-full shadow-sm">
              Cargar circuito demo
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 relative">
        <aside className="w-[132px] bg-surface-900 border-r border-surface-700 shrink-0 flex flex-col shadow-sm">
          <Toolbar />
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div ref={canvasRef} className="flex-1 min-h-0 relative bg-surface-950">
            <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-500 text-xs">Cargando editor...</div>}>
              <CircuitEditor width={canvasWidth} height={canvasHeight} />
            </Suspense>

            {simErrorMsg && (
              <div className="absolute top-2 left-2 bg-surface-900/95 backdrop-blur-sm rounded-lg border border-red-800/50 px-2.5 py-1.5 text-[10px] shadow-lg max-w-xs animate-fade-in">
                <div className="flex items-center gap-1.5 text-red-400 font-semibold tracking-wider mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Error de Simulación
                </div>
                <div className="text-red-300/80">{simErrorMsg}</div>
              </div>
            )}

            {simulationRunning && simResults?.status.success && (
              <div className="absolute top-2 right-2 bg-surface-900/95 backdrop-blur-sm rounded-lg border border-surface-700 px-2.5 py-1.5 text-[10px] shadow-lg pointer-events-none animate-fade-in">
                <div className="text-slate-500 leading-relaxed">
                  {Object.keys(simResults.nodeVoltages).length - 1} nodos · {Object.keys(simResults.branchCurrents).length} ramas
                </div>
              </div>
            )}
          </div>

          <div className={`border-t border-surface-700 bg-surface-900 transition-all duration-200 ${graphOpen ? 'h-56' : 'h-8'}`}>
            <button onClick={() => setGraphOpen(!graphOpen)} className="w-full h-8 flex items-center justify-between px-4 text-[10px] text-slate-500 hover:text-slate-300 transition-all hover:bg-surface-800/50 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <span className="text-primary-400 font-medium">Osciloscopio</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-600">visor multicanal</span>
              </div>
              <span className="text-slate-500">{graphOpen ? '\u25BC' : '\u25B2'}</span>
            </button>
            {graphOpen && <div className="h-[calc(100%-32px)]"><GraphPanel /></div>}
          </div>
        </main>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-5 h-10 bg-surface-800 border border-surface-700 rounded-l-md flex items-center justify-center text-slate-500 hover:text-slate-300 hover:w-6 text-[10px] shadow-sm xl:hidden transition-all active:scale-95"
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points={sidebarOpen ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}/></svg>
        </button>

        <aside className={`${sidebarOpen ? 'w-60' : 'w-0'} bg-surface-900 border-l border-surface-700 shrink-0 flex flex-col transition-all duration-200 overflow-hidden`}>
          <div className="flex border-b border-surface-700 min-w-0">
          <button
            onClick={() => setSidebarTab('multimeter')}
            className={`flex-1 h-8 text-[10px] font-medium uppercase tracking-wider transition-all ${sidebarTab === 'multimeter' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300 hover:bg-surface-800'}`}
          >
            Multímetro
          </button>
          <button
            onClick={() => setSidebarTab('properties')}
            className={`flex-1 h-8 text-[10px] font-medium uppercase tracking-wider transition-all ${sidebarTab === 'properties' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-slate-500 hover:text-slate-300 hover:bg-surface-800'}`}
          >
            Propiedades
          </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'multimeter' ? <MultimeterDisplay /> : <PropertiesPanel />}
          </div>
        </aside>
      </div>

      <div className="h-6 bg-surface-900 border-t border-surface-700 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2 text-[9px] text-slate-500 min-w-0">
          <span className="text-primary-400 font-medium shrink-0">{toolHints[activeTool] ?? ''}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600 shrink-0 ml-4">
          <span>{compCount} cmp</span>
          <span>{wireCount} cables</span>
        </div>
      </div>
    </div>
  );
}

export default memo(AppInner);
