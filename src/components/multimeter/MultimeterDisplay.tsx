import { useMultimeter } from '../../hooks/useMultimeter';
import { useCircuit } from '../../hooks/useCircuit';

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

export function MultimeterDisplay() {
  const { selectedComp } = useCircuit();
  const { readComponent, isRunning } = useMultimeter();

  if (!selectedComp) {
    return (
      <div className="p-4 text-xs text-slate-500 text-center mt-8">
        Selecciona un componente para medir
      </div>
    );
  }

  const r = readComponent(selectedComp);

  return (
    <div className="p-3 space-y-3">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`} />
        Multímetro — {selectedComp.label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-800 rounded-lg p-2.5 border border-surface-700">
          <div className="text-[9px] text-slate-500 mb-1">Voltaje</div>
          <div className="text-base font-mono text-primary-400 font-bold">{fmtV(r.voltage)}</div>
          <div className="text-[8px] text-slate-600 mt-0.5">DC</div>
        </div>
        <div className="bg-surface-800 rounded-lg p-2.5 border border-surface-700">
          <div className="text-[9px] text-slate-500 mb-1">Corriente</div>
          <div className="text-base font-mono text-cyan-400 font-bold">{fmtI(r.current)}</div>
          <div className="text-[8px] text-slate-600 mt-0.5">DC</div>
        </div>
      </div>
      {isRunning && (
        <div className="bg-surface-800 rounded-lg p-2 border border-surface-700">
          <div className="text-[9px] text-slate-500 mb-1">Potencia</div>
          <div className="text-sm font-mono text-emerald-400 font-bold">
            {Math.abs(r.voltage * r.current) >= 1
              ? `${(r.voltage * r.current).toFixed(3)} W`
              : `${(r.voltage * r.current * 1e3).toFixed(2)} mW`}
          </div>
        </div>
      )}
    </div>
  );
}
