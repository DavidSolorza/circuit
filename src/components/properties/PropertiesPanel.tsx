import { useCircuitStore } from '../../store/circuitStore';
import { COMPONENT_TEMPLATES } from '../../core/constants';
import { useMultimeter } from '../../hooks/useMultimeter';

function fmtV(v: number): string {
  const a = Math.abs(v);
  if (a >= 1) return `${v.toFixed(3)} V`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(2)} mV`;
  return `${(v * 1e6).toFixed(1)} \u00B5V`;
}

function fmtI(v: number): string {
  const a = Math.abs(v);
  if (a >= 1) return `${v.toFixed(3)} A`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(2)} mA`;
  if (a >= 1e-6) return `${(v * 1e6).toFixed(1)} \u00B5A`;
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
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simResults = useCircuitStore((s) => s.simResults);
  const { readComponent } = useMultimeter();

  if (!comp) {
    return (
      <div className="p-4 text-xs text-slate-500 text-center mt-8">
        Ningún componente seleccionado
      </div>
    );
  }

  const template = COMPONENT_TEMPLATES[comp.type];
  const readings = readComponent(comp);
  const simOk = simulationRunning && simResults?.status.success;

  return (
    <div className="p-3 space-y-3">
      <div className="space-y-1">
        <div className="text-xs font-medium text-slate-300 uppercase tracking-wider">
          {template?.label ?? comp.type}
        </div>
        <div className="text-[9px] text-slate-600 font-mono">ID: {comp.id.slice(0, 12)}</div>
        <div className="text-[9px] text-slate-600 font-mono">
          Pos: ({Math.round(comp.position.x)}, {Math.round(comp.position.y)}) · Rot: {comp.rotation}°
        </div>
      </div>

      {template?.paramDefs && template.paramDefs.length > 0 && (
        <div className="space-y-2 bg-surface-800 rounded-lg p-2.5 border border-surface-700">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider">Parámetros</div>
          {template.paramDefs.map((def) => (
            <div key={def.key}>
              <label className="text-[9px] text-slate-400">{def.label} ({def.unit})</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  value={comp.params[def.key] ?? def.min}
                  onChange={(e) => updateParam(comp.id, def.key, parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <span className="text-[10px] text-slate-400 font-mono w-16 text-right">
                  {comp.params[def.key]?.toFixed(def.step < 1 ? (def.key === 'capacitance' || def.key === 'inductance' ? 8 : 1) : 0)}
                </span>
              </div>
            </div>
          ))}
          {comp.type === 'switch' && (
            <button
              onClick={() => updateParam(comp.id, 'isClosed', comp.params.isClosed ? 0 : 1)}
              className={`w-full py-1 rounded text-[10px] font-semibold transition-colors ${
                comp.params.isClosed ? 'bg-green-700/50 text-green-300 border border-green-600/50' : 'bg-surface-700 text-slate-400 border border-surface-600'
              }`}
            >
              {comp.params.isClosed ? 'ENCENDIDO' : 'APAGADO'}
            </button>
          )}
        </div>
      )}

      {simOk && (
        <div className="bg-surface-800 rounded-lg p-2.5 border border-surface-700 space-y-2">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Mediciones
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-900/50 rounded p-1.5">
              <div className="text-[8px] text-slate-600">Voltaje</div>
              <div className="text-xs font-mono text-primary-400">{fmtV(readings.voltage)}</div>
            </div>
            <div className="bg-surface-900/50 rounded p-1.5">
              <div className="text-[8px] text-slate-600">Corriente</div>
              <div className="text-xs font-mono text-cyan-400">{fmtI(readings.current)}</div>
            </div>
            <div className="bg-surface-900/50 rounded p-1.5 col-span-2">
              <div className="text-[8px] text-slate-600">Potencia</div>
              <div className="text-xs font-mono text-emerald-400">
                {Math.abs(readings.voltage * readings.current) >= 1
                  ? `${(readings.voltage * readings.current).toFixed(3)} W`
                  : `${(readings.voltage * readings.current * 1e3).toFixed(2)} mW`}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-surface-700" />

      <div className="grid grid-cols-3 gap-1">
        <button onClick={() => rotate(comp.id)} className="px-1.5 py-1 rounded text-[9px] bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700 transition-colors border border-surface-700" title="Rotar">
          ↻ Rotar
        </button>
        <button onClick={() => duplicate(comp.id)} className="px-1.5 py-1 rounded text-[9px] bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700 transition-colors border border-surface-700" title="Duplicar">
          ⊞ Duplicar
        </button>
        <button onClick={() => addProbe('voltage', comp.id, 0)} className="px-1.5 py-1 rounded text-[9px] bg-rose-900/30 text-rose-400 hover:bg-rose-800/50 transition-colors border border-rose-800/50" title="Añadir sonda">
          ⚡ Sonda
        </button>
      </div>

      <button onClick={() => remove(comp.id)} className="w-full py-1.5 rounded text-[10px] bg-red-900/30 text-red-400 hover:bg-red-800/50 transition-colors border border-red-800/50">
        Eliminar componente
      </button>
    </div>
  );
}
