import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGraph } from '../../hooks/useGraph';
import { useCircuitStore } from '../../store/circuitStore';

export function GraphPanel() {
  const { traces, clearData } = useGraph();
  const probes = useCircuitStore((s) => s.probes);
  const toggleProbe = useCircuitStore((s) => s.toggleProbeVisibility);
  const removeProbe = useCircuitStore((s) => s.removeProbe);

  const chartData = useMemo(() => {
    if (traces.length === 0) return [];
    const maxLen = Math.max(...traces.map(t => t.data.length));
    const result: Record<string, number | string>[] = [];
    for (let i = 0; i < maxLen; i++) {
      const point: Record<string, number | string> = { idx: i };
      for (const t of traces) {
        if (t.data[i]) point[t.id] = t.data[i].v;
      }
      result.push(point);
    }
    return result;
  }, [traces]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Oscilloscope</span>
        <div className="flex items-center gap-2">
          <button onClick={clearData} className="text-[9px] text-gray-600 hover:text-gray-400 transition-colors px-1.5 py-0.5 rounded bg-gray-800">Clear</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="idx" stroke="#475569" tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v * 0.016).toFixed(1)}s`} />
              <YAxis stroke="#475569" tick={{ fontSize: 9 }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
              {traces.map((t) => (
                <Line key={t.id} type="monotone" dataKey={t.id} stroke={t.color} dot={false} strokeWidth={1.5} name={t.label} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-gray-700">
            {probes.length === 0 ? 'Add probes to components to see traces' : 'Waiting for data...'}
          </div>
        )}
      </div>

      {probes.length > 0 && (
        <div className="border-t border-gray-800 px-2 py-1.5 flex flex-wrap gap-1.5">
          {probes.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-all"
              style={{ backgroundColor: p.visible ? `${p.color}15` : 'transparent', color: p.visible ? p.color : '#4b5563', border: `1px solid ${p.visible ? p.color : '#374151'}` }}
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
