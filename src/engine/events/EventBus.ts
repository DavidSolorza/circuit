export type EngineEventType =
  | 'CircuitChanged'
  | 'ElementAdded'
  | 'ElementRemoved'
  | 'WireAdded'
  | 'WireRemoved'
  | 'SimulationStarted'
  | 'SimulationStopped'
  | 'SimulationStep'
  | 'MeasurementUpdated';

export interface EngineEvent<T = unknown> {
  type: EngineEventType;
  payload: T;
  timestamp: number;
}

type EventHandler<T = unknown> = (event: EngineEvent<T>) => void;

/**
 * EventBus — decoupled pub/sub for simulation lifecycle and circuit mutations.
 */
export class EventBus {
  private handlers = new Map<EngineEventType, Set<EventHandler>>();

  on<T = unknown>(type: EngineEventType, handler: EventHandler<T>): () => void {
    const set = this.handlers.get(type) ?? new Set();
    set.add(handler as EventHandler);
    this.handlers.set(type, set);
    return () => set.delete(handler as EventHandler);
  }

  emit<T = unknown>(type: EngineEventType, payload: T): void {
    const event: EngineEvent<T> = {
      type,
      payload,
      timestamp: performance.now(),
    };
    const set = this.handlers.get(type);
    if (!set) return;
    for (const handler of set) {
      handler(event as EngineEvent);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
