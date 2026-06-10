import { useState } from 'react';
import { FormulaHint } from '../FormulaHint';
import { fmt } from '../format';

export function RlTab() {
  const [rVal, setRVal] = useState('470');
  const [lVal, setLVal] = useState('0.01');
  const [vin, setVin] = useState('9');

  const R = parseFloat(rVal) || 1;
  const L = parseFloat(lVal) || 1e-9;
  const V = parseFloat(vin) || 0;
  const tau = L / R;
  const iFinal = V / R;
  const t63 = tau;
  const t95 = 3 * tau;
  const energy = 0.5 * L * iFinal * iFinal;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Circuito RL (transitorio)
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'R (Ω)', val: rVal, set: setRVal },
          { label: 'L (H)', val: lVal, set: setLVal },
          { label: 'V_in (V)', val: vin, set: setVin },
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
      <div className="bg-surface-800 border border-primary-300 rounded-lg p-2.5 space-y-1 text-[10px]">
        <div>
          <span className="text-surface-500">τ = L/R:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(tau, 's')}</span>
        </div>
        <div>
          <span className="text-surface-500">I_final = V/R:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(iFinal, 'A')}</span>
        </div>
        <div>
          <span className="text-surface-500">t₆₃ ≈ τ:</span>{' '}
          <span className="font-mono text-ink">{fmt(t63, 's')}</span>
        </div>
        <div>
          <span className="text-surface-500">t₉₅ ≈ 3τ:</span>{' '}
          <span className="font-mono text-ink">{fmt(t95, 's')}</span>
        </div>
        <div>
          <span className="text-surface-500">E_L = ½LI²:</span>{' '}
          <span className="font-mono font-bold text-gold-600">{fmt(energy, 'J')}</span>
        </div>
      </div>
      <FormulaHint
        lines={[
          { eq: 'τ = L / R', note: 'constante de tiempo RL' },
          { eq: 'I(t) = I_f · (1 − e^(−t/τ))', note: 'subida de corriente' },
          { eq: 'E_L = ½ · L · I²', note: 'energía en la bobina' },
        ]}
      />
    </div>
  );
}
