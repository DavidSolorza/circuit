interface Props {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: 'Supr', action: 'Borra lo seleccionado' },
  { keys: 'Ctrl + Z', action: 'Deshacer' },
  { keys: 'Ctrl + Shift + Z', action: 'Rehacer' },
  { keys: '?', action: 'Abre esta ventana' },
] as const;

export function ShortcutsHelp({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-surface-950/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-900 border border-surface-700 rounded-xl shadow-float max-w-sm w-full animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
          <h2 className="text-sm font-semibold text-ink">Atajos</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint hover:text-ink text-lg leading-none px-1"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <ul className="px-4 py-3 space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between gap-3 text-xs">
              <kbd className="px-2 py-0.5 rounded-md bg-surface-800 border border-surface-700 font-mono text-[10px] text-primary-600">
                {s.keys}
              </kbd>
              <span className="text-ink-muted">{s.action}</span>
            </li>
          ))}
        </ul>
        <p className="px-4 pb-4 text-[11px] text-ink-faint border-t border-surface-700/80 pt-3">
          Cables: clic para elegir, arrastra un extremo para moverlo a otro terminal.
        </p>
      </div>
    </div>
  );
}
