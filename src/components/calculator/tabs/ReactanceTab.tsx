import { useState } from 'react';
import { FormulaHint } from '../FormulaHint';
import { fmt } from '../format';

export function ReactanceTab() {
  const [lVal, setLVal] = useState('1e-3');
  const [cVal, setCVal] = useState('1e-6');
  const [freq, setFreq] = useState('60');

  const L = (n => isNaN(n) ? 1e-9 : n)(parseFloat(lVal));
  const C = (n => isNaN(n) ? 1e-12 : n)(parseFloat(cVal));
  const f = (n => isNaN(n) ? 60 : n)(parseFloat(freq));
  const xl = 2 * Math.PI * f * L;
  const xc = 1 / (2 * Math.PI * f * C);
  const fr = 1 / (2 * Math.PI * Math.sqrt(L * C));

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Reactancia y Resonancia
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'L (H)', val: lVal, set: setLVal },
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
      <div className="bg-surface-800 border border-gold-300 rounded-lg p-2 space-y-1 text-[10px]">
        <div>
          <span className="text-surface-500">Xl = 2πfL:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(xl, 'Ω', 2)}</span>
        </div>
        <div>
          <span className="text-surface-500">Xc = 1/(2πfC):</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(xc, 'Ω', 2)}</span>
        </div>
        <div>
          <span className="text-surface-500">f_res = 1/(2π√LC):</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(fr, 'Hz', 2)}</span>
        </div>
        <div className="pt-1 border-t border-gold-300">
          <span className="text-surface-500">|Xl - Xc|:</span>{' '}
          <span className="font-mono text-ink">{fmt(Math.abs(xl - xc), 'Ω', 2)}</span>
        </div>
      </div>
      <FormulaHint
        lines={[
          { eq: 'X_L = 2π · f · L', note: 'bobina en AC' },
          { eq: 'X_C = 1 / (2π · f · C)', note: 'condensador en AC' },
          { eq: 'f₀ = 1 / (2π√(LC))', note: 'resonancia' },
        ]}
      />
    </div>
  );
}
