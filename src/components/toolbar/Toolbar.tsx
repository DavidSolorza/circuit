import { useCallback } from 'react';
import { ResistorSvg, CapacitorSvg, InductorSvg, VoltageSourceSvg, CurrentSourceSvg, LedSvg, SwitchSvg, GroundSvg, getSymbolColor } from '../symbols';
import { COMPONENT_TEMPLATES } from '../../core/constants';
import type { ComponentType, ToolType } from '../../types';
import { useCircuitStore } from '../../store/circuitStore';

const tools: Array<{ type: ToolType; label: string; component?: ComponentType }> = [
  { type: 'select', label: 'Select' },
  { type: 'resistor', label: 'Resistor', component: 'resistor' },
  { type: 'capacitor', label: 'Capacitor', component: 'capacitor' },
  { type: 'inductor', label: 'Inductor', component: 'inductor' },
  { type: 'voltageSource', label: 'Battery', component: 'voltageSource' },
  { type: 'currentSource', label: 'Current Src', component: 'currentSource' },
  { type: 'led', label: 'LED', component: 'led' },
  { type: 'switch', label: 'Switch', component: 'switch' },
  { type: 'ground', label: 'Ground', component: 'ground' },
  { type: 'wire', label: 'Wire' },
  { type: 'probe', label: 'Probe' },
];

const toolIcons: Record<string, React.FC<{ size?: number; color?: string }>> = {
  resistor: ResistorSvg,
  capacitor: CapacitorSvg,
  inductor: InductorSvg,
  voltageSource: VoltageSourceSvg,
  currentSource: CurrentSourceSvg,
  led: LedSvg,
  switch: SwitchSvg,
  ground: GroundSvg,
};

export function Toolbar() {
  const activeTool = useCircuitStore((s) => s.activeTool);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);
  const toggleSimulation = useCircuitStore((s) => s.toggleSimulation);
  const undo = useCircuitStore((s) => s.undo);
  const redo = useCircuitStore((s) => s.redo);
  const undoCount = useCircuitStore((s) => s.undoStack.length);
  const redoCount = useCircuitStore((s) => s.redoStack.length);

  const handleDragStart = useCallback((e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setActiveTool('select')}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
            activeTool === 'select' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="M13 13l6 6" />
          </svg>
          <span>Select</span>
        </button>
      </div>

      <div className="h-px bg-gray-800 my-1" />

      <div className="grid grid-cols-2 gap-1">
        {tools.filter(t => t.component).map((tool) => {
          const ct = tool.component!;
          const Icon = toolIcons[ct];
          const isActive = activeTool === ct;
          const color = isActive ? '#fff' : getSymbolColor(ct);
          return (
            <div
              key={ct}
              draggable
              onDragStart={(e) => handleDragStart(e, ct)}
              onClick={() => setActiveTool(ct)}
              className={`flex flex-col items-center justify-center gap-0.5 p-1 rounded-lg cursor-pointer transition-all ${
                isActive ? 'bg-blue-600/20 ring-1 ring-blue-500' : 'hover:bg-gray-800'
              }`}
              title={tool.label}
            >
              {Icon && <Icon size={28} color={color} />}
              <span className={`text-[9px] leading-tight ${isActive ? 'text-blue-300' : 'text-gray-500'}`}>
                {tool.label.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-gray-800 my-1" />

      <button
        onClick={() => setActiveTool('wire')}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
          activeTool === 'wire' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20L20 4" /><path d="M4 4l16 16" /></svg>
        <span>Wire</span>
      </button>

      <button
        onClick={() => setActiveTool('probe')}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
          activeTool === 'probe' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4" /></svg>
        <span>Probe</span>
      </button>

      <div className="h-px bg-gray-800 my-1" />

      <button
        onClick={toggleSimulation}
        className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
          simulationRunning
            ? 'bg-green-600 text-white hover:bg-green-500 animate-pulse'
            : 'bg-emerald-700/60 text-emerald-300 hover:bg-emerald-600'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${simulationRunning ? 'bg-white' : 'bg-emerald-400'}`} />
        {simulationRunning ? 'STOP' : 'START'}
      </button>

      <div className="h-px bg-gray-800 my-1" />

      <div className="flex gap-1">
        <button
          onClick={undo}
          disabled={undoCount === 0}
          className="flex-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Undo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-18-5v0" /></svg>
        </button>
        <button
          onClick={redo}
          disabled={redoCount === 0}
          className="flex-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Redo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0118-5v0" /></svg>
        </button>
      </div>
    </div>
  );
}
