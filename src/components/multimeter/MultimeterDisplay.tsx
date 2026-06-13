import { useMultimeter } from '../../hooks/useMultimeter';
import { useCircuit } from '../../hooks/useCircuit';
import { fmtV, fmtI, fmtP } from '../../utils/formatElectrical';
import { currentDirectionLabel } from '../../utils/componentReadings';

function fmtTinyV(v: number): string {
  return Math.abs(v) < 1e-9 ? '≈ 0 V' : fmtV(v);
}

function fmtTinyI(i: number): string {
  return Math.abs(i) < 1e-12 ? '≈ 0 A' : fmtI(i);
}

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
        <p className="text-xs text-ink-muted">Elige un componente en el canvas</p>
        <p className="text-[10px] text-ink-faint mt-1">Aquí verás V, I y potencia al simular</p>
      </div>
    );
  }

  const isAmmeter = selectedComp.type === 'ammeter';
  const isVoltmeter = selectedComp.type === 'voltmeter';
  const isLed = selectedComp.type === 'led';

  if (!hasReadings) {
    return (
      <div className="p-4 space-y-3">
        <div className="panel-label">{selectedComp.label}</div>
        <div className="rounded-lg border border-surface-700 bg-surface-800/80 px-3 py-3 text-center">
          <p className="text-xs text-ink-muted">Sin mediciones aún</p>
          <p className="text-[10px] text-ink-faint mt-1 leading-relaxed">
            Pulsa <span className="text-gold-600 font-semibold">Iniciar simulación</span> en la
            paleta izquierda.
          </p>
        </div>
        {isAmmeter && (
          <p className="text-[10px] text-ink-faint text-center">
            El amperímetro mide la corriente que pasa en serie (borne 1 → borne 2).
          </p>
        )}
        {isVoltmeter && (
          <p className="text-[10px] text-ink-faint text-center">
            El voltímetro mide la diferencia de potencial entre sus dos bornes.
          </p>
        )}
      </div>
    );
  }

  const r = readComponent(selectedComp);
  const live = isRunning;

  return (
    <div className="p-4 space-y-3">
      <div className="panel-label flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${live ? 'bg-green-500 animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.5)]' : 'bg-surface-500'}`}
        />
        {selectedComp.label}
        {isAmmeter && (
          <span className="text-[9px] text-primary-600 font-normal normal-case">(serie)</span>
        )}
        {isVoltmeter && (
          <span className="text-[9px] text-primary-600 font-normal normal-case">(paralelo)</span>
        )}
        {!live && (
          <span className="text-[9px] text-ink-faint font-normal normal-case">(pausado)</span>
        )}
      </div>

      {isAmmeter ? (
        <div className={`metric-card ${live ? 'ring-1 ring-primary-500/20' : 'opacity-95'}`}>
          <div className="metric-label">Corriente en serie</div>
          <div className="metric-value text-xl">{fmtI(r.current)}</div>
          <div className="text-[9px] text-ink-faint mt-1">
            Sentido: {currentDirectionLabel(r.current)}
          </div>
          <div className="text-[9px] text-ink-faint mt-0.5">
            Caída interna: {fmtTinyV(r.voltage)}
          </div>
        </div>
      ) : isVoltmeter ? (
        <div className={`metric-card ${live ? 'ring-1 ring-primary-500/20' : 'opacity-95'}`}>
          <div className="metric-label">Voltaje entre bornes</div>
          <div className="metric-value text-xl">{fmtV(r.voltage)}</div>
          <div className="text-[9px] text-ink-faint mt-0.5">
            Corriente de fuga: {fmtTinyI(r.current)}
          </div>
        </div>
      ) : isLed ? (
        <div className={`metric-card ${live ? 'ring-1 ring-yellow-400/30' : 'opacity-95'}`}>
          <div className="metric-label">LED — caída directa</div>
          <div className="metric-value text-xl">{fmtV(-r.voltage)}</div>
          <div className="text-[9px] text-ink-faint mt-1">
            Corriente: {fmtI(Math.abs(r.current))} · Potencia: {fmtP(r.power)}
          </div>
          <div className="text-[9px] text-ink-faint mt-0.5">
            {Math.abs(r.current) > 1e-6 && -r.voltage >= (selectedComp.params.forwardVoltage ?? 2) * 0.75
              ? '● Encendido'
              : '○ Apagado / bloqueado'}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className={`metric-card ${live ? '' : 'opacity-95'}`}>
              <div className="metric-label">Voltaje</div>
              <div className="metric-value text-base">{fmtV(r.voltage)}</div>
              <div className="text-[9px] text-ink-faint mt-0.5">V(borne 1) − V(borne 2)</div>
            </div>
            <div className={`metric-card ${live ? '' : 'opacity-95'}`}>
              <div className="metric-label">Corriente</div>
              <div className="metric-value text-base">{fmtI(r.current)}</div>
              <div className="text-[9px] text-ink-faint mt-0.5">{currentDirectionLabel(r.current)}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Potencia disipada</div>
            <div className="text-sm font-mono text-gold-600 font-bold tabular-nums">
              {fmtP(r.power)}
            </div>
          </div>
        </>
      )}

      {!live && (
        <p className="text-[10px] text-ink-faint text-center">
          Pulsa <span className="text-gold-600 font-semibold">INICIAR</span> para actualizar en vivo.
        </p>
      )}
    </div>
  );
}
