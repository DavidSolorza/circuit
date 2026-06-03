import { lazy, Suspense, useMemo, memo } from 'react';
import { useGraph } from '../../hooks/useGraph';
import { useCircuitStore } from '../../store/circuitStore';

const Plot = lazy(() => import('react-plotly.js'));

function GraphPanelInner() {
  const { traces, clearData } = useGraph();
  const probes = useCircuitStore((s) => s.probes);
  const toggleProbe = useCircuitStore((s) => s.toggleProbeVisibility);
  const removeProbe = useCircuitStore((s) => s.removeProbe);

  const plotTraces = useMemo(() => {
    return traces.map((t) => ({
      x: t.data.map((d) => d.t),
      y: t.data.map((d) => d.v),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: t.label,
      line: { color: t.color, width: 1.5 },
      hovertemplate: `%{x:.3f}s<br>%{y:.4f}<extra>${t.label}</extra>`,
    }));
  }, [traces]);

  return (
    <div className="h-full flex flex-col bg-surface-900">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-700 shrink-0">
        <span className="panel-label">Osciloscopio</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-ink-faint font-mono">{traces.length} señal(es)</span>
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
              layout={{
                autosize: true,
                margin: { l: 40, r: 10, t: 20, b: 30 },
                paper_bgcolor: 'rgba(255,252,247,0)',
                plot_bgcolor: 'rgba(255,252,247,0)',
                font: { color: '#6B7280', size: 10 },
                xaxis: {
                  gridcolor: '#E8E0D0',
                  zerolinecolor: '#D0C8B5',
                  title: { text: 'Tiempo (s)', font: { size: 9, color: '#6B7280' } },
                  color: '#6B7280',
                },
                yaxis: {
                  gridcolor: '#E8E0D0',
                  zerolinecolor: '#D0C8B5',
                  title: { text: 'Valor', font: { size: 9, color: '#6B7280' } },
                  color: '#6B7280',
                },
                legend: {
                  font: { size: 8, color: '#6B7280' },
                  bgcolor: 'rgba(255,252,247,0.8)',
                  bordercolor: '#E8E0D0',
                },
                dragmode: 'zoom',
                hovermode: 'closest',
              }}
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
              ? 'Añade sondas a los componentes para ver señales'
              : 'Esperando datos de simulación...'}
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
