import { useState, useCallback, useEffect } from 'react';
import { Toolbar } from './features/toolbar/Toolbar';
import { CircuitCanvas } from './features/circuit-canvas/CircuitCanvas';
import { PropertiesPanel } from './features/properties-panel/PropertiesPanel';
import { Oscilloscope } from './features/oscilloscope/Oscilloscope';
import { useSimulationLoop } from './hooks/useSimulationLoop';
import { useCircuitStore } from './store/circuitStore';
import { COMPONENT_TEMPLATES, GRID_SIZE } from './core/constants';
import type { Point } from './core/types';

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

function SimLoop() {
  useSimulationLoop();
  return null;
}

function StatusBar() {
  const activeTool = useCircuitStore((s) => s.activeTool);
  const connectingFrom = useCircuitStore((s) => s.connectingFrom);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simResults = useCircuitStore((s) => s.simResults);
  const components = useCircuitStore((s) => Object.keys(s.circuit.components).length);
  const wires = useCircuitStore((s) => Object.keys(s.circuit.wires).length);
  const probes = useCircuitStore((s) => s.probes);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const comp = useCircuitStore((s) => s.selectedComponentId ? s.circuit.components[s.selectedComponentId] : null);
  const terminals = useCircuitStore((s) => s.circuit.terminals);

  const hints: Record<string, string> = {
    select: 'Click to select \u2022 Drag to move \u2022 Right panel edits properties',
    wire: connectingFrom
      ? 'Now click on another terminal (circle) to connect'
      : 'Click a terminal (circle) to start a wire \u2022 Click empty space to cancel',
    probe: 'Click on any component to add a voltage probe \u2022 Or use Properties panel',
    resistor: 'Click on the grid to place a resistor',
    capacitor: 'Click on the grid to place a capacitor',
    inductor: 'Click on the grid to place an inductor',
    voltageSource: 'Click on the grid to place a DC voltage source',
    currentSource: 'Click on the grid to place a DC current source',
    led: 'Click on the grid to place an LED (glows when current flows)',
    switch: 'Click on the grid to place a switch',
    ground: 'Click on the grid to place a ground reference (0V)',
  };

  const toolLabel = activeTool.charAt(0).toUpperCase() + activeTool.slice(1);

  let multimeter: string | null = null;
  if (comp && simResults && simulationRunning) {
    const t0 = terminals[comp.terminalIds[0]];
    const t1 = terminals[comp.terminalIds[1]];
    if (t0) {
      const v0 = simResults.nodeVoltages[t0.nodeId] ?? 0;
      const v1 = t1 ? (simResults.nodeVoltages[t1.nodeId] ?? 0) : 0;
      const i = simResults.branchCurrents[comp.id] ?? 0;
      const iAbs = Math.abs(i);
      let iStr: string;
      if (iAbs >= 1) iStr = `${i.toFixed(3)} A`;
      else if (iAbs >= 1e-3) iStr = `${(i * 1e3).toFixed(2)} mA`;
      else iStr = `${(i * 1e6).toFixed(1)} \u00B5A`;
      multimeter = `${(v0 - v1).toFixed(3)} V  |  ${iStr}`;
    }
  }

  return (
    <div className="h-7 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-3 text-xs shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`font-medium shrink-0 ${connectingFrom ? 'text-amber-400' : 'text-blue-400'}`}>
          {toolLabel}
        </span>
        <span className="text-gray-500 truncate">{hints[activeTool] ?? ''}</span>
      </div>
      <div className="flex items-center gap-4 text-gray-500 shrink-0 ml-4">
        {multimeter && (
          <span className="text-green-400 font-mono text-[11px] bg-green-900/20 px-2 py-0.5 rounded border border-green-900/30">
            {'\u25A0'} {multimeter}
          </span>
        )}
        {simulationRunning && simResults && (
          <span className="text-green-500/80 font-mono">
            {'\u25C9'} t = {simResults.time.toFixed(2)}s
          </span>
        )}
        <span>{components} cmp</span>
        <span>{wires} wires</span>
        <span>{probes.length} probes</span>
      </div>
    </div>
  );
}

