import { useEffect, useRef } from 'react';
import { appBus, type AppEventType } from '../shared/bus/AppEventBus';

/** Suscribe un handler al bus de aplicación; se limpia al desmontar. */
export function useAppBus<T = unknown>(
  type: AppEventType,
  handler: (payload: T) => void,
  deps: unknown[] = [],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    return appBus.on<T>(type, (event) => handlerRef.current(event.payload));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}
