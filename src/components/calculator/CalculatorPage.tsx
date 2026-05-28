import { useState } from 'react';

type CalcTab = 'ohm' | 'resistor' | 'colorcode' | 'rc' | 'reactance' | 'converter' | 'formulas';

function fmt(v: number, u: string, d = 4): string {
  if (!isFinite(v) || isNaN(v)) return '∞';
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(d)} M${u}`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(d)} k${u}`;
  if (a >= 1) return `${v.toFixed(d)} ${u}`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(d)} m${u}`;
  if (a >= 1e-6) return `${(v * 1e6).toFixed(d)} µ${u}`;
  if (a >= 1e-9) return `${(v * 1e9).toFixed(d)} n${u}`;
  return `${(v * 1e12).toFixed(d)} p${u}`;
}

const bandColors: Record<string, { name: string; hex: string; mult: number; tol?: number }> = {
  black:  { name: 'Negro',   hex: '#000000', mult: 1 },
  brown:  { name: 'Marrón',  hex: '#8B4513', mult: 10, tol: 1 },
  red:    { name: 'Rojo',    hex: '#DC143C', mult: 100, tol: 2 },
  orange: { name: 'Naranja', hex: '#FF8C00', mult: 1000 },
  yellow: { name: 'Amarillo',hex: '#FFD700', mult: 10000 },
  green:  { name: 'Verde',   hex: '#228B22', mult: 100000, tol: 0.5 },
  blue:   { name: 'Azul',    hex: '#4169E1', mult: 1000000, tol: 0.25 },
  violet: { name: 'Violeta', hex: '#8B00FF', mult: 10000000, tol: 0.1 },
  gray:   { name: 'Gris',    hex: '#808080', mult: 100000000, tol: 0.05 },
  white:  { name: 'Blanco',  hex: '#FFFFFF', mult: 1000000000 },
  gold:   { name: 'Dorado',  hex: '#DAA520', mult: 0.1, tol: 5 },
  silver: { name: 'Plateado',hex: '#C0C0C0', mult: 0.01, tol: 10 },
};

const colorKeys = Object.keys(bandColors);

function ColorCodeCalc() {
  const [b1, setB1] = useState('brown');
  const [b2, setB2] = useState('black');
  const [b3, setB3] = useState('red');
  const [tol, setTol] = useState('gold');

  const d1 = bandColors[b1]?.mult ?? 1;
  const d2 = bandColors[b2]?.mult ?? 1;
  const m3 = bandColors[b3]?.mult ?? 1;
  const digits = (d1 * 10 + d2) * 1;
  const value = digits * m3;
  const tolVal = bandColors[tol]?.tol ?? 20;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Código de Colores</div>
      <div className="flex gap-1 justify-center py-2">
        {[b1, b2, b3, tol].map((c, i) => (
          <div key={i} className="w-5 h-12 rounded-sm border border-surface-600" style={{ backgroundColor: bandColors[c]?.hex }} />
        ))}
        <div className="w-5 h-12 rounded-sm border border-surface-600" style={{ backgroundColor: '#DAA520' }} />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {['b1', 'b2', 'b3', 'tol'].map((k, i) => (
          <div key={k}>
            <label className="text-[9px] text-slate-500">Banda {i + 1}</label>
            <select value={[b1, b2, b3, tol][i]} onChange={e => {
              const v = [setB1, setB2, setB3, setTol];
              v[i](e.target.value);
            }} className="w-full px-1 py-0.5 text-[10px] bg-surface-800 border border-surface-700 rounded text-slate-300">
              {colorKeys.map(c => <option key={c} value={c}>{bandColors[c].name}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="bg-surface-800 rounded-lg p-2.5 border border-surface-700 space-y-1 text-[10px]">
        <div><span className="text-slate-500">Valor:</span> <span className="font-mono font-bold text-primary-400">{fmt(value, 'Ω', 2)}</span></div>
        <div><span className="text-slate-500">Tolerancia:</span> <span className="font-mono text-slate-300">±{tolVal}%</span></div>
        <div><span className="text-slate-500">Rango:</span> <span className="font-mono text-slate-400">{fmt(value * (1 - tolVal / 100), 'Ω', 2)} — {fmt(value * (1 + tolVal / 100), 'Ω', 2)}</span></div>
      </div>
    </div>
  );
}

function LeyOhm() {
  const [v, setV] = useState('9');
  const [i, setI] = useState('0.011');
  const [r, setR] = useState('818');

  const calcV = parseFloat(i) * parseFloat(r);
  const calcI = parseFloat(v) / parseFloat(r);
  const calcR = parseFloat(v) / parseFloat(i);
  const calcP = parseFloat(v) * parseFloat(i);

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Ley de Ohm y Potencia</div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Voltaje (V)', val: v, set: setV },
          { label: 'Corriente (A)', val: i, set: setI },
          { label: 'Resistencia (Ω)', val: r, set: setR },
        ].map(f => (
          <div key={f.label}>
            <label className="text-[9px] text-slate-500">{f.label}</label>
            <input value={f.val} onChange={e => f.set(e.target.value)} className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-slate-200" />
          </div>
        ))}
      </div>
      <div className="bg-surface-800 rounded-lg p-2 border border-surface-700 grid grid-cols-4 gap-2 text-[10px]">
        <div><span className="text-slate-500">V = I·R</span><br /><span className="font-mono font-bold text-primary-400">{fmt(calcV, 'V')}</span></div>
        <div><span className="text-slate-500">I = V/R</span><br /><span className="font-mono font-bold text-primary-400">{fmt(calcI, 'A')}</span></div>
        <div><span className="text-slate-500">R = V/I</span><br /><span className="font-mono font-bold text-primary-400">{fmt(calcR, 'Ω')}</span></div>
        <div><span className="text-slate-500">P = V·I</span><br /><span className="font-mono font-bold text-primary-400">{fmt(calcP, 'W')}</span></div>
      </div>
    </div>
  );
}

function CalcResistencia() {
  const [r1, setR1] = useState('1000');
  const [r2, setR2] = useState('2000');
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const [vin, setVin] = useState('9');

  const R1 = parseFloat(r1) || 0;
  const R2 = parseFloat(r2) || 0;
  const series = R1 + R2;
  const parallel = R1 > 0 && R2 > 0 ? (R1 * R2) / (R1 + R2) : 0;
  const vOut = mode === 'parallel' && R1 + R2 > 0 ? parseFloat(vin) * R2 / (R1 + R2) : 0;
  const iTotal = R1 + R2 > 0 ? parseFloat(vin) / (R1 + R2) : 0;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Calculadora de Resistencias</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-slate-500">R1 (Ω)</label>
          <input value={r1} onChange={e => setR1(e.target.value)} className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-slate-200" />
        </div>
        <div>
          <label className="text-[9px] text-slate-500">R2 (Ω)</label>
          <input value={r2} onChange={e => setR2(e.target.value)} className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-slate-200" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setMode('series')} className={`px-3 py-1 text-[10px] rounded font-medium ${mode === 'series' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-slate-400 border border-surface-700'}`}>Serie</button>
        <button onClick={() => setMode('parallel')} className={`px-3 py-1 text-[10px] rounded font-medium ${mode === 'parallel' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-slate-400 border border-surface-700'}`}>Paralelo</button>
      </div>
      <div className="bg-surface-800 rounded-lg p-2 border border-surface-700 space-y-1 text-[10px]">
        <div><span className="text-slate-500">Serie:</span> <span className="font-mono font-bold text-primary-400">{fmt(series, 'Ω')}</span></div>
        <div><span className="text-slate-500">Paralelo:</span> <span className="font-mono font-bold text-primary-400">{fmt(parallel, 'Ω')}</span></div>
        {mode === 'parallel' && (
          <div className="mt-1 pt-1 border-t border-surface-700">
            <label className="text-slate-500">Vin (V):</label>
            <input value={vin} onChange={e => setVin(e.target.value)} className="ml-1 w-16 px-1 py-0.5 text-[10px] bg-surface-800 border border-surface-700 rounded font-mono text-slate-200" />
            <div className="mt-1">Vout = <span className="font-mono font-bold text-primary-400">{fmt(vOut, 'V')}</span> (divisor)</div>
            <div>I total = <span className="font-mono text-slate-300">{fmt(iTotal, 'A')}</span></div>
          </div>
        )}
        {mode === 'series' && (
          <div className="mt-1 pt-1 border-t border-surface-700">
            <label className="text-slate-500">Vin (V):</label>
            <input value={vin} onChange={e => setVin(e.target.value)} className="ml-1 w-16 px-1 py-0.5 text-[10px] bg-surface-800 border border-surface-700 rounded font-mono text-slate-200" />
            <div className="mt-1">VR1 = <span className="font-mono font-bold text-primary-400">{fmt(parseFloat(vin) * R1 / series, 'V')}</span>, VR2 = <span className="font-mono font-bold text-primary-400">{fmt(parseFloat(vin) * R2 / series, 'V')}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

function CalcRC() {
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
  const phi = -Math.atan2(xc, R) * 180 / Math.PI;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Circuito RC</div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'R (Ω)', val: rVal, set: setRVal },
          { label: 'C (F)', val: cVal, set: setCVal },
          { label: 'f (Hz)', val: freq, set: setFreq },
        ].map(f2 => (
          <div key={f2.label}>
            <label className="text-[9px] text-slate-500">{f2.label}</label>
            <input value={f2.val} onChange={e => f2.set(e.target.value)} className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-slate-200" />
          </div>
        ))}
      </div>
      <div className="bg-cyan-900/30 rounded-lg p-2 border border-cyan-800/50 space-y-1 text-[10px]">
        <div><span className="text-slate-500">τ = RC:</span> <span className="font-mono font-bold text-cyan-400">{fmt(tau, 's')}</span></div>
        <div><span className="text-slate-500">f_c = 1/(2πRC):</span> <span className="font-mono font-bold text-cyan-400">{fmt(fc, 'Hz', 2)}</span></div>
        <div><span className="text-slate-500">Xc @ {fmt(f, 'Hz', 0)}:</span> <span className="font-mono font-bold text-cyan-400">{fmt(xc, 'Ω', 2)}</span></div>
        <div><span className="text-slate-500">Impedancia Z:</span> <span className="font-mono font-bold text-cyan-400">{fmt(z, 'Ω', 2)}</span></div>
        <div><span className="text-slate-500">Fase φ:</span> <span className="font-mono font-bold text-cyan-400">{phi.toFixed(1)}°</span></div>
      </div>
    </div>
  );
}

