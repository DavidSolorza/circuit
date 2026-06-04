import { useToastStore, type ToastKind } from '../store/toastStore';

const styles: Record<ToastKind, string> = {
  error: 'border-red-300 bg-red-50 text-red-800',
  warning: 'border-gold-400 bg-gold-50 text-gold-900',
  success: 'border-green-300 bg-green-50 text-green-800',
  info: 'border-primary-300 bg-primary-50 text-primary-800',
};

const dotStyles: Record<ToastKind, string> = {
  error: 'bg-red-500',
  warning: 'bg-gold-500',
  success: 'bg-green-500',
  info: 'bg-primary-500',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-10 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-lg border px-3 py-2.5 shadow-float animate-slide-up ${styles[t.kind]}`}
          role="alert"
        >
          <div className="flex items-start gap-2">
            <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${dotStyles[t.kind]}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">{t.title}</div>
              {t.message && (
                <div className="text-[10px] mt-0.5 opacity-90 leading-snug">{t.message}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-[10px] opacity-60 hover:opacity-100 shrink-0 px-1"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
