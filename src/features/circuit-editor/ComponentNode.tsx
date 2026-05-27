import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { ResistorSvg, CapacitorSvg, InductorSvg, VoltageSourceSvg, CurrentSourceSvg, LedSvg, SwitchSvg, GroundSvg, getSymbolColor } from '../../components/symbols';
import type { ComponentType } from '../../types';

const symbolMap: Record<string, React.FC<{ size?: number; color?: string }>> = {
  resistor: ResistorSvg,
  capacitor: CapacitorSvg,
  inductor: InductorSvg,
  voltageSource: VoltageSourceSvg,
  currentSource: CurrentSourceSvg,
  led: LedSvg,
  switch: SwitchSvg,
  ground: GroundSvg,
};

export interface ComponentNodeData {
  label: string;
  type: ComponentType;
  params: Record<string, number>;
  rotation: number;
  selected: boolean;
}

function ComponentNode({ data, selected }: NodeProps<ComponentNodeData>) {
  const Sym = symbolMap[data.type];
  const color = getSymbolColor(data.type);
  const isGround = data.type === 'ground';

  return (
    <div
      className={`
        relative flex items-center justify-center
        w-24 h-16 rounded-lg transition-shadow duration-150
        ${selected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : 'hover:shadow-md'}
        ${selected ? 'bg-gray-800/90' : 'bg-transparent'}
      `}
      style={{ transform: `rotate(${data.rotation}deg)` }}
    >
      {!isGround && (
        <Handle
          type="target"
          position={Position.Left}
          id="term0"
          className="w-3 h-3 !bg-blue-500 !border-2 !border-gray-900 hover:!bg-blue-400"
        />
      )}
      {Sym && <Sym size={80} color={color} />}
      {!isGround && (
        <Handle
          type="source"
          position={Position.Right}
          id="term1"
          className="w-3 h-3 !bg-blue-500 !border-2 !border-gray-900 hover:!bg-blue-400"
        />
      )}
    </div>
  );
}

export default memo(ComponentNode);
