import { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import { useCircuitStore } from '../../store/circuitStore';
import { Grid } from './Grid';
import { ComponentShape } from './ComponentShape';
import { WireLine } from './WireLines';
import { COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, COMPONENT_WIDTH, COMPONENT_HEIGHT } from '../../core/constants';

interface Props {
  width: number;
  height: number;
}

function getTerminalWorldPos(
  comp: { position: { x: number; y: number }; rotation: number } | undefined,
  index: 0 | 1,
): { x: number; y: number } | null {
  if (!comp) return null;
  const dx = index === 0 ? -COMPONENT_WIDTH / 2 : COMPONENT_WIDTH / 2;
  const cos = Math.cos((comp.rotation * Math.PI) / 180);
  const sin = Math.sin((comp.rotation * Math.PI) / 180);
  return {
    x: comp.position.x + dx * cos,
    y: comp.position.y + dx * sin,
  };
}

function fmtVolt(v: number): string {
  if (Math.abs(v) >= 1) return `${v.toFixed(2)}V`;
  return `${(v * 1000).toFixed(1)}mV`;
}
function fmtCurr(v: number): string {
  const a = Math.abs(v);
  if (a >= 1) return `${v.toFixed(2)}A`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(1)}mA`;
  if (a >= 1e-6) return `${(v * 1e6).toFixed(0)}µA`;
  return `${(v * 1e9).toFixed(0)}nA`;
}

export function CircuitCanvas({ width, height }: Props) {
  const stageRef = useRef<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const components = useCircuitStore((s) => s.circuit.components);
  const wires = useCircuitStore((s) => s.circuit.wires);
  const terminals = useCircuitStore((s) => s.circuit.terminals);
  const selectedId = useCircuitStore((s) => s.selectedComponentId);
  const activeTool = useCircuitStore((s) => s.activeTool);
  const connectingFrom = useCircuitStore((s) => s.connectingFrom);
  const simResults = useCircuitStore((s) => s.simResults);
  const simulationRunning = useCircuitStore((s) => s.simulationRunning);

  const addComponent = useCircuitStore((s) => s.addComponent);
  const moveComponent = useCircuitStore((s) => s.moveComponent);
  const selectComponent = useCircuitStore((s) => s.selectComponent);
  const startConnection = useCircuitStore((s) => s.startConnection);
  const completeConnection = useCircuitStore((s) => s.completeConnection);
  const cancelConnection = useCircuitStore((s) => s.cancelConnection);
  const setActiveTool = useCircuitStore((s) => s.setActiveTool);
  const addProbe = useCircuitStore((s) => s.addProbe);

  const handleStageClick = useCallback(
    (e: any) => {
      if (e.target === e.target.getStage()) {
        if (activeTool === 'wire' && connectingFrom) { cancelConnection(); return; }
        if (activeTool === 'resistor' || activeTool === 'capacitor' || activeTool === 'inductor' ||
            activeTool === 'voltageSource' || activeTool === 'currentSource' || activeTool === 'switch' ||
            activeTool === 'led' || activeTool === 'ground') {
          const pos = e.target.getStage().getPointerPosition();
          addComponent(activeTool, { x: pos.x, y: pos.y });
          setActiveTool('select');
          return;
        }
        selectComponent(null);
      }
    },
    [activeTool, connectingFrom, addComponent, selectComponent, cancelConnection, setActiveTool],
  );

  const handleDragEnd = useCallback((id: string, pos: { x: number; y: number }) => moveComponent(id, pos), [moveComponent]);
  const handleTerminalClick = useCallback((terminalId: string) => {
    if (activeTool === 'wire') {
      if (connectingFrom) completeConnection(terminalId);
      else startConnection(terminalId);
    }
  }, [activeTool, connectingFrom, startConnection, completeConnection]);

  const handleComponentClick = useCallback((compId: string) => {
    if (activeTool === 'probe') { addProbe('voltage', compId, 0); setActiveTool('select'); return; }
    selectComponent(compId);
  }, [activeTool, addProbe, selectComponent, setActiveTool]);

  const handleMouseMove = useCallback(() => {
    if (!stageRef.current) return;
    const pos = stageRef.current.getPointerPosition();
    if (pos) setMousePos({ x: pos.x, y: pos.y });
  }, []);

  let connectingLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (connectingFrom && activeTool === 'wire') {
    const term = terminals[connectingFrom];
    if (term) {
      const comp = components[term.componentId];
      const pos = getTerminalWorldPos(comp, term.index);
      if (pos) connectingLine = { x1: pos.x, y1: pos.y, x2: mousePos.x, y2: mousePos.y };
    }
  }

  const simLabels: Array<{ x: number; y: number; text: string; fill: string }> = [];
  if (simulationRunning && simResults) {
    for (const comp of Object.values(components)) {
      const t0 = terminals[comp.terminalIds[0]];
      const t1 = terminals[comp.terminalIds[1]];
      if (!t0) continue;
      const v0 = simResults.nodeVoltages[t0.nodeId] ?? 0;
      const v1 = t1 ? (simResults.nodeVoltages[t1.nodeId] ?? 0) : 0;
      const i = simResults.branchCurrents[comp.id] ?? 0;
      const vDiff = v0 - v1;

      if (comp.type === 'ground') continue;

      simLabels.push({
        x: comp.position.x,
        y: comp.position.y + COMPONENT_HEIGHT / 2 + 36,
        text: `${fmtVolt(vDiff)}  ${fmtCurr(i)}`,
        fill: COLORS.selected,
      });

      if (t0 && t0.nodeId !== 0) {
        simLabels.push({
          x: comp.position.x - COMPONENT_WIDTH / 2 - 5,
          y: comp.position.y - 5,
          text: `${simResults.nodeVoltages[t0.nodeId]?.toFixed(1)}V`,
          fill: '#6b7280',
        });
      }
    }
  }

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onClick={handleStageClick}
      onTap={handleStageClick}
      onMouseMove={handleMouseMove}
      scaleX={1}
      scaleY={1}
    >
      <Layer>
        <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={COLORS.background} listening={false} />
        <Grid />
      </Layer>
      <Layer>
        {Object.values(wires).map((wire) => <WireLine key={wire.id} wireId={wire.id} />)}
        {connectingLine && (
          <>
            <Line points={[connectingLine.x1, connectingLine.y1, connectingLine.x2, connectingLine.y2]} stroke="#f59e0b" strokeWidth={2} dash={[6, 4]} lineCap="round" listening={false} />
            <Line points={[connectingLine.x1, connectingLine.y1, (connectingLine.x1 + connectingLine.x2) / 2, connectingLine.y1, (connectingLine.x1 + connectingLine.x2) / 2, connectingLine.y2, connectingLine.x2, connectingLine.y2]} stroke="#f59e0b" strokeWidth={1.5} dash={[4, 4]} lineCap="round" opacity={0.3} listening={false} />
          </>
        )}
      </Layer>
      <Layer>
        {Object.values(components).map((comp) => (
          <ComponentShape
            key={comp.id}
            component={comp}
            isSelected={comp.id === selectedId}
            isConnecting={connectingFrom !== null}
            onDragEnd={(pos) => handleDragEnd(comp.id, pos)}
            onTerminalClick={handleTerminalClick}
            onClick={() => handleComponentClick(comp.id)}
          />
        ))}
      </Layer>
      <Layer listening={false}>
        {simLabels.map((l, i) => (
          <Text key={i} x={l.x} y={l.y} text={l.text} fontSize={9} fill={l.fill} align="center" listening={false} />
        ))}
      </Layer>
    </Stage>
  );
}
