import { useEffect, useState, type KeyboardEvent } from 'react';

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

interface ParamNumberFieldProps {
  def: ParamDef;
  value: number;
  onCommit: (value: number) => void;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function formatStoredValue(value: number, def: ParamDef): string {
  if (def.key === 'capacitance' || def.key === 'inductance') {
    return value.toExponential(6);
  }
  if (def.step >= 1) return String(Math.round(value));
  const decimals = Math.min(8, Math.max(0, -Math.floor(Math.log10(def.step))));
  return value.toFixed(decimals);
}

function formatRangeHint(n: number, def: ParamDef): string {
  if (Math.abs(n) < 0.001 || Math.abs(n) >= 1_000_000) {
    return n.toExponential(2);
  }
  return formatStoredValue(n, def);
}

export function ParamNumberField({ def, value, onCommit }: ParamNumberFieldProps) {
  const [draft, setDraft] = useState(() => formatStoredValue(value, def));

  useEffect(() => {
    setDraft(formatStoredValue(value, def));
  }, [value, def.key, def.step]);

  const commit = (raw: string) => {
    const trimmed = raw.trim().replace(',', '.');
    const parsed = parseFloat(trimmed);
    if (!Number.isFinite(parsed)) {
      setDraft(formatStoredValue(value, def));
      return;
    }
    const next = clamp(parsed, def.min, def.max);
    onCommit(next);
    setDraft(formatStoredValue(next, def));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setDraft(formatStoredValue(value, def));
      e.currentTarget.blur();
    }
  };

  return (
    <div>
      <label className="text-[10px] text-ink-faint flex justify-between gap-2">
        <span>
          {def.label}
          {def.unit ? ` (${def.unit})` : ''}
        </span>
        <span className="font-mono text-ink-faint/70 tabular-nums">
          {formatRangeHint(def.min, def)} – {formatRangeHint(def.max, def)}
        </span>
      </label>
      <div className="mt-1 flex items-center gap-1.5">
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-surface-800 border border-surface-700 rounded-md font-mono text-ink tabular-nums focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none"
          placeholder={formatStoredValue(def.min, def)}
        />
        {def.unit && (
          <span className="text-[10px] text-ink-faint font-mono shrink-0 w-6">{def.unit}</span>
        )}
      </div>
    </div>
  );
}
