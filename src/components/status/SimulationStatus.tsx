import { useCircuitStore } from '../../store/circuitStore';
import { useCircuitStats } from '../../hooks/useCircuitStats';
import { formatEnergyJ } from '../../utils/circuitStats';

export function SimulationStatus() {
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simError = useCircuitStore((s) => s.simError);
  const simResults = useCircuitStore((s) => s.simResults);
  const simTime = useCircuitStore((s) => s.simTime);
  const stats = useCircuitStats();

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

      {(status === 'running' || (status === 'stopped' && simResults?.status.success && simTime > 0)) && (
        <span
          className={`font-mono font-medium ${status === 'running' ? 'text-green-600' : 'text-ink-faint'}`}
        >
          {simTime.toFixed(2)}s
        </span>
      )}

      {status === 'error' && simError && (
        <span className="text-red-600 font-mono truncate max-w-[180px]" title={simError}>
          {simError}
        </span>
      )}

      {stats.components > 0 && (
        <span className="text-ink-faint font-mono hidden md:inline tabular-nums text-[10px]">
          {stats.components} comp · {stats.wires} cables · {stats.electricalNodes} nodos
          {stats.branches > 0 && ` · ${stats.branches} ramas`}
          {stats.probes > 0 && ` · ${stats.probes} sondas`}
        </span>
      )}

      {simResults?.status.success && stats.totalStoredEnergyJ > 1e-12 && (
        <span className="text-cyan-700 font-mono hidden xl:inline tabular-nums text-[10px]">
          E={formatEnergyJ(stats.totalStoredEnergyJ)}
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

      {!stats.hasGround && stats.components > 0 && (
        <span className="text-gold-600 text-[9px] font-medium hidden sm:inline">
          ¡Falta tierra!
        </span>
      )}
    </div>
  );
}
