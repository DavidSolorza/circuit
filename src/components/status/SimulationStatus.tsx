import { useCircuitStore } from '../../store/circuitStore';

export function SimulationStatus() {
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simError = useCircuitStore((s) => s.simError);
  const simResults = useCircuitStore((s) => s.simResults);
  const simTime = useCircuitStore((s) => s.simTime);
  const compCount = useCircuitStore((s) => Object.keys(s.circuit.components).length);
  const wireCount = useCircuitStore((s) => Object.keys(s.circuit.wires).length);
  const components = useCircuitStore((s) => s.circuit.components);

  const status = !simulationRunning
    ? 'stopped'
    : simError
      ? 'error'
      : simResults?.status.success
        ? 'running'
        : 'processing';

  const ledColor =
    status === 'running'
      ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
      : status === 'error'
        ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
        : status === 'processing'
          ? 'bg-yellow-400 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
          : 'bg-surface-600';

  const ledPulse = status === 'running' || status === 'processing' ? 'animate-pulse' : '';

  const groundCount = Object.values(components).filter((c) => c.type === 'ground').length;
  const nodeCount = simResults?.status.success
    ? Object.keys(simResults.nodeVoltages).length - 1
    : 0;
  const branchCount = simResults?.status.success
    ? Object.keys(simResults.branchCurrents).length
    : 0;

  return (
    <div className="flex items-center gap-2 text-[10px]">
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-[11px] ${
          status === 'running'
            ? 'bg-green-50 border-green-300 text-green-700'
            : status === 'error'
              ? 'bg-red-50 border-red-300 text-red-700'
              : status === 'processing'
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                : 'bg-surface-800 border-surface-700 text-ink-faint'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${ledColor} ${ledPulse}`} />
        <span className="font-semibold tracking-wider">
          {status === 'running' && 'SIMULANDO'}
          {status === 'error' && 'ERROR'}
          {status === 'processing' && 'PROCESANDO'}
          {status === 'stopped' && 'DETENIDO'}
        </span>
      </div>

      {status === 'running' && (
        <span className="text-green-600 font-mono font-medium">{simTime.toFixed(2)}s</span>
      )}

      {status === 'error' && simError && (
        <span className="text-red-600 font-mono truncate max-w-[180px]" title={simError}>
          {simError}
        </span>
      )}

      {(status === 'running' || status === 'stopped') && simResults?.status.success && (
        <span className="text-surface-500 font-mono hidden lg:inline">
          N{nodeCount} · R{branchCount} · C{compCount} · W{wireCount}
        </span>
      )}

      {simulationRunning && !simError && simResults?.status.success && (
        <div className="w-16 h-1 bg-surface-800 rounded-full overflow-hidden hidden lg:block">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-pulse"
            style={{ width: '100%' }}
          />
        </div>
      )}

      {groundCount === 0 && compCount > 0 && (
        <span className="text-gold-600 text-[9px] font-medium hidden sm:inline">
          ¡Falta tierra!
        </span>
      )}
    </div>
  );
}
