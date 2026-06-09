interface Props {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: 'Supr / Delete', action: 'Eliminar componente o cable seleccionado' },
  { keys: 'Ctrl + Z', action: 'Deshacer' },
  { keys: 'Ctrl + Shift + Z', action: 'Rehacer' },
  { keys: 'Clic en cable', action: 'Seleccionar cable' },
  { keys: 'Arrastrar extremo', action: 'Reconectar cable a otro terminal' },
  { keys: 'Herramienta Sonda', action: 'Clic en componente → sonda de voltaje' },
  { keys: '?', action: 'Mostrar / ocultar esta ayuda' },
] as const;

export function ShortcutsHelp({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-surface-950/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-900 border border-surface-700 rounded-xl shadow-float max-w-md w-full animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
          <h2 className="text-sm font-semibold text-ink">Atajos de teclado</h2>
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
            <li key={s.keys} className="flex items-start justify-between gap-3 text-[11px]">
              <kbd className="shrink-0 px-2 py-0.5 rounded bg-surface-800 border border-surface-700 font-mono text-[10px] text-primary-600">
                {s.keys}
              </kbd>
              <span className="text-ink-muted text-right leading-snug">{s.action}</span>
            </li>
          ))}
        </ul>
        <p className="px-4 pb-4 text-[10px] text-ink-faint">
          Más atajos (R, C, L, V…) llegarán en la rama del editor (Miguel).
        </p>
      </div>
    </div>
  );
}