function CalcReactancia() {
  const [lVal, setLVal] = useState('1e-3');
  const [cVal, setCVal] = useState('1e-6');
  const [freq, setFreq] = useState('60');

  const L = parseFloat(lVal) || 1e-9;
  const C = parseFloat(cVal) || 1e-12;
  const f = parseFloat(freq) || 60;
  const xl = 2 * Math.PI * f * L;
  const xc = 1 / (2 * Math.PI * f * C);
  const fr = 1 / (2 * Math.PI * Math.sqrt(L * C));

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Reactancia y Resonancia</div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'L (H)', val: lVal, set: setLVal },
          { label: 'C (F)', val: cVal, set: setCVal },
          { label: 'f (Hz)', val: freq, set: setFreq },
        ].map(f2 => (
          <div key={f2.label}>
            <label className="text-[9px] text-slate-500">{f2.label}</label>
            <input value={f2.val} onChange={e => f2.set(e.target.value)} className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-slate-200" />
          </div>
        ))}
      </div>
      <div className="bg-amber-900/30 rounded-lg p-2 border border-amber-800/50 space-y-1 text-[10px]">
        <div><span className="text-slate-500">Xl = 2πfL:</span> <span className="font-mono font-bold text-amber-400">{fmt(xl, 'Ω', 2)}</span></div>
        <div><span className="text-slate-500">Xc = 1/(2πfC):</span> <span className="font-mono font-bold text-amber-400">{fmt(xc, 'Ω', 2)}</span></div>
        <div><span className="text-slate-500">f_res = 1/(2π√LC):</span> <span className="font-mono font-bold text-amber-400">{fmt(fr, 'Hz', 2)}</span></div>
        <div className="pt-1 border-t border-amber-800/50">
          <span className="text-slate-500">|Xl - Xc|:</span> <span className="font-mono text-slate-300">{fmt(Math.abs(xl - xc), 'Ω', 2)}</span>
        </div>
      </div>
    </div>
  );
}

