import { useState } from 'react';
import { AppLogo } from '../brand/AppLogo';
import {
  ColorCodeTab,
  ConverterTab,
  DividerTab,
  FormulasTab,
  OhmTab,
  PowerTab,
  RcTab,
  ReactanceTab,
  ResistorTab,
  RlTab,
} from './tabs';

type CalcTab =
  | 'ohm'
  | 'power'
  | 'resistor'
  | 'divider'
  | 'colorcode'
  | 'rc'
  | 'rl'
  | 'reactance'
  | 'converter'
  | 'formulas';

interface CalculatorPageProps {
  onClose: () => void;
}

const TABS: { id: CalcTab; label: string; group: string }[] = [
  { id: 'ohm', label: 'Ohm', group: 'calc' },
  { id: 'power', label: 'Potencia', group: 'calc' },
  { id: 'resistor', label: 'R serie/∥', group: 'calc' },
  { id: 'divider', label: 'Divisores', group: 'calc' },
  { id: 'rc', label: 'RC', group: 'trans' },
  { id: 'rl', label: 'RL', group: 'trans' },
  { id: 'reactance', label: 'XL / XC', group: 'ac' },
  { id: 'colorcode', label: 'Colores', group: 'tools' },
  { id: 'converter', label: 'Unidades', group: 'tools' },
  { id: 'formulas', label: 'Fórmulas', group: 'ref' },
];

export function CalculatorPage({ onClose }: CalculatorPageProps) {
  const [tab, setTab] = useState<CalcTab>('ohm');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-surface-900 rounded-2xl shadow-float border border-surface-700 w-full max-w-[620px] max-h-[88vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-700">
          <div className="flex items-center gap-2.5">
            <AppLogo size={32} />
            <div>
              <span className="text-sm font-semibold text-ink block leading-tight">
                Calculadora Electro+
              </span>
              <span className="text-[9px] text-ink-faint">10 herramientas · fórmulas del simulador</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-surface-800 flex items-center justify-center text-ink-faint hover:text-ink text-sm transition-colors"
            aria-label="Cerrar calculadora"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-surface-700 px-2 py-1 gap-0.5 bg-surface-950/40 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1.5 text-[10px] font-medium rounded-t-md transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-surface-900 text-primary-600 border-t border-l border-r border-surface-700 -mb-px font-semibold'
                  : 'text-ink-faint hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'ohm' && <OhmTab />}
          {tab === 'power' && <PowerTab />}
          {tab === 'resistor' && <ResistorTab />}
          {tab === 'divider' && <DividerTab />}
          {tab === 'colorcode' && <ColorCodeTab />}
          {tab === 'rc' && <RcTab />}
          {tab === 'rl' && <RlTab />}
          {tab === 'reactance' && <ReactanceTab />}
          {tab === 'converter' && <ConverterTab />}
          {tab === 'formulas' && <FormulasTab />}
        </div>

        <div className="border-t border-surface-700 px-5 py-2.5 flex justify-between items-center bg-surface-950/40">
          <span className="text-[10px] text-ink-faint">
            Cada pestaña muestra las fórmulas que usa abajo
          </span>
          <button type="button" onClick={onClose} className="btn-primary text-[11px]">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
