import { useState } from 'react';
import { FormulaHint } from '../FormulaHint';
import { fmt } from '../format';

export function DividerTab() {
  const [r1, setR1] = useState('1000');
  const [r2, setR2] = useState('2000');
  const [vin, setVin] = useState('9');
  const [iTotal, setITotal] = useState('0.01');

  const R1 = parseFloat(r1) || 0;
  const R2 = parseFloat(r2) || 0;
  const Vin = parseFloat(vin) || 0;
  const It = parseFloat(iTotal) || 0;
  const sum = R1 + R2;
  const vOut = sum > 0 ? (Vin * R2) / sum : 0;
  const iIn = sum > 0 ? Vin / sum : 0;
  const i2 = R1 + R2 > 0 ? (It * R1) / (R1 + R2) : 0;
  const i1 = It - i2;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Divisores de voltaje y corriente
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-surface-500">R₁ (Ω)</label>
          <input
            value={r1}
            onChange={(e) => setR1(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-ink"
          />
        </div>
        <div>
          <label className="text-[9px] text-surface-500">R₂ (Ω)</label>
          <input
            value={r2}
            onChange={(e) => setR2(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-ink"
          />
        </div>
      </div>
      <div className="bg-surface-800 rounded-lg p-2.5 border border-surface-700 space-y-2 text-[10px]">
        <div className="font-medium text-ink">Divisor de voltaje</div>
        <div className="flex items-center gap-2">
          <label className="text-surface-500">V_in</label>
          <input
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            className="w-20 px-2 py-0.5 text-xs bg-surface-900 border border-surface-700 rounded font-mono"
          />
        </div>
        <div>
          V_out = V_in·R₂/(R₁+R₂):{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(vOut, 'V')}</span>
        </div>
        <div>
          I_entrada = V_in/(R₁+R₂):{' '}
          <span className="font-mono text-ink">{fmt(iIn, 'A')}</span>
        </div>
        <div className="pt-2 border-t border-surface-700 font-medium text-ink">
          Divisor de corriente (paralelo)
        </div>
        <div className="flex items-center gap-2">
          <label className="text-surface-500">I_total</label>
          <input
            value={iTotal}
            onChange={(e) => setITotal(e.target.value)}
            className="w-20 px-2 py-0.5 text-xs bg-surface-900 border border-surface-700 rounded font-mono"
          />
        </div>
        <div>
          I₁ = I·R₂/(R₁+R₂): <span className="font-mono text-ink">{fmt(i1, 'A')}</span>
        </div>
        <div>
          I₂ = I·R₁/(R₁+R₂): <span className="font-mono text-ink">{fmt(i2, 'A')}</span>
        </div>
      </div>
      <FormulaHint
        lines={[
          { eq: 'V_out = V_in · R₂ / (R₁ + R₂)', note: 'voltímetro / potenciómetro' },
          { eq: 'I₂ = I_total · R₁ / (R₁ + R₂)', note: 'rama en paralelo' },
        ]}
      />
    </div>
  );
}
