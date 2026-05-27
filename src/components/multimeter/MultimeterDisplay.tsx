import { useMultimeter } from '../../hooks/useMultimeter';
import { useCircuit } from '../../hooks/useCircuit';

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

export function MultimeterDisplay() {
  const { selectedComp } = useCircuit();
  const { readComponent, simulate } = useMultimeter();

  if (!selectedComp) {
    return (
      <div className="p-3 text-xs text-gray-600 text-center">
        Select a component to measure
      </div>
    );
  }

  const r = readComponent(selectedComp);

  return (
    <div className="p-3">
      <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${simulate ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`} />
        Multimeter — {selectedComp.label}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900/60 rounded-lg p-2.5 border border-gray-800">
          <div className="text-[9px] text-gray-600 mb-1">Voltage</div>
          <div className="text-lg font-mono text-green-400 font-bold">{fmtV(r.voltage)}</div>
          <div className="text-[9px] text-gray-700 mt-0.5">DC</div>
        </div>
        <div className="bg-gray-900/60 rounded-lg p-2.5 border border-gray-800">
          <div className="text-[9px] text-gray-600 mb-1">Current</div>
          <div className="text-lg font-mono text-cyan-400 font-bold">{fmtI(r.current)}</div>
          <div className="text-[9px] text-gray-700 mt-0.5">DC</div>
        </div>
      </div>
    </div>
  );
}
