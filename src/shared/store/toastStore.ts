import { create } from 'zustand';

export type ToastKind = 'error' | 'warning' | 'success' | 'info';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  timers: Map<string, number>;
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

let toastSeq = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  timers: new Map(),
  push: (toast) => {
    const id = `toast-${++toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }].slice(-5) }));
    const timerId = window.setTimeout(() => {
      get().dismiss(id);
    }, toast.kind === 'error' ? 8000 : 5000);
    set((s) => {
      const timers = new Map(s.timers);
      timers.set(id, timerId);
      return { timers };
    });
  },
  dismiss: (id) => {
    const timers = get().timers;
    const timerId = timers.get(id);
    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      timers.delete(id);
      set({ timers: new Map(timers) });
    }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
  clear: () => {
    for (const timerId of get().timers.values()) window.clearTimeout(timerId);
    set({ toasts: [], timers: new Map() });
  },
}));

export function toastError(title: string, message?: string): void {
  useToastStore.getState().push({ kind: 'error', title, message });
}

export function toastWarning(title: string, message?: string): void {
  useToastStore.getState().push({ kind: 'warning', title, message });
}

export function toastSuccess(title: string, message?: string): void {
  useToastStore.getState().push({ kind: 'success', title, message });
}

export function toastInfo(title: string, message?: string): void {
  useToastStore.getState().push({ kind: 'info', title, message });
}
