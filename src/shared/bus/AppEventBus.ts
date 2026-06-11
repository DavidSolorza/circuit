export type AppEventType =
  | 'component:added'
  | 'component:removed'
  | 'component:rotated'
  | 'component:moved'
  | 'wire:connected'
  | 'wire:removed'
  | 'wire:reconnected'
  | 'simulation:started'
  | 'simulation:stopped'
  | 'circuit:cleared'
  | 'circuit:discharged'
  | 'topology:changed';

export interface AppEvent<T = unknown> {
  type: AppEventType;
  payload: T;
  timestamp: number;
}

type Handler<T = unknown> = (event: AppEvent<T>) => void;

/**
 * AppEventBus — pub/sub desacoplado para la UI y el store.
 * Permite reaccionar a rotaciones, cables y simulación sin acoplar módulos.
 */
export class AppEventBus {
  private handlers = new Map<AppEventType, Set<Handler>>();

  on<T = unknown>(type: AppEventType, handler: Handler<T>): () => void {
    const set = this.handlers.get(type) ?? new Set();
    set.add(handler as Handler);
    this.handlers.set(type, set);
    return () => set.delete(handler as Handler);
  }

  once<T = unknown>(type: AppEventType, handler: Handler<T>): () => void {
    const off = this.on<T>(type, (event) => {
      off();
      handler(event);
    });
    return off;
  }

  emit<T = unknown>(type: AppEventType, payload: T): void {
    const event: AppEvent<T> = {
      type,
      payload,
      timestamp: performance.now(),
    };
    const set = this.handlers.get(type);
    if (!set) return;
    for (const handler of set) {
      handler(event as AppEvent);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const appBus = new AppEventBus();
