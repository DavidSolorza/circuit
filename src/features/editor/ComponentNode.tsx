import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import {
  ResistorSvg,
  CapacitorSvg,
  InductorSvg,
  VoltageSourceSvg,
  CurrentSourceSvg,
  LedSvg,
  DiodeSvg,
  TransistorSvg,
  PotentiometerSvg,
  SwitchSvg,
  GroundSvg,
  VoltmeterSvg,
  AmmeterSvg,
  getSymbolColor,
} from '../../components/symbols';
import type { ComponentType } from '../../types';
import { useCircuitStore } from '../../store/circuitStore';
import { getHandleConfig, getHandlePositionCSS } from '../../utils/componentHandles';
import { getComponentReadings } from '../../utils/componentReadings';
import { fmtI, fmtV } from '../../utils/formatElectrical';

const symbolMap: Record<
  string,
  React.FC<{ size?: number; color?: string; highlight?: boolean; closed?: boolean }>
> = {
  resistor: ResistorSvg,
  capacitor: CapacitorSvg,
  inductor: InductorSvg,
  voltageSource: VoltageSourceSvg,
  currentSource: CurrentSourceSvg,
  led: LedSvg,
  diode: DiodeSvg,
  transistor: TransistorSvg,
  potentiometer: PotentiometerSvg,
  switch: SwitchSvg,
  ground: GroundSvg,
  voltmeter: VoltmeterSvg,
  ammeter: AmmeterSvg,
};

export interface ComponentNodeData {
  label: string;
  type: ComponentType;
  params: Record<string, number>;
  rotation: number;
  selected: boolean;
}

const NODE_SIZE = 96;
const GROUND_SIZE = 80;

function ComponentNode({ id, data, selected }: NodeProps<ComponentNodeData>) {
  const Sym = symbolMap[data.type];
  const color = getSymbolColor(data.type);
  const isGround = data.type === 'ground';
  const box = isGround ? GROUND_SIZE : NODE_SIZE;
  const symbolSize = isGround ? 56 : 68;

  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const circuit = useCircuitStore((s) => s.circuit);
  const simResults = useCircuitStore((s) => s.simResults);
  const comp = circuit.components[id];
  const hasReadings = simResults?.status?.success ?? false;
  const readings = comp && hasReadings ? getComponentReadings(circuit, simResults, comp) : null;

  const current = readings?.current ?? 0;
  const compVoltage = readings?.voltage ?? null;

  const ledVf = data.params?.forwardVoltage ?? 2;
  const forwardVd = compVoltage !== null ? -compVoltage : 0;
  const isLit =
    data.type === 'led' &&
    hasReadings &&
    forwardVd >= ledVf * 0.75 &&
    Math.abs(current) > 1e-6;

  const showCurrent =
    data.type === 'ammeter' ||
    data.type === 'resistor' ||
    data.type === 'led' ||
    data.type === 'inductor' ||
    data.type === 'currentSource';

  const displayCurrent = data.type === 'led' ? Math.abs(current) : current;
  const currentStr =
    hasReadings &&
    (data.type === 'ammeter' || (showCurrent && Math.abs(current) > 1e-12))
      ? fmtI(displayCurrent)
      : null;

  const showVoltage =
    data.type === 'voltmeter' ||
    data.type === 'led' ||
    data.type === 'resistor' ||
    data.type === 'capacitor' ||
    data.type === 'voltageSource';

  const displayVoltage =
    data.type === 'led' && compVoltage !== null ? -compVoltage : compVoltage;

  const voltageStr =
    hasReadings &&
    showVoltage &&
    displayVoltage !== null &&
    (data.type === 'voltmeter' ||
      data.type === 'voltageSource' ||
      data.type === 'led' ||
      Math.abs(displayVoltage) > 1e-9)
      ? fmtV(displayVoltage)
      : null;

  const hc = selected ? '#C9A86A' : color;
  const switchClosed = data.params?.isClosed === 1;
  const handleConfigs = getHandleConfig(data.type);
  const hasMeasurement = Boolean(voltageStr || currentStr);

  const positionMap: Record<string, Position> = {
    left: Position.Left,
    right: Position.Right,
    top: Position.Top,
    bottom: Position.Bottom,
  };

  const handleBase =
    '!w-4 !h-4 !border-2 !border-surface-900 !cursor-crosshair !transition-all !duration-150 hover:!scale-125 !shadow-md';

  const getHandleColor = (handleCfg: ReturnType<typeof getHandleConfig>[0]) => {
    if (handleCfg.isPositive === true) return handleBase + ' !bg-red-500 hover:!bg-red-400';
    if (handleCfg.isPositive === false) return handleBase + ' !bg-blue-500 hover:!bg-blue-400';
    return handleBase + ' !bg-primary-500 hover:!bg-primary-400';
  };

  return (
    <div
      className={`
      relative flex items-center justify-center rounded-xl transition-all duration-200 select-none
      border shadow-sm
      ${isGround ? 'w-20 h-20' : 'w-24 h-24'}
      ${
        selected
          ? 'ring-2 ring-primary-500/80 border-primary-500/40 bg-surface-900 shadow-md shadow-primary-500/10'
          : 'bg-surface-900/95 border-surface-700/90 hover:border-surface-600 hover:shadow-md'
      }
      ${isLit ? 'ring-2 ring-yellow-400/90 border-yellow-500/40 shadow-lg shadow-yellow-400/20' : ''}
    `}
      style={{ transform: `rotate(${data.rotation}deg)`, zIndex: selected ? 10 : 1 }}
    >
      {handleConfigs.map((handleCfg) => {
        const pos = positionMap[handleCfg.position] || Position.Left;
        const isHidden = isGround && handleCfg.position !== 'top';

        return (
          <Handle
            key={handleCfg.id}
            type="source"
            position={pos}
            id={handleCfg.id}
            isConnectable
            className={
              isHidden
                ? '!w-0 !h-0 !opacity-0'
                : `${getHandleColor(handleCfg)} circuit-handle !opacity-100`
            }
            style={isHidden ? {} : getHandlePositionCSS(handleCfg, { width: box, height: box })}
          />
        );
      })}

      {Sym && (
        <Sym size={symbolSize} color={isLit ? '#ffdd44' : hc} highlight={selected} closed={switchClosed} />
      )}
      {isLit && (
        <div className="absolute inset-0 rounded-xl pointer-events-none shadow-[0_0_14px_6px_rgba(255,220,50,0.22)]" />
      )}

      <div className="absolute -top-3 left-1/2 -translate-x-1/2 max-w-[108px] pointer-events-none">
        <span className="block truncate text-center text-[7px] font-semibold text-ink-muted px-1.5 py-0.5 rounded-md bg-surface-950/90 border border-surface-700/80 shadow-sm">
          {data.label}
        </span>
      </div>

      {hasMeasurement && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 pointer-events-none">
          {voltageStr && (
            <span
              className={`text-[6px] font-mono px-1 py-px rounded bg-primary-950/90 border border-primary-700/50 ${isLit ? 'text-yellow-300' : 'text-primary-400'}`}
            >
              {voltageStr}
            </span>
          )}
          {currentStr && (
            <span
              className={`text-[6px] font-mono px-1 py-px rounded bg-gold-950/90 border border-gold-700/50 ${isLit ? 'text-yellow-300' : 'text-gold-400'}`}
            >
              {currentStr}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ComponentNode);
