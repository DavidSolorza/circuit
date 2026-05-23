import { useCircuitStore } from '../../store/circuitStore';
import { COMPONENT_TEMPLATES } from '../../core/constants';

export function PropertiesPanel() {
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const component = useCircuitStore((s) =>
    s.selectedComponentId ? s.circuit.components[s.selectedComponentId] : null,
  );
  const updateParam = useCircuitStore((s) => s.updateComponentParam);
  const removeComponent = useCircuitStore((s) => s.removeComponent);
  const rotateComponent = useCircuitStore((s) => s.rotateComponent);
  const addProbe = useCircuitStore((s) => s.addProbe);
  const simResults = useCircuitStore((s) => s.simResults);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const terminals = useCircuitStore((s) => s.circuit.terminals);

  if (!component) {
    return (
      <div className="p-4 text-gray-600 text-xs text-center mt-12 leading-relaxed">
        <div className="text-2xl mb-3 text-gray-700">{'\u22B9'}</div>
        <p>Select a component</p>
        <p className="mt-1">on the canvas to edit</p>
        <p className="mt-1">its properties here</p>
      </div>
    );
  }

  const template = COMPONENT_TEMPLATES[component.type];

  const typeColors: Record<string, string> = {
    resistor: 'from-violet-600 to-violet-700',
    capacitor: 'from-cyan-600 to-cyan-700',
    voltageSource: 'from-red-600 to-red-700',
    led: 'from-yellow-500 to-yellow-600',
    switch: 'from-emerald-600 to-emerald-700',
    ground: 'from-gray-600 to-gray-700',
  };

  return (
    <div className="p-3 text-sm">
      <div className={`h-1 rounded-full bg-gradient-to-r ${typeColors[component.type] ?? 'from-blue-600 to-blue-700'} mb-3`} />

      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${typeColors[component.type] ?? 'from-blue-500 to-blue-600'} shadow-sm`} />
        <h3 className="text-white font-medium text-sm">{component.label}</h3>
        <span className="text-[10px] text-gray-600 ml-auto uppercase tracking-wider">
          {component.type}
        </span>
      </div>

      <div className="space-y-3">
        {template.paramDefs.map((def) => {
          const value = component.params[def.key] ?? def.min;
          const isBoolean = def.key === 'isClosed';

          return (
            <div key={def.key}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-500 text-[11px] uppercase tracking-wider">
                  {def.label}
                </label>
                <span className="text-gray-300 text-xs tabular-nums font-mono">
                  {isBoolean ? '' : formatDisplayValue(value, def.unit)}
                </span>
              </div>
              {isBoolean ? (
                <button
                  onClick={() => updateParam(component.id, def.key, value ? 0 : 1)}
                  className={`
                    w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                    ${value
                      ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-600/50 shadow-sm shadow-emerald-600/10'
                      : 'bg-gray-800/50 text-gray-500 border border-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${value ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    {value ? 'ON (Closed)' : 'OFF (Open)'}
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={def.min}
                    max={def.max}
                    step={def.step}
                    value={value}
                    onChange={(e) =>
                      updateParam(component.id, def.key, parseFloat(e.target.value))
                    }
                    className="flex-1 accent-blue-500"
                  />
                </div>
              )}
            </div>
          );
        })}

        {simulationRunning && simResults && (() => {
          const t0 = terminals[component.terminalIds[0]];
          const t1 = terminals[component.terminalIds[1]];
          if (!t0) return null;
          const v0 = simResults.nodeVoltages[t0.nodeId] ?? 0;
          const v1 = t1 ? (simResults.nodeVoltages[t1.nodeId] ?? 0) : 0;
          const voltage = v0 - v1;
          const current = simResults.branchCurrents[component.id] ?? 0;
          const absI = Math.abs(current);
          let iStr: string;
          if (absI >= 1) iStr = `${absI.toFixed(3)} A`;
          else if (absI >= 1e-3) iStr = `${(absI * 1e3).toFixed(2)} mA`;
          else if (absI >= 1e-6) iStr = `${(absI * 1e6).toFixed(1)} \u00B5A`;
          else iStr = `${(absI * 1e9).toFixed(1)} nA`;
          const vAbs = Math.abs(voltage);
          let vStr: string;
          if (vAbs >= 1) vStr = `${voltage.toFixed(3)} V`;
          else if (vAbs >= 1e-3) vStr = `${(voltage * 1e3).toFixed(2)} mV`;
          else vStr = `${(voltage * 1e6).toFixed(1)} \u00B5V`;

          return (
            <div className="border-t border-gray-800 pt-3 mt-4">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
                <span>{'\u25A0'}</span> Multimeter
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-900/80 rounded-lg p-2 border border-gray-800">
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-0.5">Voltage</div>
                  <div className="text-sm font-mono font-bold text-blue-400 tabular-nums">{vStr}</div>
                </div>
                <div className="bg-gray-900/80 rounded-lg p-2 border border-gray-800">
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-0.5">Current</div>
                  <div className="text-sm font-mono font-bold text-amber-400 tabular-nums">{iStr}</div>
                </div>
              </div>
              <div className="mt-1.5 text-[10px] text-gray-700 text-center">
                {current >= 0 ? 'Terminal 0 \u2192 Terminal 1' : 'Terminal 1 \u2192 Terminal 0'}
              </div>
            </div>
          );
        })()}

        <div className="border-t border-gray-800 pt-3 mt-4 space-y-1.5">
          <button
            onClick={() => rotateComponent(component.id)}
            className="w-full px-3 py-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg text-gray-400 hover:text-white text-xs transition-all duration-150 flex items-center justify-center gap-2"
          >
            <span>{'\u21BB'}</span>
            <span>Rotate 90\u00B0</span>
          </button>
          <button
            onClick={() => addProbe('voltage', component.id, 0)}
            className="w-full px-3 py-2 bg-blue-900/20 hover:bg-blue-900/40 rounded-lg text-blue-400 hover:text-blue-300 text-xs transition-all duration-150 flex items-center justify-center gap-2"
          >
            <span>{'\u25C9'}</span>
            <span>+ Voltage Probe</span>
          </button>
          <button
            onClick={() => addProbe('current', component.id)}
            className="w-full px-3 py-2 bg-amber-900/20 hover:bg-amber-900/40 rounded-lg text-amber-400 hover:text-amber-300 text-xs transition-all duration-150 flex items-center justify-center gap-2"
          >
            <span>{'\u25C9'}</span>
            <span>+ Current Probe</span>
          </button>
          <button
            onClick={() => removeComponent(component.id)}
            className="w-full px-3 py-2 bg-red-900/20 hover:bg-red-900/40 rounded-lg text-red-400 hover:text-red-300 text-xs transition-all duration-150 flex items-center justify-center gap-2 mt-2"
          >
            <span>{'\u2716'}</span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDisplayValue(v: number, unit: string): string {
  if (unit === 'F') {
    if (v >= 1) return `${v.toFixed(3)} F`;
    if (v >= 1e-3) return `${(v * 1e3).toFixed(1)} mF`;
    if (v >= 1e-6) return `${(v * 1e6).toFixed(1)} \u00B5F`;
    if (v >= 1e-9) return `${(v * 1e9).toFixed(1)} nF`;
    return `${(v * 1e12).toFixed(1)} pF`;
  }
  if (unit === '\u03A9') {
    if (v >= 1e6) return `${(v / 1e6).toFixed(2)} M\u03A9`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)} k\u03A9`;
    return `${v.toFixed(0)} \u03A9`;
  }
  if (unit === 'V') return `${v.toFixed(1)} V`;
  return `${v}${unit}`;
}
