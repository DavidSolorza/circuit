import { useState } from 'react';
import { FormulaHint } from '../FormulaHint';
import { fmt } from '../format';

function num(raw: string, fallback = 0): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function PowerTab() {
  const [v, setV] = useState('12');
  const [i, setI] = useState('0.05');
  const [r, setR] = useState('240');

  const V = num(v);
  const I = num(i);
  const R = num(r, 1);

  const pVi = V * I;
  const pI2r = I * I * R;
  const pV2r = R > 0 ? (V * V) / R : NaN;
  const e1s = pVi;
  const e1h = pVi * 3600;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Potencia y energía
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Voltaje V', val: v, set: setV },
          { label: 'Corriente A', val: i, set: setI },
          { label: 'Resistencia Ω', val: r, set: setR },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-[9px] text-surface-500">{f.label}</label>
            <input
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-ink"
            />
          </div>
        ))}
      </div>
      <div className="bg-surface-800 rounded-lg p-2.5 border border-surface-700 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="text-surface-500">P = V·I</span>
          <div className="font-mono font-bold text-primary-500">{fmt(pVi, 'W')}</div>
        </div>
        <div>
          <span className="text-surface-500">P = I²·R</span>
          <div className="font-mono font-bold text-primary-500">{fmt(pI2r, 'W')}</div>
        </div>
        <div>
          <span className="text-surface-500">P = V²/R</span>
          <div className="font-mono font-bold text-primary-500">{fmt(pV2r, 'W')}</div>
        </div>
        <div>
          <span className="text-surface-500">E (1 s)</span>
          <div className="font-mono font-bold text-gold-600">{fmt(e1s, 'J')}</div>
        </div>
        <div className="col-span-2 pt-1 border-t border-surface-700">
          <span className="text-surface-500">E (1 h) = P·3600:</span>{' '}
          <span className="font-mono font-bold text-gold-600">{fmt(e1h, 'J')}</span>
          <span className="text-ink-faint ml-1">({fmt(e1h / 3600, 'Wh')})</span>
        </div>
      </div>
      <FormulaHint
        lines={[
          { eq: 'P = V · I', note: 'potencia instantánea' },
          { eq: 'P = I² · R = V² / R', note: 'en una resistencia pura' },
          { eq: 'E = P · t', note: 'energía en el tiempo' },
        ]}
      />
    </div>
  );
}
