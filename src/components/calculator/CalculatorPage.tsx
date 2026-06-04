import { useState } from 'react';
import {
  ColorCodeTab,
  ConverterTab,
  FormulasTab,
  OhmTab,
  RcTab,
  ReactanceTab,
  ResistorTab,
} from './tabs';

type CalcTab = 'ohm' | 'resistor' | 'colorcode' | 'rc' | 'reactance' | 'converter' | 'formulas';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-900 rounded-2xl shadow-float border border-surface-700 w-[540px] max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gold-50 flex items-center justify-center text-xs text-gold-700 font-bold border border-gold-200">
              ∑
            </div>
            <span className="text-sm font-semibold text-ink">Calculadora de Ingeniería</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-surface-800 flex items-center justify-center text-ink-faint hover:text-ink text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-surface-700 px-3 py-1 gap-0.5 bg-surface-950/40 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-t-md transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-surface-900 text-primary-600 border-t border-l border-r border-surface-700 -mb-px font-semibold'
                  : 'text-ink-faint hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {tab === 'ohm' && <OhmTab />}
          {tab === 'resistor' && <ResistorTab />}
          {tab === 'colorcode' && <ColorCodeTab />}
          {tab === 'rc' && <RcTab />}
          {tab === 'reactance' && <ReactanceTab />}
          {tab === 'converter' && <ConverterTab />}
          {tab === 'formulas' && <FormulasTab />}
        </div>

        <div className="border-t border-surface-700 px-5 py-2.5 flex justify-between items-center bg-surface-950/40">
          <span className="text-[10px] text-ink-faint">7 herramientas de cálculo eléctrico</span>
          <button onClick={onClose} className="btn-primary text-[11px]">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
