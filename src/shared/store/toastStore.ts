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
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

let toastSeq = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = `toast-${++toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }].slice(-5) }));
    window.setTimeout(() => {
      useToastStore.getState().dismiss(id);
    }, toast.kind === 'error' ? 8000 : 5000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
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
