import { useMemo, useState } from 'react';
import { FORMULA_CATEGORIES, FORMULA_LIBRARY, type FormulaCategory } from '../formulas';

export function FormulasTab() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FormulaCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FORMULA_LIBRARY.filter((f) => {
      if (category !== 'all' && f.category !== category) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.eq.toLowerCase().includes(q) ||
        f.desc.toLowerCase().includes(q) ||
        (f.usedIn?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, category]);

  const categories = Object.entries(FORMULA_CATEGORIES) as [FormulaCategory, string][];

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
          Librería de fórmulas
        </div>
        <p className="text-[10px] text-ink-faint mt-1">
          Referencia para la calculadora y para lo que hace el simulador en cada componente.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar fórmula o componente…"
        className="w-full px-3 py-2 text-xs bg-surface-800 border border-surface-700 rounded-lg text-ink placeholder:text-ink-faint focus:border-primary-500 outline-none"
      />

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`px-2 py-1 rounded text-[9px] font-medium border transition-colors ${
            category === 'all'
              ? 'bg-primary-50 text-primary-700 border-primary-300'
              : 'bg-surface-800 text-ink-faint border-surface-700'
          }`}
        >
          Todas
        </button>
        {categories.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`px-2 py-1 rounded text-[9px] font-medium border transition-colors ${
              category === id
                ? 'bg-primary-50 text-primary-700 border-primary-300'
                : 'bg-surface-800 text-ink-faint border-surface-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-ink-faint text-center py-6">Nada con ese filtro.</p>
        ) : (
          filtered.map((f) => (
            <div
              key={`${f.name}-${f.eq}`}
              className="bg-surface-800 border border-surface-700 rounded-lg p-2.5 hover:border-primary-300/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-[10px] font-semibold text-ink">{f.name}</div>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-surface-900 text-ink-faint border border-surface-700 shrink-0">
                  {FORMULA_CATEGORIES[f.category]}
                </span>
              </div>
              <div className="text-[11px] font-mono text-primary-600 font-bold mt-1">{f.eq}</div>
              <div className="text-[9px] text-ink-muted mt-1">{f.desc}</div>
              <div className="text-[9px] text-ink-faint font-mono mt-0.5">{f.vars}</div>
              {f.usedIn && (
                <div className="text-[9px] text-gold-700 mt-1.5 pt-1.5 border-t border-surface-700/80">
                  <span className="font-medium">En el simulador:</span> {f.usedIn}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
