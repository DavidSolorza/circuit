type DemoLoadedHandler = () => void;

let onDemoLoaded: DemoLoadedHandler | null = null;

export function registerDemoLoadedHandler(handler: DemoLoadedHandler): void {
  onDemoLoaded = handler;
}

export function notifyDemoLoaded(): void {
  onDemoLoaded?.();
}
