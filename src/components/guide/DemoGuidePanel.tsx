import { TEAM_MEMBERS } from '../../core/team';
import { CircuitStatsPanel } from '../status/CircuitStatsPanel';

const ITEMS = [
  {
    title: 'Batería · Interruptor',
    desc: 'Pulsa Iniciar simulación abajo. El − (azul) va a GND; el + (rojo) al circuito.',
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
      <CircuitStatsPanel />

      <div className="guide-card">
        <h3 className="text-sm font-semibold text-ink mb-1.5">El circuito de ejemplo</h3>
        <p>
          La corriente sale de la batería, pasa por el interruptor y el amperímetro, recorre la
          resistencia y el diodo, enciende el LED y baja por el inductor hasta tierra. El capacitor
          y el voltímetro van en paralelo con el LED.
        </p>
        <p className="mt-2">
          El potenciómetro va en paralelo con la resistencia (R = Rmax × cursor). El transistor es
          solo referencia visual (alta impedancia). La fuente de corriente está en la paleta si
          quieres probarla.
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

      <div className="guide-card border-primary-500/20 bg-primary-950/20">
        <h3 className="text-sm font-semibold text-ink mb-2">Equipo de desarrollo</h3>
        <ul className="space-y-2">
          {TEAM_MEMBERS.map((member) => (
            <li key={member.name}>
              <p className="text-ink text-[11px] font-medium">{member.name}</p>
              <p className="text-[10px] text-ink-faint">{member.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
