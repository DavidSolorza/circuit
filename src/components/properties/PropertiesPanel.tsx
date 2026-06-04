import { useCircuitStore } from '../../store/circuitStore';
import { COMPONENT_TEMPLATES } from '../../core/constants';
import { useMultimeter } from '../../hooks/useMultimeter';
import { fmtV, fmtI } from '../../utils/formatElectrical';
import { getComponentModelStatus, UNSUPPORTED_TYPES } from '../../utils/circuitModelInfo';
import { ParamNumberField } from './ParamNumberField';

export function PropertiesPanel() {
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const components = useCircuitStore((s) => s.circuit.components);
  const comp = selectedId ? components[selectedId] : null;
  const updateParam = useCircuitStore((s) => s.updateComponentParam);
  const rotate = useCircuitStore((s) => s.rotateComponent);
  const duplicate = useCircuitStore((s) => s.duplicateComponent);
  const remove = useCircuitStore((s) => s.removeComponent);
  const addProbe = useCircuitStore((s) => s.addProbe);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const simResults = useCircuitStore((s) => s.simResults);
  const { readComponent } = useMultimeter();

  if (!comp) {
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6v6H9z" />
          </svg>
        </div>
        <p className="text-xs text-ink-muted">Ningún componente seleccionado</p>
        <p className="text-[10px] text-ink-faint mt-1">Haz clic en un componente del canvas</p>
      </div>
    );
  }

  const template = COMPONENT_TEMPLATES[comp.type];
  const readings = readComponent(comp);
  const simOk = simulationRunning && simResults?.status.success;
  const modelStatus = getComponentModelStatus(comp);
  const unsupportedInCircuit = Object.values(components).filter((c) =>
    UNSUPPORTED_TYPES.has(c.type),
  );

  return (
    <div className="p-4 space-y-3">
      {unsupportedInCircuit.length > 0 && (
        <div className="rounded-lg border border-gold-200 bg-gold-50 px-2.5 py-2 text-[10px] text-gold-800">
          {unsupportedInCircuit.length} componente(s) no modelado(s) en el circuito — excluidos al
          simular.
        </div>
      )}
      {!modelStatus.supported && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[10px] text-red-700">
          <div className="font-semibold">No modelado</div>
          <div className="mt-0.5 opacity-90">{modelStatus.message}</div>
        </div>
      )}
      {modelStatus.approximated && modelStatus.message && (
        <div className="rounded-lg border border-gold-200 bg-gold-50 px-2.5 py-2 text-[10px] text-gold-800">
          <div className="font-semibold">Modelo aproximado</div>
          <div className="mt-0.5 opacity-90">{modelStatus.message}</div>
        </div>
      )}

      <div className="space-y-1">
        <div className="text-sm font-semibold text-ink uppercase tracking-wide">
          {template?.label ?? comp.type}
        </div>
        <div className="text-[10px] text-ink-faint font-mono">ID: {comp.id.slice(0, 12)}</div>
        <div className="text-[10px] text-ink-faint font-mono tabular-nums">
          Pos: ({Math.round(comp.position.x)}, {Math.round(comp.position.y)}) · Rot: {comp.rotation}
          °
        </div>
      </div>

      {template?.paramDefs && template.paramDefs.length > 0 && (
        <div className="panel-section space-y-2.5">
          <div className="panel-label">Parámetros</div>
          {template.paramDefs
            .filter((def) => def.key !== 'isClosed')
            .map((def) => (
              <ParamNumberField
                key={def.key}
                def={def}
                value={comp.params[def.key] ?? def.min}
                onCommit={(v) => updateParam(comp.id, def.key, v)}
              />
            ))}
          {comp.type === 'switch' && (
            <button
              onClick={() => updateParam(comp.id, 'isClosed', comp.params.isClosed ? 0 : 1)}
              className={`w-full py-1 rounded text-[10px] font-semibold transition-colors ${
                comp.params.isClosed
                  ? 'bg-primary-50 text-primary-600 border border-primary-300'
                  : 'bg-surface-800 text-surface-500 border border-surface-600'
              }`}
            >
              {comp.params.isClosed ? 'ENCENDIDO' : 'APAGADO'}
            </button>
          )}
        </div>
      )}

      {simOk && (
        <div className="panel-section space-y-2">
          <div className="panel-label flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Mediciones
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-950/40 rounded-md p-2 border border-surface-700/50">
              <div className="metric-label">Voltaje</div>
              <div className="text-xs font-mono text-primary-600 font-semibold tabular-nums">
                {fmtV(readings.voltage)}
              </div>
            </div>
            <div className="bg-surface-950/40 rounded-md p-2 border border-surface-700/50">
              <div className="metric-label">Corriente</div>
              <div className="text-xs font-mono text-primary-600 font-semibold tabular-nums">
                {fmtI(readings.current)}
              </div>
            </div>
            <div className="bg-surface-950/40 rounded-md p-2 border border-surface-700/50 col-span-2">
              <div className="metric-label">Potencia</div>
              <div className="text-xs font-mono text-gold-600 font-semibold tabular-nums">
                {Math.abs(readings.voltage * readings.current) >= 1
                  ? `${(readings.voltage * readings.current).toFixed(3)} W`
                  : `${(readings.voltage * readings.current * 1e3).toFixed(2)} mW`}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-surface-700" />

      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => rotate(comp.id)}
          className="px-2 py-1.5 rounded-md text-[10px] bg-surface-800 text-ink-muted hover:text-ink hover:bg-surface-700 transition-colors border border-surface-700"
          title="Rotar"
        >
          ↻ Rotar
        </button>
        <button
          onClick={() => duplicate(comp.id)}
          className="px-2 py-1.5 rounded-md text-[10px] bg-surface-800 text-ink-muted hover:text-ink hover:bg-surface-700 transition-colors border border-surface-700"
          title="Duplicar"
        >
          ⊞ Duplicar
        </button>
        <button
          onClick={() => addProbe('voltage', comp.id, 0)}
          className="px-2 py-1.5 rounded-md text-[10px] bg-gold-50 text-gold-700 hover:bg-gold-100 transition-colors border border-gold-200 font-medium"
          title="Añadir sonda"
        >
          Sonda
        </button>
      </div>

      <button
        onClick={() => remove(comp.id)}
        className="w-full py-2 rounded-lg text-[11px] bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200 font-medium"
      >
        Eliminar componente
      </button>
    </div>
  );
}
