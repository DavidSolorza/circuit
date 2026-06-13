interface FormulaLine {
  eq: string;
  note?: string;
}

interface FormulaHintProps {
  title?: string;
  lines: FormulaLine[];
}

export function FormulaHint({ title = 'Fórmulas usadas', lines }: FormulaHintProps) {
  return (
    <div className="rounded-lg border border-surface-700 bg-surface-950/50 px-3 py-2 space-y-1">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint">{title}</div>
      {lines.map((line) => (
        <div key={line.eq} className="text-[10px]">
          <span className="font-mono text-primary-600 font-semibold">{line.eq}</span>
          {line.note && <span className="text-ink-faint ml-1.5">— {line.note}</span>}
        </div>
      ))}
    </div>
  );
}
