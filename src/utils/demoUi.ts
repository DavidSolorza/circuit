type DemoLoadedHandler = () => void;

const handlers: DemoLoadedHandler[] = [];

export function registerDemoLoadedHandler(handler: DemoLoadedHandler): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.indexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

export function notifyDemoLoaded(): void {
  handlers.forEach((h) => h());
}
