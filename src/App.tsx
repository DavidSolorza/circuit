import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Toolbar } from './components/toolbar/Toolbar';
import { PropertiesPanel } from './components/sidebar/PropertiesPanel';
import { MultimeterDisplay } from './components/multimeter/MultimeterDisplay';
import { GraphPanel } from './components/graph/GraphPanel';
import { useSimulation } from './hooks/useSimulation';
import { useCircuit } from './hooks/useCircuit';
import { useCircuitStore } from './store/circuitStore';
import { GRID_SIZE } from './core/constants';

const CircuitEditor = React.lazy(() => import('./features/circuit-editor/CircuitEditor'));

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
  gs().addComponent('ground', snap({ x: startX, y: startY + gap }));

  let s = gs();
  const bat = Object.values(s.circuit.components).find(c => c.type === 'voltageSource')!;
  const res = Object.values(s.circuit.components).find(c => c.type === 'resistor')!;
  const led = Object.values(s.circuit.components).find(c => c.type === 'led')!;
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

  s = gs();
  s.setActiveTool('select');
  s.selectComponent(led.id);
  s.addProbe('voltage', led.id, 0);
  s.addProbe('current', led.id);
  setTimeout(() => { gs().toggleSimulation(); }, 300);
}

export default function App() {
  const { ref: canvasRef, width: canvasWidth, height: canvasHeight } = useContainerSize();
  const [graphOpen, setGraphOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'properties' | 'multimeter'>('properties');
  const { count: compCount, wireCount } = useCircuit();
  const { simulationRunning, simResults } = useSimulation();
  const activeTool = useCircuitStore((s) => s.activeTool);
  const darkMode = useCircuitStore((s) => s.darkMode);
  const toggleDarkMode = useCircuitStore((s) => s.toggleDarkMode);
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

  const toolHints: Record<string, string> = {
    select: 'Click to select • Drag to move • Ctrl+Z to undo',
    wire: 'Click a terminal (blue dot) to start • Click another to connect',
    probe: 'Click any component to add a voltage probe',
    resistor: 'Click or drag onto the grid to place a resistor',
    capacitor: 'Click or drag onto the grid to place a capacitor',
    inductor: 'Click or drag onto the grid to place an inductor',
    voltageSource: 'Click or drag onto the grid to place a battery',
    currentSource: 'Click or drag onto the grid to place a current source',
    led: 'Click or drag onto the grid to place an LED',
    switch: 'Click or drag onto the grid to place a switch',
    ground: 'Click or drag onto the grid to place ground (0V)',
  };

  return (
    <div className={`w-screen h-screen text-white flex flex-col select-none overflow-hidden ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <header className="h-10 bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-800 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-blue-500/20">
            ~
          </div>
          <h1 className="text-sm font-bold tracking-wide text-blue-400">CircuitLab</h1>
        </div>

        <div className="ml-6 flex items-center gap-3">
          {simulationRunning ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-900/40 border border-green-700/40 text-green-400 text-[10px] font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50" />
              SIM RUNNING
              {simResults && <span className="text-green-600 font-mono ml-1">{simResults.time.toFixed(1)}s</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/40 text-gray-500 text-[10px] font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              SIM STOPPED
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button onClick={toggleDarkMode} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            {darkMode ? '☀' : '☾'}
          </button>
          <span className="text-[10px] text-gray-700 uppercase tracking-widest hidden sm:block">
            interactive electronics lab
          </span>
        </div>
      </header>

      {!hasCircuit && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 px-6 py-5 text-center max-w-xs pointer-events-auto shadow-2xl">
            <div className="text-2xl mb-2 text-gray-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline">
                <line x1="2" y1="12" x2="6" y2="12" /><line x1="6" y1="9" x2="6" y2="15" /><line x1="6" y1="12" x2="10" y2="12" />
                <polyline points="10,9 14,12 10,15" /><line x1="14" y1="12" x2="18" y2="12" /><line x1="18" y1="9" x2="18" y2="15" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Welcome to CircuitLab</h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Drag components from the left toolbar onto the grid to build your circuit.
              <br /><br />
              Use <span className="text-blue-400 font-medium">Wire</span> to connect terminals (blue dots).<br />
              Press <span className="text-green-400 font-medium">START</span> to run the simulation.
            </p>
            <button onClick={() => useCircuitStore.getState().setActiveTool('resistor')} className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium transition-colors pointer-events-auto">
              Place first component
            </button>
            <button onClick={loadDemo} className="mt-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-medium transition-colors pointer-events-auto w-full">
              Load demo circuit
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <aside className="w-[122px] bg-gray-900/80 border-r border-gray-800 shrink-0 flex flex-col backdrop-blur-sm">
          <Toolbar />
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div ref={canvasRef} className="flex-1 min-h-0 overflow-hidden relative">
            <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-600 text-xs">Loading editor...</div>}>
              <CircuitEditor width={canvasWidth} height={canvasHeight} />
            </Suspense>

            {simulationRunning && simResults && (
              <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-green-900/40 px-2.5 py-1.5 text-[10px] shadow-lg pointer-events-none">
                <div className="flex items-center gap-2 text-green-400 font-semibold tracking-wider mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                  <span className="text-green-600 font-mono font-normal">{simResults.time.toFixed(2)}s</span>
                </div>
                <div className="text-gray-500 leading-relaxed">
                  {Object.keys(simResults.nodeVoltages).length - 1} nodes · {Object.keys(simResults.branchCurrents).length} branches
                </div>
              </div>
            )}
          </div>

          <div className={`border-t border-gray-800 bg-gray-900/90 backdrop-blur-sm transition-all duration-200 ${graphOpen ? 'h-52' : 'h-8'}`}>
            <button onClick={() => setGraphOpen(!graphOpen)} className="w-full h-8 flex items-center justify-between px-4 text-xs text-gray-500 hover:text-gray-300 transition-colors border-b border-gray-800/50">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-medium">Oscilloscope</span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-600">multi-channel viewer</span>
              </div>
              <span className="text-sm">{graphOpen ? '▼' : '▲'}</span>
            </button>
            {graphOpen && <div className="h-[calc(100%-32px)]"><GraphPanel /></div>}
          </div>
        </main>

        <aside className="w-56 bg-gray-900/80 border-l border-gray-800 shrink-0 flex flex-col backdrop-blur-sm">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setSidebarTab('properties')}
              className={`flex-1 h-8 text-[10px] font-medium uppercase tracking-wider transition-colors ${sidebarTab === 'properties' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Properties
            </button>
            <button
              onClick={() => setSidebarTab('multimeter')}
              className={`flex-1 h-8 text-[10px] font-medium uppercase tracking-wider transition-colors ${sidebarTab === 'multimeter' ? 'text-green-400 border-b-2 border-green-500' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Multimeter
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'properties' ? <PropertiesPanel /> : <MultimeterDisplay />}
          </div>
        </aside>
      </div>

      <div className="h-7 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-3 text-xs shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium shrink-0 text-blue-400">{activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}</span>
          <span className="text-gray-500 truncate">{toolHints[activeTool] ?? ''}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500 shrink-0 ml-4">
          <span>{compCount} cmp</span>
          <span>{wireCount} wires</span>
        </div>
      </div>
    </div>
  );
}
