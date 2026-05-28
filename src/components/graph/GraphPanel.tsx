import { useMemo, memo } from 'react';
import Plot from 'react-plotly.js';
import { useGraph } from '../../hooks/useGraph';
import { useCircuitStore } from '../../store/circuitStore';

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
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Osciloscopio</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-600">{traces.length} señal(es)</span>
          <button onClick={clearData} className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors px-1.5 py-0.5 rounded bg-surface-800 border border-surface-700">
            Limpiar
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {plotTraces.length > 0 ? (
          <Plot
            data={plotTraces}
            layout={{
              autosize: true,
              margin: { l: 40, r: 10, t: 20, b: 30 },
              paper_bgcolor: 'rgba(26,27,46,0)',
              plot_bgcolor: 'rgba(26,27,46,0)',
              font: { color: '#94a3b8', size: 10 },
              xaxis: {
                gridcolor: '#334155',
                zerolinecolor: '#475569',
                title: { text: 'Tiempo (s)', font: { size: 9, color: '#94a3b8' } },
                color: '#64748b',
              },
              yaxis: {
                gridcolor: '#334155',
                zerolinecolor: '#475569',
                title: { text: 'Valor', font: { size: 9, color: '#94a3b8' } },
                color: '#64748b',
              },
              legend: {
                font: { size: 8, color: '#94a3b8' },
                bgcolor: 'rgba(26,27,46,0.8)',
                borderColor: '#334155',
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
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-600">
            {probes.length === 0 ? 'Añade sondas a los componentes para ver señales' : 'Esperando datos...'}
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
                color: p.visible ? p.color : '#64748b',
                border: `1px solid ${p.visible ? p.color : '#334155'}`,
              }}
              onClick={() => toggleProbe(p.id)}
            >
              <span>{p.label}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeProbe(p.id); }}
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
