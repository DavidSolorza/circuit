import { Line } from 'react-konva';
import { COLORS, GRID_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants';

export function Grid() {
  const lines: Array<{ x: number; y: number; points: number[]; stroke: string; strokeWidth: number }> = [];

  const minorAlpha = 10;
  const majorAlpha = 80;

  const clamp = (v: number) => Math.round(v);

  for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
    const isMajor = x % (GRID_SIZE * 5) === 0;
    lines.push({
      x: 0, y: 0,
      points: [clamp(x), 0, clamp(x), CANVAS_HEIGHT],
      stroke: isMajor ? `rgba(107,114,128,${majorAlpha/255})` : `rgba(107,114,128,${minorAlpha/255})`,
      strokeWidth: isMajor ? 1 : 0.5,
    });
  }

  for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
    const isMajor = y % (GRID_SIZE * 5) === 0;
    lines.push({
      x: 0, y: 0,
      points: [0, clamp(y), CANVAS_WIDTH, clamp(y)],
      stroke: isMajor ? `rgba(107,114,128,${majorAlpha/255})` : `rgba(107,114,128,${minorAlpha/255})`,
      strokeWidth: isMajor ? 1 : 0.5,
    });
  }

  return (
    <>
      {lines.map((l, i) => (
        <Line key={i} points={l.points} stroke={l.stroke} strokeWidth={l.strokeWidth} listening={false} />
      ))}
    </>
  );
}
