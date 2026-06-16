import { lazy, Suspense, useMemo, memo, useCallback } from 'react';
import { useGraph } from '../../hooks/useGraph';
import { useCircuitStore } from '../../store/circuitStore';
import { exportOscCsv } from '../../shared/lib/exportOscCsv';
import { toastSuccess, toastWarning } from '../../shared/store/toastStore';
import { fmtI, fmtV } from '../../utils/formatElectrical';
import { DT } from '../../core/constants';

const OSC_WINDOW_SEC = 10;
const Plot = lazy(() => import('./PlotlyChart'));

function formatSample(type: 'voltage' | 'current', value: number): string {
  return type === 'current' ? fmtI(value) : fmtV(value);
}

function GraphPanelInner() {
  const { traces, clearData } = useGraph();
  const probes = useCircuitStore((s) => s.probes);
  const oscData = useCircuitStore((s) => s.oscData);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simTime = useCircuitStore((s) => s.simTime);
  const hasSimData = useCircuitStore((s) => s.simResults?.status.success ?? false);
  const toggleProbe = useCircuitStore((s) => s.toggleProbeVisibility);
  const removeProbe = useCircuitStore((s) => s.removeProbe);

  const hasVoltage = traces.some((t) => t.type === 'voltage');
  const hasCurrent = traces.some((t) => t.type === 'current');

  const exportTraces = useMemo(
    () =>
      probes
        .filter((p) => (oscData[p.id]?.length ?? 0) > 0)
        .map((p) => ({ label: p.label, data: oscData[p.id] })),
    [probes, oscData],
  );

  const handleExportCsv = useCallback(() => {
    if (exportTraces.length === 0) {
      toastWarning('Sin datos', 'Inicia la simulación con sondas activas.');
      return;
    }
    exportOscCsv(exportTraces, `osciloscopio-${Date.now()}.csv`);
    toastSuccess('CSV exportado', `${exportTraces.length} señal(es)`);
  }, [exportTraces]);

  const plotTraces = useMemo(() => {
    return traces.map((t) => {
      const unit = t.type === 'current' ? 'A' : 'V';
      const yaxis = t.type === 'current' && hasVoltage ? 'y2' : 'y';
      return {
        x: t.data.map((d) => d.t),
        y: t.data.map((d) => d.v),
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `${t.type === 'current' ? 'I ' : 'V '}${t.label}`,
        yaxis,
        line: {
          color: t.color,
          width: t.type === 'current' ? 2.5 : 2,
          shape: 'hv' as const,
        },
        hovertemplate: `%{x:.3f} s<br>%{y:.4g} ${unit}<extra>${t.label}</extra>`,
      };
    });
  }, [traces, hasVoltage]);

  const plotRevision = useMemo(
    () => plotTraces.reduce((sum, t) => sum + t.x.length, 0) + Math.floor(simTime * 10),
    [plotTraces, simTime],
  );

  const plotLayout = useMemo(() => {
    const followLive = simulationRunning && simTime > OSC_WINDOW_SEC;
    const layout: Record<string, unknown> = {
      autosize: true,
      margin: { l: 48, r: hasCurrent && hasVoltage ? 48 : 16, t: 8, b: 36 },
      paper_bgcolor: 'rgba(255,252,247,0)',
      plot_bgcolor: 'rgba(245,240,230,0.35)',
      font: { color: '#5C5A54', size: 10 },
      datarevision: plotRevision,
      uirevision: 'oscilloscope',
      xaxis: {
        gridcolor: '#E8E0D0',
        zerolinecolor: '#D0C8B5',
        title: { text: 'Tiempo (s)', font: { size: 10, color: '#6B7280' } },
        color: '#6B7280',
        autorange: !followLive,
        ...(followLive ? { range: [simTime - OSC_WINDOW_SEC, simTime + DT * 2] } : {}),
      },
      yaxis: {
        gridcolor: '#E8E0D0',
        zerolinecolor: '#9EBFB0',
        zerolinewidth: 1.5,
        title: {
          text: hasVoltage ? 'Voltaje (V)' : hasCurrent ? 'Corriente (A)' : 'Valor',
          font: { size: 10, color: '#1F4D3A' },
        },
        color: '#6B7280',
        autorange: true,
        rangemode: 'tozero',
        tickformat: hasVoltage && !hasCurrent ? '.3f' : undefined,
      },
      legend: {
        orientation: 'h',
        y: 1.12,
        x: 0,
        font: { size: 9, color: '#6B7280' },
        bgcolor: 'rgba(255,252,247,0.85)',
        bordercolor: '#E8E0D0',
      },
      dragmode: 'zoom',
      hovermode: 'x unified',
    };

    if (hasCurrent && hasVoltage) {
      layout.yaxis2 = {
        title: { text: 'Corriente (A)', font: { size: 10, color: '#B8975A' } },
        overlaying: 'y',
        side: 'right',
        gridcolor: 'rgba(232,224,208,0.4)',
        zerolinecolor: '#E4D4A8',
        color: '#6B7280',
        autorange: true,
        rangemode: 'tozero',
      };
    }

    return layout;
  }, [plotRevision, simulationRunning, simTime, hasVoltage, hasCurrent]);

  const lastValues = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of traces) {
      const last = t.data[t.data.length - 1];
      if (last) map.set(t.id, formatSample(t.type, last.v));
    }
    return map;
  }, [traces]);

  const emptyMessage =
    probes.length === 0
      ? 'Añade sondas con +V osc / +I osc en Propiedades del componente'
      : simulationRunning
        ? 'Capturando señales…'
        : hasSimData
          ? 'Datos listos — pulsa Iniciar de nuevo o limpia y reinicia'
          : 'Pulsa Iniciar simulación (paleta izquierda)';

  return (
    <div className="h-full flex flex-col bg-surface-900">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-700 shrink-0 bg-surface-800/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink">Osciloscopio</span>
          {simulationRunning && (
            <span className="text-[9px] text-sim-running font-medium animate-pulse">● LIVE</span>
          )}
          {!simulationRunning && traces.length > 0 && (
            <span className="text-[9px] text-ink-faint">(congelado)</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-ink-faint font-mono tabular-nums mr-1">
            {traces.length}/{probes.length}
          </span>
          <button
            onClick={handleExportCsv}
            disabled={exportTraces.length === 0}
            className="osc-toolbar-btn"
            title="Exportar CSV"
          >
            CSV
          </button>
          <button onClick={clearData} className="osc-toolbar-btn" title="Limpiar gráfica">
            Limpiar
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {plotTraces.length > 0 ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full text-xs text-ink-faint">
                Cargando…
              </div>
            }
          >
            <Plot
              data={plotTraces}
              layout={plotLayout}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-xs text-ink-muted gap-2 px-6 text-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8A877E"
              strokeWidth="1.5"
              className="opacity-50"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {emptyMessage}
          </div>
        )}
      </div>

      {probes.length > 0 && (
        <div className="border-t border-surface-700 px-2 py-2 flex flex-wrap gap-1.5 shrink-0 bg-surface-800/60 max-h-20 overflow-y-auto">
          {probes.map((p) => {
            const live = lastValues.get(p.id);
            return (
              <div
                key={p.id}
                className={`osc-probe-chip ${p.visible ? 'osc-probe-chip-on' : 'osc-probe-chip-off'}`}
                style={
                  p.visible
                    ? { borderColor: p.color, backgroundColor: `${p.color}18`, color: p.color }
                    : undefined
                }
                onClick={() => toggleProbe(p.id)}
              >
                <span className="font-mono text-[8px] opacity-70">{p.type === 'current' ? 'I' : 'V'}</span>
                <span className="truncate max-w-[88px]">{p.label}</span>
                {live && p.visible && (
                  <span className="font-mono text-[8px] opacity-80 tabular-nums">{live}</span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProbe(p.id);
                  }}
                  className="opacity-40 hover:opacity-100 ml-0.5"
                  aria-label="Quitar sonda"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const GraphPanel = memo(GraphPanelInner);
