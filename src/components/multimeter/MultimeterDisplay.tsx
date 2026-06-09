import { useMultimeter } from '../../hooks/useMultimeter';
import { useCircuit } from '../../hooks/useCircuit';
import { fmtV, fmtI, fmtP } from '../../utils/formatElectrical';

export function MultimeterDisplay() {
  const { selectedComp } = useCircuit();
  const { readComponent, isRunning, results } = useMultimeter();
  const hasReadings = results?.status.success ?? false;

  if (!selectedComp) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center mt-4">
        <div className="w-10 h-10 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center mb-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A877E"
            strokeWidth="1.5"
          >
            <path d="M12 2v4m0 12v4M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0" />
          </svg>
        </div>
        <p className="text-xs text-ink-muted">Selecciona un componente para medir</p>
        <p className="text-[10px] text-ink-faint mt-1">
          Voltaje, corriente y potencia en tiempo real
        </p>
      </div>
    );
  }

  const isAmmeter = selectedComp.type === 'ammeter';
  const isVoltmeter = selectedComp.type === 'voltmeter';

  if (!isRunning) {
    const r = hasReadings ? readComponent(selectedComp) : null;
    return (
      <div className="p-4 space-y-3">
        <div className="panel-label flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-surface-600" />
          {selectedComp.label}
          {hasReadings && (
            <span className="text-[9px] text-ink-faint font-normal normal-case">(última medición)</span>
          )}
        </div>
        {!hasReadings ? (
          <div className="rounded-lg border border-surface-700 bg-surface-800/80 px-3 py-3 text-center">
            <p className="text-xs text-ink-muted">Simulación detenida</p>
            <p className="text-[10px] text-ink-faint mt-1 leading-relaxed">
              Pulsa <span className="text-gold-600 font-semibold">INICIAR</span> en la barra lateral
              para ver mediciones en tiempo real.
            </p>
          </div>
        ) : isAmmeter ? (
          <div className="metric-card opacity-90">
            <div className="metric-label">Corriente medida</div>
            <div className="metric-value text-lg">{fmtI(r!.current)}</div>
          </div>
        ) : isVoltmeter ? (
          <div className="metric-card opacity-90">
            <div className="metric-label">Voltaje medido</div>
            <div className="metric-value text-lg">{fmtV(r!.voltage)}</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 opacity-90">
            <div className="metric-card">
              <div className="metric-label">Voltaje</div>
              <div className="metric-value text-base">{fmtV(r!.voltage)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Corriente</div>
              <div className="metric-value text-base">{fmtI(r!.current)}</div>
            </div>
          </div>
        )}
        <p className="text-[10px] text-ink-faint text-center">
          Pulsa <span className="text-gold-600 font-semibold">INICIAR</span> para actualizar en vivo.
        </p>
      </div>
    );
  }

  const r = readComponent(selectedComp);

  return (
    <div className="p-4 space-y-3">
      <div className="panel-label flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
        {selectedComp.label}
        {isAmmeter && (
          <span className="text-[9px] text-primary-600 font-normal normal-case">(serie)</span>
        )}
        {isVoltmeter && (
          <span className="text-[9px] text-primary-600 font-normal normal-case">(paralelo)</span>
        )}
      </div>
      {isAmmeter ? (
        <div className="metric-card ring-1 ring-primary-500/20">
          <div className="metric-label">Corriente medida</div>
          <div className="metric-value text-lg">{fmtI(r.current)}</div>
          <div className="text-[9px] text-ink-faint mt-0.5">
            Caída interna: {fmtV(r.voltage)} (ideal ≈ 0)
          </div>
        </div>
      ) : isVoltmeter ? (
        <div className="metric-card ring-1 ring-primary-500/20">
          <div className="metric-label">Voltaje medido</div>
          <div className="metric-value text-lg">{fmtV(r.voltage)}</div>
          <div className="text-[9px] text-ink-faint mt-0.5">
            Corriente interna: {fmtI(r.current)} (ideal ≈ 0)
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="metric-card">
            <div className="metric-label">Voltaje</div>
            <div className="metric-value text-base">{fmtV(r.voltage)}</div>
            <div className="text-[9px] text-ink-faint mt-0.5">CC</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Corriente</div>
            <div className="metric-value text-base">{fmtI(r.current)}</div>
            <div className="text-[9px] text-ink-faint mt-0.5">CC</div>
          </div>
        </div>
      )}
      {isRunning && (
        <div className="metric-card">
          <div className="metric-label">Potencia</div>
          <div className="text-sm font-mono text-gold-600 font-bold tabular-nums">
            {fmtP(r.voltage * r.current)}
          </div>
        </div>
      )}
    </div>
  );
}
