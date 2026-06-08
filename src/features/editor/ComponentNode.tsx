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
import { getElectricalNodeForTerminal } from '../../services/localSimulation';
import { getHandleConfig, getHandlePositionCSS } from '../../utils/componentHandles';

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

function getLatest(arr: number[] | undefined): number {
  return arr && arr.length > 0 ? arr[arr.length - 1] : 0;
}

function ComponentNode({ id, data, selected }: NodeProps<ComponentNodeData>) {
  const Sym = symbolMap[data.type];
  const color = getSymbolColor(data.type);

  const simulationRunning = useCircuitStore((s) => s.simulationRunning);
  const branchCurrents = useCircuitStore((s) => s.simResults?.branchCurrents);
  const nodeVoltages = useCircuitStore((s) => s.simResults?.nodeVoltages);
  const circuit = useCircuitStore((s) => s.circuit);
  const terminals = circuit.terminals;
  const simResults = useCircuitStore((s) => s.simResults);
  const current = getLatest(branchCurrents?.[id]);

  const isLit =
    data.type === 'led' &&
    simulationRunning &&
    simResults?.status?.success &&
    Math.abs(current) > 1e-6;

  const showCurrent =
    data.type === 'ammeter' || data.type === 'resistor' || data.type === 'led' || data.type === 'inductor';

  const currentStr =
    simulationRunning &&
    simResults?.status?.success &&
    showCurrent &&
    Math.abs(current) > 1e-12
      ? Math.abs(current) >= 1e-3
        ? `${(Math.abs(current) * 1e3).toFixed(1)} mA`
        : `${(Math.abs(current) * 1e6).toFixed(0)} \u00B5A`
      : null;

  const comp = useCircuitStore((s) => s.circuit.components[id]);
  const t0 = comp ? terminals[comp.terminalIds[0]] : null;
  const t1 = comp ? terminals[comp.terminalIds[1]] : null;
  const voltage0 =
    t0 && nodeVoltages
      ? getLatest(nodeVoltages[String(getElectricalNodeForTerminal(circuit, t0.id))])
      : null;
  const voltage1 =
    t1 && nodeVoltages
      ? getLatest(nodeVoltages[String(getElectricalNodeForTerminal(circuit, t1.id))])
      : null;
  const compVoltage =
    simulationRunning && voltage0 !== null && voltage1 !== null ? voltage0 - voltage1 : null;

  const showVoltage =
    data.type === 'voltmeter' ||
    data.type === 'led' ||
    data.type === 'resistor' ||
    data.type === 'capacitor' ||
    data.type === 'voltageSource';

  const voltageStr =
    showVoltage &&
    compVoltage !== null &&
    simResults?.status?.success &&
    (data.type !== 'voltmeter' ? Math.abs(compVoltage) > 1e-9 : true)
      ? Math.abs(compVoltage) >= 1
        ? `${compVoltage.toFixed(2)} V`
        : `${(compVoltage * 1e3).toFixed(1)} mV`
      : null;

  const hc = selected ? '#C9A86A' : color;
  const switchClosed = data.params?.isClosed === 1;

  const handleConfigs = getHandleConfig(data.type);

  // Map position strings to ReactFlow Position enum
  const positionMap: Record<string, Position> = {
    left: Position.Left,
    right: Position.Right,
    top: Position.Top,
    bottom: Position.Bottom,
  };

  const handleBase =
    '!w-[20px] !h-[20px] !border-[3px] !border-surface-900 !cursor-crosshair !transition-all !duration-150 hover:!scale-125 !shadow-lg';

  const getHandleColor = (handleCfg: ReturnType<typeof getHandleConfig>[0]) => {
    if (handleCfg.isPositive === true) return handleBase + ' !bg-red-500 hover:!bg-red-400';
    if (handleCfg.isPositive === false) return handleBase + ' !bg-blue-500 hover:!bg-blue-400';
    return handleBase + ' !bg-blue-500 hover:!bg-blue-400';
  };

  return (
    <div
      className={`
      relative flex items-center justify-center
      w-28 h-20 rounded-lg transition-all duration-200 select-none
      ${selected ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/20 bg-surface-800' : 'bg-surface-800/80 hover:bg-surface-800 hover:ring-1 hover:ring-surface-700'}
      ${isLit ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30' : ''}
    `}
      style={{ transform: `rotate(${data.rotation}deg)`, zIndex: selected ? 10 : 1 }}
    >
      {/* Render handles based on component type configuration */}
      {handleConfigs.map((handleCfg) => {
        const pos = positionMap[handleCfg.position] || Position.Left;
        const isHidden = data.type === 'ground' && handleCfg.position !== 'top';

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
            style={isHidden ? {} : getHandlePositionCSS(handleCfg, { width: 112, height: 80 })}
          />
        );
      })}

      {Sym && (
        <Sym size={90} color={isLit ? '#ffdd44' : hc} highlight={selected} closed={switchClosed} />
      )}
      {isLit && (
        <div className="absolute inset-0 rounded-lg pointer-events-none shadow-[0_0_16px_8px_rgba(255,220,50,0.25)]" />
      )}

      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] text-surface-500 whitespace-nowrap pointer-events-none font-medium"></div>

      {voltageStr && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono text-primary-500/80 whitespace-nowrap pointer-events-none">
          {voltageStr}
        </div>
      )}
      {currentStr && data.type !== 'led' && !isLit && (
        <div className="absolute -bottom-4 right-0 text-[7px] font-mono text-primary-500/70 whitespace-nowrap pointer-events-none">
          {currentStr}
        </div>
      )}
      {isLit && currentStr && (
        <div className="absolute -bottom-4 right-0 text-[7px] font-mono text-yellow-500/80 whitespace-nowrap pointer-events-none">
          {currentStr}
        </div>
      )}
      {!simulationRunning && simResults && data.type !== 'ground' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-surface-500 whitespace-nowrap pointer-events-none">
          Pausado
        </div>
      )}
    </div>
  );
}

export default memo(ComponentNode);