function Convertidor() {
  const [vVal, setVVal] = useState('9');
  const [iVal, setIVal] = useState('0.5');
  const [rVal, setRVal] = useState('1000');

  const V = parseFloat(vVal) || 0;
  const I = parseFloat(iVal) || 0;
  const R = parseFloat(rVal) || 1;
  const fHz = 60;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Conversor de Unidades</div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Voltaje (V)', val: vVal, set: setVVal },
          { label: 'Corriente (A)', val: iVal, set: setIVal },
          { label: 'Resistencia (Ω)', val: rVal, set: setRVal },
        ].map(f2 => (
          <div key={f2.label}>
            <label className="text-[9px] text-slate-500">{f2.label}</label>
            <input value={f2.val} onChange={e => f2.set(e.target.value)} className="w-full px-2 py-1 text-xs bg-surface-800 border border-surface-700 rounded font-mono text-slate-200" />
          </div>
        ))}
      </div>
      <div className="bg-purple-900/30 rounded-lg p-2 border border-purple-800/50 grid grid-cols-2 gap-2 text-[10px]">
        <div><span className="text-slate-500">Potencia (V·I):</span> <span className="font-mono font-bold text-purple-400">{fmt(V * I, 'W')}</span></div>
        <div><span className="text-slate-500">I = V/R:</span> <span className="font-mono font-bold text-purple-400">{fmt(V / R, 'A')}</span></div>
        <div><span className="text-slate-500">R = V/I:</span> <span className="font-mono font-bold text-purple-400">{fmt(V / I, 'Ω')}</span></div>
        <div><span className="text-slate-500">T = 1/f:</span> <span className="font-mono font-bold text-purple-400">{fmt(1 / fHz, 's')}</span></div>
      </div>
    </div>
  );
}

