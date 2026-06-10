import { useState } from 'react';
import { FormulaHint } from '../FormulaHint';
import { fmt } from '../format';

function num(raw: string, fallback = 0): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function OhmTab() {
  const [v, setV] = useState('9');
  const [i, setI] = useState('0.011');
  const [r, setR] = useState('818');

  const vN = num(v);
  const iN = num(i);
  const rN = num(r, 1);
  const calcV = iN * rN;
  const calcI = rN !== 0 ? vN / rN : NaN;
  const calcR = iN !== 0 ? vN / iN : NaN;
  const calcP = vN * iN;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Ley de Ohm y Potencia
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Voltaje (V)', val: v, set: setV },
          { label: 'Corriente (A)', val: i, set: setI },
          { label: 'Resistencia (Ω)', val: r, set: setR },
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
      <div className="bg-surface-800 rounded-lg p-2 border border-surface-700 grid grid-cols-4 gap-2 text-[10px]">
        <div>
          <span className="text-surface-500">V = I·R</span>
          <br />
          <span className="font-mono font-bold text-primary-500">{fmt(calcV, 'V')}</span>
        </div>
        <div>
          <span className="text-surface-500">I = V/R</span>
          <br />
          <span className="font-mono font-bold text-primary-500">{fmt(calcI, 'A')}</span>
        </div>
        <div>
          <span className="text-surface-500">R = V/I</span>
          <br />
          <span className="font-mono font-bold text-primary-500">{fmt(calcR, 'Ω')}</span>
        </div>
        <div>
          <span className="text-surface-500">P = V·I</span>
          <br />
          <span className="font-mono font-bold text-gold-500">{fmt(calcP, 'W')}</span>
        </div>
      </div>
      <FormulaHint
        lines={[
          { eq: 'V = I · R', note: 'ley de Ohm' },
          { eq: 'I = V / R', note: 'corriente en una rama' },
          { eq: 'P = V · I', note: 'potencia en el multímetro' },
        ]}
      />
    </div>
  );
}
