const ITEMS = [
  {
    title: 'Batería · Interruptor',
    desc: 'Encienden o cortan la rama. Sin tierra no simula.',
  },
  {
    title: 'R · Diodo · LED · L · C',
    desc: 'El diodo y el LED bloquean en inversa y conducen con caída de tensión en directa. El inductor y el capacitor se notan al cambiar el interruptor.',
  },
  {
    title: 'Amperímetro · Voltímetro',
    desc: 'El amperímetro va en serie (mide la corriente de la rama). El voltímetro en paralelo con el LED.',
  },
  {
    title: 'Osciloscopio',
    desc: 'Cuatro sondas: I en amperímetro, V en LED, C e L. Voltaje a la izquierda, corriente a la derecha.',
  },
] as const;

export function DemoGuidePanel() {
  return (
    <div className="p-4 space-y-4 text-[12px] text-ink-muted leading-relaxed">
      <div className="guide-card">
        <h3 className="text-sm font-semibold text-ink mb-1.5">El circuito de ejemplo</h3>
        <p>
          La corriente sale de la batería, pasa por el interruptor y el amperímetro, recorre la
          resistencia y el diodo, enciende el LED y baja por el inductor hasta tierra. El capacitor
          y el voltímetro van en paralelo con el LED.
        </p>
        <p className="mt-2">
          El potenciómetro va en paralelo con la resistencia (R = Rmax × cursor). El transistor es
          solo referencia visual (alta impedancia). La fuente de corriente está en el canvas sin
          cablear para que veas el símbolo.
        </p>
      </div>

      <div className="space-y-2">
        {ITEMS.map((item) => (
          <div key={item.title} className="guide-card">
            <p className="text-ink text-[11px] font-medium">{item.title}</p>
            <p className="mt-1 text-[11px]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
