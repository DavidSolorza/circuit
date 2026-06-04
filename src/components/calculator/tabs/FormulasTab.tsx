const formulas = [
  {
    name: 'Ley de Ohm',
    eq: 'V = I · R',
    desc: 'Voltaje = Corriente × Resistencia',
    vars: 'V [V], I [A], R [Ω]',
  },
  {
    name: 'Potencia',
    eq: 'P = V · I = I² · R = V² / R',
    desc: 'Potencia eléctrica disipada',
    vars: 'P [W], V [V], I [A], R [Ω]',
  },
  {
    name: 'LVK',
    eq: 'Σ V_malla = 0',
    desc: 'Suma de voltajes en malla cerrada = 0',
    vars: 'Caídas de voltaje [V]',
  },
  {
    name: 'LCK',
    eq: 'Σ I_nodo = 0',
    desc: 'Suma de corrientes entrantes = salientes',
    vars: 'Corrientes de rama [A]',
  },
  {
    name: 'Constante RC',
    eq: 'τ = R · C',
    desc: 'Tiempo carga capacitor al 63.2%',
    vars: 'τ [s], R [Ω], C [F]',
  },
  {
    name: 'Constante RL',
    eq: 'τ = L / R',
    desc: 'Tiempo corriente inductor al 63.2%',
    vars: 'τ [s], L [H], R [Ω]',
  },
  {
    name: 'Reactancia Capacitiva',
    eq: 'Xc = 1 / (2π · f · C)',
    desc: 'Resistencia AC de un capacitor',
    vars: 'Xc [Ω], f [Hz], C [F]',
  },
  {
    name: 'Reactancia Inductiva',
    eq: 'Xl = 2π · f · L',
    desc: 'Resistencia AC de un inductor',
    vars: 'Xl [Ω], f [Hz], L [H]',
  },
  {
    name: 'Resonancia',
    eq: 'f₀ = 1 / (2π · √(L · C))',
    desc: 'Frecuencia de resonancia LC',
    vars: 'f₀ [Hz], L [H], C [F]',
  },
  {
    name: 'Puente Divisor',
    eq: 'Vout = Vin · R₂ / (R₁ + R₂)',
    desc: 'Voltaje en divisor resistivo',
    vars: 'Vout [V], R₁ [Ω], R₂ [Ω]',
  },
  {
    name: 'Energía Capacitor',
    eq: 'E = ½ · C · V²',
    desc: 'Energía almacenada en capacitor',
    vars: 'E [J], C [F], V [V]',
  },
  {
    name: 'Energía Inductor',
    eq: 'E = ½ · L · I²',
    desc: 'Energía almacenada en inductor',
    vars: 'E [J], L [H], I [A]',
  },
  {
    name: 'Serie R',
    eq: 'Rt = R₁ + R₂ + ... + Rn',
    desc: 'Resistencia total en serie',
    vars: 'Rt [Ω], R₁..Rn [Ω]',
  },
  {
    name: 'Paralelo R',
    eq: '1/Rt = 1/R₁ + 1/R₂ + ...',
    desc: 'Resistencia total en paralelo',
    vars: 'Rt [Ω], R₁..Rn [Ω]',
  },
  {
    name: 'Serie C',
    eq: '1/Ct = 1/C₁ + 1/C₂ + ...',
    desc: 'Capacitancia total en serie',
    vars: 'Ct [F], C₁..Cn [F]',
  },
  {
    name: 'Paralelo C',
    eq: 'Ct = C₁ + C₂ + ... + Cn',
    desc: 'Capacitancia total en paralelo',
    vars: 'Ct [F], C₁..Cn [F]',
  },
];

export function FormulasTab() {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
        Librería de Fórmulas
      </div>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {formulas.map((f, i) => (
          <div
            key={i}
            className="bg-surface-800 border border-surface-700 rounded-lg p-2 hover:border-primary-300 transition-colors"
          >
            <div className="text-[10px] font-semibold text-ink">{f.name}</div>
            <div className="text-[11px] font-mono text-primary-500 font-bold mt-0.5">{f.eq}</div>
            <div className="text-[9px] text-surface-500 mt-0.5">{f.desc}</div>
            <div className="text-[9px] text-surface-500 font-mono mt-0.5">{f.vars}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
