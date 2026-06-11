import { useCircuitStore } from '../../store/circuitStore';
import { useCircuitStats } from '../../hooks/useCircuitStats';
import { formatEnergyJ, typeLabel } from '../../utils/circuitStats';
import type { ComponentType } from '../../types';

function StatChip({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className={`stats-chip ${accent ?? ''}`}>
      <span className="stats-chip-value">{value}</span>
      <span className="stats-chip-label">{label}</span>
    </div>
  );
}

export function CircuitStatsPanel({ compact = false }: { compact?: boolean }) {
  const stats = useCircuitStats();
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simTime = useCircuitStore((s) => s.simTime);
  const simResults = useCircuitStore((s) => s.simResults);
  const hasSim = simResults?.status.success ?? false;

  const typeEntries = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]) as [
    ComponentType,
    number,
  ][];

  if (stats.components === 0) {
    return (
      <div className="guide-card text-center py-6">
        <p className="text-xs text-ink-muted">Sin componentes en el canvas</p>
        <p className="text-[10px] text-ink-faint mt-1">Arrastra elementos desde la paleta izquierda</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <StatChip label="comp." value={stats.components} />
        <StatChip label="cables" value={stats.wires} />
        <StatChip label="nodos" value={stats.electricalNodes} accent="stats-chip-primary" />
        <StatChip label="ramas" value={stats.branches} />
        {stats.probes > 0 && <StatChip label="sondas" value={stats.probes} accent="stats-chip-gold" />}
        {!stats.hasGround && (
          <span className="text-[9px] text-gold-600 font-medium px-2 py-1 rounded bg-gold-50 border border-gold-200">
            Sin GND
          </span>
        )}
        {stats.looseComponents > 0 && (
          <span className="text-[9px] text-amber-700 font-medium px-2 py-1 rounded bg-amber-50 border border-amber-200">
            {stats.looseComponents} suelto{stats.looseComponents > 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="guide-card">
        <h3 className="text-sm font-semibold text-ink mb-2">Resumen del circuito</h3>
        <div className="grid grid-cols-3 gap-2">
          <StatChip label="Componentes" value={stats.components} />
          <StatChip label="Cables" value={stats.wires} />
          <StatChip label="Bornes" value={stats.terminals} />
          <StatChip label="Nodos eléctricos" value={stats.electricalNodes} accent="stats-chip-primary" />
          <StatChip label="Nodos MNA" value={stats.mnaNodes} />
          <StatChip label="Ramas" value={stats.branches} />
          <StatChip label="Sondas osc." value={stats.probes} accent="stats-chip-gold" />
          <StatChip
            label="Estado"
            value={simulationRunning ? 'LIVE' : hasSim ? 'Pausado' : 'Listo'}
          />
          {(simulationRunning || hasSim) && (
            <StatChip label="Tiempo sim." value={`${simTime.toFixed(2)} s`} />
          )}
        </div>

        {!stats.hasGround && (
          <p className="mt-2 text-[10px] text-gold-700 bg-gold-50 border border-gold-200 rounded px-2 py-1">
            Falta tierra (GND) — añade un componente Tierra y conéctalo al polo − de la batería.
          </p>
        )}
        {stats.looseComponents > 0 && (
          <p className="mt-2 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            {stats.looseComponents} componente(s) sin cable — no afectan la simulación hasta que los conectes.
          </p>
        )}
      </div>

      {hasSim && stats.totalStoredEnergyJ > 1e-12 && (
        <div className="guide-card border-cyan-500/20 bg-cyan-950/10">
          <h3 className="text-sm font-semibold text-ink mb-1.5">Energía almacenada</h3>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono tabular-nums">
            <div>
              <span className="text-ink-faint">Capacitores: </span>
              <span className="text-cyan-700">{formatEnergyJ(stats.capEnergyJ)}</span>
            </div>
            <div>
              <span className="text-ink-faint">Inductores: </span>
              <span className="text-amber-700">{formatEnergyJ(stats.indEnergyJ)}</span>
            </div>
          </div>
          <p className="text-[9px] text-ink-faint mt-1.5">
            Al descargar se reinician C y L a estado inicial (0 V / 0 A).
          </p>
        </div>
      )}

      {typeEntries.length > 0 && (
        <div className="guide-card">
          <h3 className="text-sm font-semibold text-ink mb-2">Por tipo</h3>
          <div className="flex flex-wrap gap-1.5">
            {typeEntries.map(([type, count]) => (
              <span
                key={type}
                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-800 border border-surface-700 text-ink-muted"
              >
                {typeLabel(type)} <strong className="text-ink">{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
