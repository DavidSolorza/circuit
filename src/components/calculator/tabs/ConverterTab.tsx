import { useState } from 'react';
import { FormulaHint } from '../FormulaHint';
import { fmt } from '../format';

export function ConverterTab() {
  const [vVal, setVVal] = useState('9');
  const [iVal, setIVal] = useState('0.5');
  const [rVal, setRVal] = useState('1000');

  const V = parseFloat(vVal) || 0;
  const I = parseFloat(iVal) || 0;
  const R = parseFloat(rVal) || 1;
  const fHz = 60;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Conversor de Unidades
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Voltaje (V)', val: vVal, set: setVVal },
          { label: 'Corriente (A)', val: iVal, set: setIVal },
          { label: 'Resistencia (Ω)', val: rVal, set: setRVal },
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
      <div className="bg-surface-800 border border-primary-300 rounded-lg p-2 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="text-surface-500">Potencia (V·I):</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(V * I, 'W')}</span>
        </div>
        <div>
          <span className="text-surface-500">I = V/R:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(V / R, 'A')}</span>
        </div>
        <div>
          <span className="text-surface-500">R = V/I:</span>{' '}
          <span className="font-mono font-bold text-primary-500">{fmt(V / I, 'Ω')}</span>
        </div>
        <div>
          <span className="text-surface-500">T = 1/f:</span>{' '}
          <span className="font-mono font-bold text-gold-500">{fmt(1 / fHz, 's')}</span>
        </div>
      </div>
      <FormulaHint
        lines={[
          { eq: '1 mA = 10⁻³ A', note: 'corriente' },
          { eq: '1 kΩ = 10³ Ω', note: 'resistencia' },
          { eq: 'T = 1 / f', note: 'periodo a 60 Hz → 16,7 ms' },
        ]}
      />
    </div>
  );
}
