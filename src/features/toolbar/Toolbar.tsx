import { useCircuitStore } from '../../store/circuitStore';
import type { ComponentType } from '../../core/types';

interface ToolDef {
  id: ComponentType | 'select' | 'wire' | 'probe';
  label: string;
  icon: string;
  hint: string;
}

const tools: ToolDef[] = [
  { id: 'select', label: 'Select', icon: '\u22B9', hint: 'Select & drag components' },
  { id: 'resistor', label: 'Resistor', icon: '\u238D', hint: 'Place resistor' },
  { id: 'capacitor', label: 'Capacitor', icon: '\u2016', hint: 'Place capacitor' },
  { id: 'inductor', label: 'Inductor', icon: '\u2248', hint: 'Place inductor' },
  { id: 'voltageSource', label: 'Battery', icon: '\u23FB', hint: 'Place DC voltage source' },
  { id: 'currentSource', label: 'CurrentSrc', icon: '\u2299', hint: 'Place DC current source' },
  { id: 'led', label: 'LED', icon: '\u2605', hint: 'Place LED (lights up with current)' },
  { id: 'switch', label: 'Switch', icon: '\u23CE', hint: 'Place switch' },
  { id: 'ground', label: 'Ground', icon: '\u22A5', hint: 'Place ground (0V reference)' },
  { id: 'wire', label: 'Wire', icon: '\u2571', hint: 'Connect terminals with wires' },
  { id: 'probe', label: 'Probe', icon: '\u25C9', hint: 'Add oscilloscope probe' },
];

export function Toolbar() {
  const activeTool = useCircuitStore((s) => s.activeTool);
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const toggleSimulation = useCircuitStore((s) => s.toggleSimulation);

  return (
    <div className="flex flex-col gap-0.5 py-2 px-2">
      <div className="text-[10px] text-gray-600 uppercase tracking-widest text-center mb-1 font-semibold">
        Tools
      </div>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={`
            group relative flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-sm
            transition-all duration-150
            ${activeTool === tool.id
              ? 'bg-gradient-to-r from-blue-600/90 to-blue-700/80 text-white shadow-sm shadow-blue-600/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }
          `}
        >
          <span className="text-sm w-5 text-center shrink-0">{tool.icon}</span>
          <span className="text-[11px] font-medium tracking-wide">{tool.label}</span>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-gray-800 rounded-lg shadow-xl border border-gray-700 text-[11px] text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
            {tool.hint}
          </div>
        </button>
      ))}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2 mx-1" />
      <div className="text-[10px] text-gray-600 uppercase tracking-widest text-center mb-0.5 font-semibold">
        Run
      </div>
      <button
        onClick={toggleSimulation}
        className={`
          group relative flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-sm
          transition-all duration-150
          ${simulationRunning
            ? 'bg-gradient-to-r from-red-600/90 to-red-700/80 text-white shadow-sm shadow-red-600/20'
            : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
          }
        `}
      >
        <span className="text-sm w-5 text-center shrink-0">{simulationRunning ? '\u23F9' : '\u25B6'}</span>
        <span className="text-[11px] font-medium tracking-wide">{simulationRunning ? 'Stop' : 'Start'}</span>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-gray-800 rounded-lg shadow-xl border border-gray-700 text-[11px] text-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
          {simulationRunning ? 'Stop simulation' : 'Run simulation @ 60fps'}
        </div>
      </button>
    </div>
  );
}
