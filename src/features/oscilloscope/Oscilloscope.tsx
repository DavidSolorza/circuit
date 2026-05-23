import { useRef, useEffect, useCallback } from 'react';
import uPlot from 'uplot';
import { useCircuitStore } from '../../store/circuitStore';
import { PROBE_COLORS } from '../../core/constants';

export function Oscilloscope() {
  const chartRef = useRef<HTMLDivElement>(null);
  const uplotRef = useRef<uPlot | null>(null);
  const prevProbeCountRef = useRef(0);

  const probes = useCircuitStore((s) => s.probes);
  const oscData = useCircuitStore((s) => s.oscData);
  const removeProbe = useCircuitStore((s) => s.removeProbe);
  const toggleProbeVisibility = useCircuitStore((s) => s.toggleProbeVisibility);
  const clearOscData = useCircuitStore((s) => s.clearOscData);

  const visibleProbes = probes.filter(p => p.visible);

  const buildChart = useCallback(() => {
    if (!chartRef.current) return;
    if (uplotRef.current) { uplotRef.current.destroy(); uplotRef.current = null; }

    const w = chartRef.current.clientWidth || 400;
    const h = chartRef.current.clientHeight || 200;

    const series: uPlot.Series[] = [
      { label: 't (s)', value: '{:.3f} s' },
      ...visibleProbes.map((p, i) => ({
        label: p.label,
        stroke: p.color,
        width: 1.5,
        spanGaps: false,
        points: { show: false } as any,
        fill: p.color + '08' as any,
      })),
    ];

    const opts: uPlot.Options = {
      width: w,
      height: h,
      cursor: { show: true, drag: { x: false, y: false } },
      select: { show: false, left: 0, top: 0, width: 0, height: 0 },
      legend: { show: false },
      axes: [
        {
          stroke: '#9ca3af',
          grid: { stroke: 'rgba(156,163,175,0.12)', width: 1 },
          label: 'Time (s)',
          labelSize: 10,
          size: 36,
        },
        {
          stroke: '#9ca3af',
          grid: { stroke: 'rgba(156,163,175,0.12)', width: 1 },
          label: 'V / I',
          labelSize: 10,
          size: 48,
        },
      ],
      series,
    };

    uplotRef.current = new uPlot(opts, [[], ...visibleProbes.map(() => [])], chartRef.current);
    prevProbeCountRef.current = visibleProbes.length;
  }, [visibleProbes]);

  useEffect(() => {
    buildChart();
    const onResize = () => {
      if (uplotRef.current && chartRef.current) {
        uplotRef.current.setSize({
          width: chartRef.current.clientWidth || 400,
          height: chartRef.current.clientHeight || 200,
        });
      }
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (uplotRef.current) { uplotRef.current.destroy(); uplotRef.current = null; }
    };
  }, [buildChart]);

  useEffect(() => {
    if (!uplotRef.current || visibleProbes.length === 0) return;

    const allTimes = new Set<number>();
    for (const p of visibleProbes) {
      const d = oscData[p.id];
      if (d) for (const pt of d) allTimes.add(pt.t);
    }

    const sorted = [...allTimes].sort((a, b) => a - b);
    if (sorted.length === 0) return;

    const timeMap = new Map(sorted.map((t, i) => [t, i]));
    const xData = sorted;
    const ySeries: number[][] = visibleProbes.map(() => new Array(sorted.length).fill(NaN));

    for (let pi = 0; pi < visibleProbes.length; pi++) {
      const d = oscData[visibleProbes[pi].id];
      if (!d) continue;
      for (const pt of d) {
        const idx = timeMap.get(pt.t);
        if (idx !== undefined) ySeries[pi][idx] = pt.v;
      }
    }

    uplotRef.current.setData([xData, ...ySeries]);
  }, [oscData, visibleProbes]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center justify-between px-3 py-1 bg-gray-800/50 border-b border-gray-800 shrink-0 min-h-[30px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {probes.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleProbeVisibility(p.id)}
              className={`
                text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1
                transition-all duration-100 font-medium
                ${p.visible
                  ? 'text-white border border-transparent'
                  : 'text-gray-600 border border-gray-800 line-through'
                }
              `}
              style={{ backgroundColor: p.visible ? p.color + '30' : 'transparent' }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span>{p.label}</span>
              <span
                onClick={(e) => { e.stopPropagation(); removeProbe(p.id); }}
                className="ml-0.5 text-gray-500 hover:text-red-400 cursor-pointer"
              >
                &times;
              </span>
            </button>
          ))}
        </div>
        {probes.length > 0 && (
          <button onClick={clearOscData} className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors shrink-0 ml-2">
            Clear
          </button>
        )}
      </div>

      {probes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xs">
          <div className="text-center">
            <div className="text-lg mb-1">{'\u25C9'}</div>
            <p>Add probes to start measuring</p>
            <p className="text-[10px] mt-1 text-gray-700">
              Select a component {'>'} Properties {'>'} + Voltage / Current Probe
            </p>
          </div>
        </div>
      ) : !visibleProbes.length ? (
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xs">
          All probes hidden &mdash; click to toggle
        </div>
      ) : (
        <div ref={chartRef} className="flex-1 min-h-0" />
      )}
    </div>
  );
}