function LibreriaFormulas() {
  const formulas = [
    { name: "Ley de Ohm", eq: "V = I · R", desc: "Voltaje = Corriente × Resistencia", vars: "V [V], I [A], R [Ω]" },
    { name: "Potencia", eq: "P = V · I = I² · R = V² / R", desc: "Potencia eléctrica disipada", vars: "P [W], V [V], I [A], R [Ω]" },
    { name: "LVK", eq: "Σ V_malla = 0", desc: "Suma de voltajes en malla cerrada = 0", vars: "Caídas de voltaje [V]" },
    { name: "LCK", eq: "Σ I_nodo = 0", desc: "Suma de corrientes entrantes = salientes", vars: "Corrientes de rama [A]" },
    { name: "Constante RC", eq: "τ = R · C", desc: "Tiempo carga capacitor al 63.2%", vars: "τ [s], R [Ω], C [F]" },
    { name: "Constante RL", eq: "τ = L / R", desc: "Tiempo corriente inductor al 63.2%", vars: "τ [s], L [H], R [Ω]" },
    { name: "Reactancia Capacitiva", eq: "Xc = 1 / (2π · f · C)", desc: "Resistencia AC de un capacitor", vars: "Xc [Ω], f [Hz], C [F]" },
    { name: "Reactancia Inductiva", eq: "Xl = 2π · f · L", desc: "Resistencia AC de un inductor", vars: "Xl [Ω], f [Hz], L [H]" },
    { name: "Resonancia", eq: "f₀ = 1 / (2π · √(L · C))", desc: "Frecuencia de resonancia LC", vars: "f₀ [Hz], L [H], C [F]" },
    { name: "Puente Divisor", eq: "Vout = Vin · R₂ / (R₁ + R₂)", desc: "Voltaje en divisor resistivo", vars: "Vout [V], R₁ [Ω], R₂ [Ω]" },
    { name: "Energía Capacitor", eq: "E = ½ · C · V²", desc: "Energía almacenada en capacitor", vars: "E [J], C [F], V [V]" },
    { name: "Energía Inductor", eq: "E = ½ · L · I²", desc: "Energía almacenada en inductor", vars: "E [J], L [H], I [A]" },
    { name: "Serie R", eq: "Rt = R₁ + R₂ + ... + Rn", desc: "Resistencia total en serie", vars: "Rt [Ω], R₁..Rn [Ω]" },
    { name: "Paralelo R", eq: "1/Rt = 1/R₁ + 1/R₂ + ...", desc: "Resistencia total en paralelo", vars: "Rt [Ω], R₁..Rn [Ω]" },
    { name: "Serie C", eq: "1/Ct = 1/C₁ + 1/C₂ + ...", desc: "Capacitancia total en serie", vars: "Ct [F], C₁..Cn [F]" },
    { name: "Paralelo C", eq: "Ct = C₁ + C₂ + ... + Cn", desc: "Capacitancia total en paralelo", vars: "Ct [F], C₁..Cn [F]" },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Librería de Fórmulas</div>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {formulas.map((f, i) => (
          <div key={i} className="bg-surface-800 border border-surface-700 rounded-lg p-2 hover:border-primary-700 transition-colors">
            <div className="text-[10px] font-semibold text-slate-300">{f.name}</div>
            <div className="text-[11px] font-mono text-primary-400 font-bold mt-0.5">{f.eq}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">{f.desc}</div>
            <div className="text-[9px] text-slate-600 font-mono mt-0.5">{f.vars}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CalculatorPageProps {
  onClose: () => void;
}

export function CalculatorPage({ onClose }: CalculatorPageProps) {
  const [tab, setTab] = useState<CalcTab>('ohm');

  const tabs: { id: CalcTab; label: string }[] = [
    { id: 'ohm', label: 'Ohm' },
    { id: 'resistor', label: 'R' },
    { id: 'colorcode', label: 'Colores' },
    { id: 'rc', label: 'RC' },
    { id: 'reactance', label: 'XL/XC' },
    { id: 'converter', label: 'Conv' },
    { id: 'formulas', label: 'Fórmulas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 rounded-xl shadow-2xl border border-surface-700 w-[520px] max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-700">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary-600/20 flex items-center justify-center text-[10px] text-primary-400 font-bold border border-primary-600/30">∑</div>
            <span className="text-sm font-semibold text-slate-200">Calculadora de Ingeniería</span>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded hover:bg-surface-700 flex items-center justify-center text-slate-500 hover:text-slate-300 text-sm">✕</button>
        </div>

        <div className="flex border-b border-surface-700 px-2 py-0.5 gap-1 bg-surface-950/50 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-t transition-colors whitespace-nowrap ${
                tab === t.id ? 'bg-surface-900 text-primary-400 border-t border-l border-r border-surface-700 -mb-px' : 'text-slate-500 hover:text-slate-300'
              }`}
            >{t.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tab === 'ohm' && <LeyOhm />}
          {tab === 'resistor' && <CalcResistencia />}
          {tab === 'colorcode' && <ColorCodeCalc />}
          {tab === 'rc' && <CalcRC />}
          {tab === 'reactance' && <CalcReactancia />}
          {tab === 'converter' && <Convertidor />}
          {tab === 'formulas' && <LibreriaFormulas />}
        </div>

        <div className="border-t border-surface-700 px-4 py-2 flex justify-between items-center bg-surface-950/50">
          <span className="text-[9px] text-slate-600">Selecciona una pestaña para comenzar</span>
          <button onClick={onClose} className="px-3 py-1 text-[10px] bg-primary-600 text-white rounded font-medium hover:bg-primary-500 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
