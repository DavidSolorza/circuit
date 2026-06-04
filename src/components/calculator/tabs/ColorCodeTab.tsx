import { useState } from 'react';
import {
  bandColors,
  bandDigits,
  digitBandKeys,
  fmt,
  multiplierBandKeys,
  toleranceBandKeys,
} from '../format';

export function ColorCodeTab() {
  const [b1, setB1] = useState('brown');
  const [b2, setB2] = useState('black');
  const [b3, setB3] = useState('red');
  const [tol, setTol] = useState('gold');

  const digit1 = bandDigits[b1] ?? 0;
  const digit2 = bandDigits[b2] ?? 0;
  const multiplier = bandColors[b3]?.mult ?? 1;
  const value = (digit1 * 10 + digit2) * multiplier;
  const tolVal = bandColors[tol]?.tol ?? 20;

  const bandOptions = [digitBandKeys, digitBandKeys, multiplierBandKeys, toleranceBandKeys];
  const bandValues = [b1, b2, b3, tol];
  const bandSetters = [setB1, setB2, setB3, setTol];

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Código de Colores
      </div>
      <div className="flex gap-1 justify-center py-2">
        {[b1, b2, b3, tol].map((c, i) => (
          <div
            key={i}
            className="w-5 h-12 rounded-sm border border-surface-700"
            style={{ backgroundColor: bandColors[c]?.hex }}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {['b1', 'b2', 'b3', 'tol'].map((k, i) => (
          <div key={k}>
            <label className="text-[9px] text-surface-500">Banda {i + 1}</label>
            <select
              value={bandValues[i]}
              onChange={(e) => bandSetters[i](e.target.value)}
              className="w-full px-1 py-0.5 text-[10px] bg-surface-800 border border-surface-700 rounded text-ink"
            >
              {bandOptions[i].map((c) => (
                <option key={c} value={c}>
                  {bandColors[c].name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="bg-surface-800 rounded-lg p-2.5 border border-surface-700 space-y-1 text-[10px]">
        <div>
          <span className="text-surface-500">Valor:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(value, 'Ω', 2)}</span>
        </div>
        <div>
          <span className="text-surface-500">Tolerancia:</span>{' '}
          <span className="font-mono text-ink">±{tolVal}%</span>
        </div>
        <div>
          <span className="text-surface-500">Rango:</span>{' '}
          <span className="text-surface-500 font-mono">
            {fmt(value * (1 - tolVal / 100), 'Ω', 2)} — {fmt(value * (1 + tolVal / 100), 'Ω', 2)}
          </span>
        </div>
      </div>
    </div>
  );
}
