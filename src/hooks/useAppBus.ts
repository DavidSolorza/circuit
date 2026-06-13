import { useEffect } from 'react';
import { appBus, type AppEventType } from '../shared/bus/AppEventBus';

/** Suscribe un handler al bus de aplicación; se limpia al desmontar. */
export function useAppBus<T = unknown>(
  type: AppEventType,
  handler: (payload: T) => void,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    return appBus.on<T>(type, (event) => handler(event.payload));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}
