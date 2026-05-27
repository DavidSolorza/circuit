import { useCircuitStore } from '../../store/circuitStore';
import { COMPONENT_TEMPLATES } from '../../core/constants';
import { useMultimeter } from '../../hooks/useMultimeter';

function fmtV(v: number): string {
  const a = Math.abs(v);
  if (a >= 1) return `${v.toFixed(3)} V`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(2)} mV`;
  return `${(v * 1e6).toFixed(1)} µV`;
}

function fmtI(v: number): string {
  const a = Math.abs(v);
  if (a >= 1) return `${v.toFixed(3)} A`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(2)} mA`;
  if (a >= 1e-6) return `${(v * 1e6).toFixed(1)} µA`;
  return `${(v * 1e9).toFixed(0)} nA`;
}

export function PropertiesPanel() {
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const components = useCircuitStore((s) => s.circuit.components);
  const comp = selectedId ? components[selectedId] : null;
  const updateParam = useCircuitStore((s) => s.updateComponentParam);
  const rotate = useCircuitStore((s) => s.rotateComponent);
  const duplicate = useCircuitStore((s) => s.duplicateComponent);
  const remove = useCircuitStore((s) => s.removeComponent);
  const addProbe = useCircuitStore((s) => s.addProbe);
  const { readComponent, simulate } = useMultimeter();

  if (!comp) {
    return (
      <div className="p-3 text-xs text-gray-600 text-center mt-8">
        No component selected
      </div>
    );
  }

  const template = COMPONENT_TEMPLATES[comp.type];
  const readings = readComponent(comp);

  return (
    <div className="p-3 space-y-4">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {template.label}
        <span className="text-gray-700 ml-2 normal-case">({comp.id.slice(0, 10)})</span>
      </div>

      {template.paramDefs.map((def) => (
          <div key={def.key}>
            <label className="text-[10px] text-gray-500">{def.label} ({def.unit})</label>
            <input
              type="range"
              min={def.min}
              max={def.max}
              step={def.step}
              value={comp.params[def.key] ?? def.min}
              onChange={(e) => updateParam(comp.id, def.key, parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
            />
            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
              {comp.params[def.key]?.toFixed(def.step < 1 ? (def.key === 'capacitance' || def.key === 'inductance' ? 8 : 1) : 0)} {def.unit}
            </div>
          </div>
      ))}

      {comp.type === 'switch' && (
        <button
          onClick={() => updateParam(comp.id, 'isClosed', comp.params.isClosed ? 0 : 1)}
          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            comp.params.isClosed ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
          }`}
        >
          {comp.params.isClosed ? 'ON' : 'OFF'}
        </button>
      )}

      {simulate && (
        <div className="border border-gray-800 rounded-lg p-2.5 space-y-2 bg-gray-900/50">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Multimeter
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[9px] text-gray-600">Voltage</div>
              <div className="text-sm font-mono text-green-400">{fmtV(readings.voltage)}</div>
            </div>
            <div>
              <div className="text-[9px] text-gray-600">Current</div>
              <div className="text-sm font-mono text-cyan-400">{fmtI(readings.current)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-gray-800" />

      <div className="grid grid-cols-3 gap-1.5">
        <button onClick={() => rotate(comp.id)} className="px-2 py-1.5 rounded-lg text-[10px] bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors" title="Rotate">
          ↻ Rotate
        </button>
        <button onClick={() => duplicate(comp.id)} className="px-2 py-1.5 rounded-lg text-[10px] bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors" title="Duplicate">
          ⊞ Duplicate
        </button>
        <button onClick={() => addProbe('voltage', comp.id, 0)} className="px-2 py-1.5 rounded-lg text-[10px] bg-rose-900/40 text-rose-400 hover:bg-rose-800/60 transition-colors" title="Add probe">
          ⚡ Probe
        </button>
      </div>

      <button onClick={() => remove(comp.id)} className="w-full py-1.5 rounded-lg text-xs bg-red-900/30 text-red-400 hover:bg-red-800/50 transition-colors">
        Delete component
      </button>
    </div>
  );
}
