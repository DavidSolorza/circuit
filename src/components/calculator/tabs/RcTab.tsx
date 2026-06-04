import { useState } from 'react';
import { fmt } from '../format';

export function RcTab() {
  const [rVal, setRVal] = useState('1000');
  const [cVal, setCVal] = useState('1e-6');
  const [freq, setFreq] = useState('60');

  const R = parseFloat(rVal) || 1000;
  const C = parseFloat(cVal) || 1e-12;
  const f = parseFloat(freq) || 60;
  const tau = R * C;
  const fc = 1 / (2 * Math.PI * R * C);
  const xc = 1 / (2 * Math.PI * f * C);
  const z = Math.sqrt(R * R + xc * xc);
  const phi = (-Math.atan2(xc, R) * 180) / Math.PI;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Circuito RC
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'R (Ω)', val: rVal, set: setRVal },
          { label: 'C (F)', val: cVal, set: setCVal },
          { label: 'f (Hz)', val: freq, set: setFreq },
        ].map((f2) => (
          <div key={f2.label}>
            <label className="text-[9px] text-surface-500">{f2.label}</label>
            <input
              value={f2.val}
              onChange={(e) => f2.set(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-ink"
            />
          </div>
        ))}
      </div>
      <div className="bg-surface-800 border border-primary-300 rounded-lg p-2 space-y-1 text-[10px]">
        <div>
          <span className="text-surface-500">τ = RC:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(tau, 's')}</span>
        </div>
        <div>
          <span className="text-surface-500">f_c = 1/(2πRC):</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(fc, 'Hz', 2)}</span>
        </div>
        <div>
          <span className="text-surface-500">Xc @ {fmt(f, 'Hz', 0)}:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(xc, 'Ω', 2)}</span>
        </div>
        <div>
          <span className="text-surface-500">Impedancia Z:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(z, 'Ω', 2)}</span>
        </div>
        <div>
          <span className="text-surface-500">Fase φ:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{phi.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
}
