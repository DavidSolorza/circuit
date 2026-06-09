const SECTIONS = [
  {
    title: 'Cómo leer este circuito',
    body: 'La rama principal va de izquierda a derecha: batería → interruptor → medición → carga → tierra. Pulsa INICIAR con el interruptor encendido. Usa el osciloscopio abajo y el multímetro a la derecha.',
  },
  {
    title: 'Fuentes y control',
    items: [
      { name: 'Batería (9 V)', desc: 'Alimenta todo el circuito. Terminal + hacia la carga, − a tierra.' },
      { name: 'Interruptor', desc: 'Abre o cierra la corriente. Pruébalo en Propiedades (ENCENDIDO/APAGADO) y mira el osciloscopio.' },
      { name: 'Fuente de corriente (2 mA)', desc: 'Rama auxiliar en paralelo: inyecta corriente constante hacia tierra desde el nodo del amperímetro.' },
    ],
  },
  {
    title: 'Pasivos',
    items: [
      { name: 'Resistencia (470 Ω)', desc: 'Limita la corriente y crea caída de tensión. El potenciómetro está en paralelo solo como referencia visual.' },
      { name: 'Capacitor', desc: 'En paralelo con el LED. En continua se comporta como circuito abierto; en transitorio almacena carga.' },
      { name: 'Inductor', desc: 'En serie antes de tierra. Opondrse a cambios bruscos de corriente (efecto visible al conmutar el interruptor).' },
      { name: 'Potenciómetro', desc: 'Componente de demostración — aún no modelado en el motor (Luisa). No afecta la simulación.' },
    ],
  },
  {
    title: 'Semiconductores',
    items: [
      { name: 'Diodo', desc: 'En serie; modelo simplificado como caída de voltaje fija (~0,7 V).' },
      { name: 'LED', desc: 'Carga luminosa; modelo aproximado (~2 V directos). El transistor en paralelo es solo referencia visual.' },
      { name: 'Transistor NPN', desc: 'Colocado para estudio — aún no modelado. Se excluye al simular.' },
    ],
  },
  {
    title: 'Instrumentos',
    items: [
      { name: 'Amperímetro', desc: 'En serie: mide la corriente total de la rama principal.' },
      { name: 'Voltímetro', desc: 'En paralelo con el LED: mide la tensión en sus bornes.' },
      { name: 'Osciloscopio', desc: 'Sondas en amperímetro, LED, capacitor e inductor. Exporta CSV desde el panel inferior.' },
    ],
  },
  {
    title: 'Tierra (GND)',
    body: 'Referencia 0 V obligatoria. Sin tierra la simulación no arranca.',
  },
] as const;

export function DemoGuidePanel() {
  return (
    <div className="p-4 space-y-4 text-[11px] leading-relaxed">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Circuito demo completo</h3>
        <p className="text-ink-muted">
          Incluye los 13 tipos de componentes del simulador. Los marcados como referencia visual se
          muestran pero aún no participan en el motor MNA.
        </p>
      </div>

      {SECTIONS.map((sec) => (
        <section key={sec.title} className="panel-section space-y-2">
          <div className="panel-label">{sec.title}</div>
          {'body' in sec && <p className="text-ink-muted">{sec.body}</p>}
          {'items' in sec &&
            sec.items.map((item) => (
              <div
                key={item.name}
                className="rounded-md border border-surface-700 bg-surface-800/50 px-2.5 py-2"
              >
                <div className="font-semibold text-ink text-[10px]">{item.name}</div>
                <div className="text-ink-faint mt-0.5">{item.desc}</div>
              </div>
            ))}
        </section>
      ))}

      <p className="text-[10px] text-primary-600/90 border border-primary-200/60 bg-primary-50 rounded-md px-2.5 py-2">
        Consejo: selecciona el interruptor, enciéndelo y observa cómo sube la corriente en el
        osciloscopio. Luego apágalo y verás el escalón a cero.
      </p>
    </div>
  );
}