function loadDemo() {
  const gs = () => useCircuitStore.getState();
  const snap = (p: Point) => ({
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

  wire(bat.terminalIds[0], res.terminalIds[0]);
  wire(res.terminalIds[1], led.terminalIds[0]);
  wire(led.terminalIds[1], gnd.terminalIds[0]);
  wire(bat.terminalIds[1], gnd.terminalIds[0]);

  s = gs();
  s.setActiveTool('select');
  s.selectComponent(led.id);
  s.addProbe('voltage', led.id, 0);
  s.addProbe('current', led.id);

  setTimeout(() => { gs().toggleSimulation(); }, 300);
}

export default function App() {
  const { ref: canvasRef, width: canvasWidth, height: canvasHeight } = useContainerSize();
  const [oscOpen, setOscOpen] = useState(true);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simResults = useCircuitStore((s) => s.simResults);
  const components = useCircuitStore((s) => s.circuit.components);
  const probeCount = useCircuitStore((s) => s.probes.length);
  const hasCircuit = Object.keys(components).length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const s = useCircuitStore.getState();
        if (s.selectedComponentId) s.removeComponent(s.selectedComponentId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-950 text-white flex flex-col select-none">
      <SimLoop />

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
              {simResults && (
                <span className="text-green-600 font-mono ml-1">{simResults.time.toFixed(1)}s</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/40 text-gray-500 text-[10px] font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              SIM STOPPED
            </div>
          )}
        </div>

        <span className="ml-auto text-[10px] text-gray-700 uppercase tracking-widest hidden sm:block">
          interactive electronics lab
        </span>
      </header>

      {!hasCircuit && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 px-6 py-5 text-center max-w-xs pointer-events-auto shadow-2xl">
            <div className="text-2xl mb-2 text-gray-600">{'\u22B9'}</div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Welcome to CircuitLab</h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Select a tool from the left sidebar and click on the grid to place components.
              <br /><br />
              Use <span className="text-blue-400 font-medium">Wire</span> to connect terminals (circles).<br />
              Press <span className="text-green-400 font-medium">Start</span> to run.
            </p>
            <button
              onClick={() => useCircuitStore.getState().setActiveTool('resistor')}
              className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium transition-colors pointer-events-auto"
            >
              Place first component
            </button>
            <button
              onClick={loadDemo}
              className="mt-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-medium transition-colors pointer-events-auto w-full"
            >
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
            <CircuitCanvas width={canvasWidth} height={canvasHeight} />
            {simulationRunning && simResults && (
              <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-green-900/40 px-2.5 py-1.5 text-[10px] shadow-lg pointer-events-none">
                <div className="flex items-center gap-2 text-green-400 font-semibold tracking-wider mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                  <span className="text-green-600 font-mono font-normal">{simResults.time.toFixed(2)}s</span>
                </div>
                <div className="text-gray-500 leading-relaxed">
                  {Object.keys(simResults.nodeVoltages).length - 1} nodes &middot; {Object.keys(simResults.branchCurrents).length} branches
                  <br />
                  Click a component to see V & I values on canvas
                </div>
              </div>
            )}
          </div>

          <div className={`border-t border-gray-800 bg-gray-900/90 backdrop-blur-sm transition-all duration-200 ${oscOpen ? 'h-52' : 'h-8'}`}>
            <button
              onClick={() => setOscOpen(!oscOpen)}
              className="w-full h-8 flex items-center justify-between px-4 text-xs text-gray-500 hover:text-gray-300 transition-colors border-b border-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-medium">Oscilloscope</span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-600">multi-channel viewer</span>
                {probeCount > 0 && (
                  <span className="text-gray-600 font-mono">{probeCount} probes</span>
                )}
              </div>
              <span className="text-sm">{oscOpen ? '\u25BC' : '\u25B2'}</span>
            </button>
            {oscOpen && <div className="h-[calc(100%-32px)]"><Oscilloscope /></div>}
          </div>
        </main>

        <aside className="w-56 bg-gray-900/80 border-l border-gray-800 shrink-0 overflow-y-auto backdrop-blur-sm">
          <div className="h-9 flex items-center justify-between px-3 border-b border-gray-800 text-xs text-gray-500 font-medium uppercase tracking-wider">
            <span>Properties</span>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${simulationRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`} />
              <span className="text-[9px] text-gray-700">{simulationRunning ? 'LIVE' : 'IDLE'}</span>
            </div>
          </div>
          <PropertiesPanel />
        </aside>
      </div>

      <StatusBar />
    </div>
  );
}


