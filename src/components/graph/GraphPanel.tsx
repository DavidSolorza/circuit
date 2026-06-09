import { lazy, Suspense, useMemo, memo, useCallback } from 'react';
import { useGraph } from '../../hooks/useGraph';
import { useCircuitStore } from '../../store/circuitStore';
import { exportOscCsv } from '../../shared/lib/exportOscCsv';
import { toastSuccess, toastWarning } from '../../shared/store/toastStore';
import { DT } from '../../core/constants';

const OSC_WINDOW_SEC = 8;

const Plot = lazy(() => import('./PlotlyChart'));

function GraphPanelInner() {
  const { traces, clearData } = useGraph();
  const probes = useCircuitStore((s) => s.probes);
  const oscData = useCircuitStore((s) => s.oscData);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simTime = useCircuitStore((s) => s.simTime);
  const toggleProbe = useCircuitStore((s) => s.toggleProbeVisibility);
  const removeProbe = useCircuitStore((s) => s.removeProbe);

  const exportTraces = useMemo(
    () =>
      probes
        .filter((p) => (oscData[p.id]?.length ?? 0) > 0)
        .map((p) => ({ label: p.label, data: oscData[p.id] })),
    [probes, oscData],
  );

  const handleExportCsv = useCallback(() => {
    if (exportTraces.length === 0) {
      toastWarning('Sin datos', 'Inicia la simulación con sondas activas para exportar.');
      return;
    }
    exportOscCsv(exportTraces, `osciloscopio-${Date.now()}.csv`);
    toastSuccess('CSV exportado', `${exportTraces.length} señal(es) guardadas`);
  }, [exportTraces]);

  const plotTraces = useMemo(() => {
    return traces.map((t) => ({
      x: t.data.map((d) => d.t),
      y: t.data.map((d) => d.v),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: t.label,
      line: { color: t.color, width: 1.5, shape: 'hv' as const },
      hovertemplate: `%{x:.3f}s<br>%{y:.4f}<extra>${t.label}</extra>`,
    }));
  }, [traces]);

  const plotRevision = useMemo(
    () =>
      plotTraces.reduce((sum, t) => sum + t.x.length, 0) +
      Math.round(simTime * 1000),
    [plotTraces, simTime],
  );

  const yAxisTitle = useMemo(() => {
    const visible = probes.filter((p) => p.visible && (oscData[p.id]?.length ?? 0) > 0);
    const hasI = visible.some((p) => p.type === 'current');
    const hasV = visible.some((p) => p.type === 'voltage');
    if (hasI && hasV) return 'Valor (V / A)';
    if (hasI) return 'Corriente (A)';
    if (hasV) return 'Voltaje (V)';
    return 'Valor';
  }, [probes, oscData]);

  const plotLayout = useMemo(() => {
    const followLive = simulationRunning && simTime > OSC_WINDOW_SEC;
    return {
      autosize: true,
      margin: { l: 40, r: 10, t: 20, b: 30 },
      paper_bgcolor: 'rgba(255,252,247,0)',
      plot_bgcolor: 'rgba(255,252,247,0)',
      font: { color: '#6B7280', size: 10 },
      datarevision: plotRevision,
      uirevision: 'oscilloscope',
      xaxis: {
        gridcolor: '#E8E0D0',
        zerolinecolor: '#D0C8B5',
        title: { text: 'Tiempo (s)', font: { size: 9, color: '#6B7280' } },
        color: '#6B7280',
        autorange: !followLive,
        ...(followLive ? { range: [simTime - OSC_WINDOW_SEC, simTime + DT * 2] } : {}),
      },
      yaxis: {
        gridcolor: '#E8E0D0',
        zerolinecolor: '#D0C8B5',
        title: { text: yAxisTitle, font: { size: 9, color: '#6B7280' } },
        color: '#6B7280',
        autorange: true,
        rangemode: 'tozero' as const,
      },
      legend: {
        font: { size: 8, color: '#6B7280' },
        bgcolor: 'rgba(255,252,247,0.8)',
        bordercolor: '#E8E0D0',
      },
      dragmode: 'zoom' as const,
      hovermode: 'closest' as const,
    };
  }, [plotRevision, simulationRunning, simTime, yAxisTitle]);

  return (
    <div className="h-full flex flex-col bg-surface-900">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-700 shrink-0">
        <span className="panel-label">Osciloscopio</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-ink-faint font-mono">
            {traces.length} señal(es)
            {simulationRunning && (
              <span className="ml-1.5 text-sim-running animate-pulse">● grabando</span>
            )}
          </span>
          <button
            onClick={handleExportCsv}
            disabled={exportTraces.length === 0}
            className="text-[10px] text-ink-faint hover:text-ink transition-colors px-2 py-1 rounded-md bg-surface-800 border border-surface-700 hover:border-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Descargar datos del osciloscopio en CSV"
          >
            Exportar CSV
          </button>
          <button
            onClick={clearData}
            className="text-[10px] text-ink-faint hover:text-ink transition-colors px-2 py-1 rounded-md bg-surface-800 border border-surface-700 hover:border-primary-500/30"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {plotTraces.length > 0 ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-xs text-ink-faint">
                Cargando osciloscopio…
              </div>
            }
          >
            <Plot
              data={plotTraces}
              layout={plotLayout}
              config={{
                displayModeBar: false,
                responsive: true,
              }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-xs text-ink-muted gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8A877E"
              strokeWidth="1.5"
              className="mb-1 opacity-60"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {probes.length === 0
              ? 'Sin sondas — usa +V osc / +I osc en Propiedades o la herramienta Sonda'
              : simulationRunning
                ? `Capturando ${probes.length} señal(es)…`
                : plotTraces.length > 0
                  ? `Grabación pausada — ${simTime.toFixed(2)} s capturados`
                  : `${probes.length} sonda(s) lista(s) — pulsa INICIAR para graficar`}
          </div>
        )}
      </div>

      {probes.length > 0 && (
        <div className="border-t border-surface-700 px-2 py-1.5 flex flex-wrap gap-1.5 shrink-0 bg-surface-800/50">
          {probes.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-all"
              style={{
                backgroundColor: p.visible ? `${p.color}20` : 'transparent',
                color: p.visible ? p.color : '#6B7280',
                border: `1px solid ${p.visible ? p.color : '#E8E0D0'}`,
              }}
              onClick={() => toggleProbe(p.id)}
            >
              <span>{p.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeProbe(p.id);
                }}
                className="ml-0.5 opacity-50 hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const GraphPanel = memo(GraphPanelInner);
