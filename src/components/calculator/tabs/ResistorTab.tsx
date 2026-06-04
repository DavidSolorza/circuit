import { useState } from 'react';
import { fmt } from '../format';

export function ResistorTab() {
  const [r1, setR1] = useState('1000');
  const [r2, setR2] = useState('2000');
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const [vin, setVin] = useState('9');

  const R1 = parseFloat(r1) || 0;
  const R2 = parseFloat(r2) || 0;
  const series = R1 + R2;
  const parallel = R1 > 0 && R2 > 0 ? (R1 * R2) / (R1 + R2) : 0;
  const vOut = mode === 'parallel' && R1 + R2 > 0 ? (parseFloat(vin) * R2) / (R1 + R2) : 0;
  const iTotal = R1 + R2 > 0 ? parseFloat(vin) / (R1 + R2) : 0;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Calculadora de Resistencias
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-surface-500">R1 (Ω)</label>
          <input
            value={r1}
            onChange={(e) => setR1(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-ink"
          />
        </div>
        <div>
          <label className="text-[9px] text-surface-500">R2 (Ω)</label>
          <input
            value={r2}
            onChange={(e) => setR2(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-ink"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setMode('series')}
          className={`px-3 py-1 text-[10px] rounded font-medium ${mode === 'series' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-500 border border-surface-700'}`}
        >
          Serie
        </button>
        <button
          onClick={() => setMode('parallel')}
          className={`px-3 py-1 text-[10px] rounded font-medium ${mode === 'parallel' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-500 border border-surface-700'}`}
        >
          Paralelo
        </button>
      </div>
      <div className="bg-surface-800 rounded-lg p-2 border border-surface-700 space-y-1 text-[10px]">
        <div>
          <span className="text-surface-500">Serie:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(series, 'Ω')}</span>
        </div>
        <div>
          <span className="text-surface-500">Paralelo:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(parallel, 'Ω')}</span>
        </div>
        {mode === 'parallel' && (
          <div className="mt-1 pt-1 border-t border-surface-700">
            <label className="text-surface-500">Vin (V):</label>
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              className="ml-1 w-16 px-1 py-0.5 text-[10px] bg-surface-800 border border-surface-700 rounded font-mono text-ink"
            />
            <div className="mt-1">
              Vout = <span className="font-mono font-bold text-primary-500">{fmt(vOut, 'V')}</span>{' '}
              (divisor)
            </div>
            <div>
              I total = <span className="font-mono text-ink">{fmt(iTotal, 'A')}</span>
            </div>
          </div>
        )}
        {mode === 'series' && series > 0 && (
          <div className="mt-1 pt-1 border-t border-surface-700">
            <label className="text-surface-500">Vin (V):</label>
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              className="ml-1 w-16 px-1 py-0.5 text-[10px] bg-surface-800 border border-surface-700 rounded font-mono text-ink"
            />
            <div className="mt-1">
              VR1 ={' '}
              <span className="font-mono font-bold text-primary-500">
                {fmt((parseFloat(vin) * R1) / series, 'V')}
              </span>
              , VR2 ={' '}
              <span className="font-mono font-bold text-primary-500">
                {fmt((parseFloat(vin) * R2) / series, 'V')}
              </span>
            </div>
          </div>
        )}
        {mode === 'series' && series === 0 && (
          <div className="mt-1 pt-1 border-t border-surface-700 text-surface-500">
            Ambas resistencias no pueden ser 0 Ω.
          </div>
        )}
      </div>
    </div>
  );
}
