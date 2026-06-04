export function fmt(v: number, u: string, d = 4): string {
  if (!isFinite(v) || isNaN(v)) return '∞';
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toFixed(d)} M${u}`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(d)} k${u}`;
  if (a >= 1) return `${v.toFixed(d)} ${u}`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(d)} m${u}`;
  if (a >= 1e-6) return `${(v * 1e6).toFixed(d)} µ${u}`;
  if (a >= 1e-9) return `${(v * 1e9).toFixed(d)} n${u}`;
  return `${(v * 1e12).toFixed(d)} p${u}`;
}

export const bandColors: Record<string, { name: string; hex: string; mult: number; tol?: number }> =
  {
    black: { name: 'Negro', hex: '#000000', mult: 1 },
    brown: { name: 'Marrón', hex: '#8B4513', mult: 10, tol: 1 },
    red: { name: 'Rojo', hex: '#DC143C', mult: 100, tol: 2 },
    orange: { name: 'Naranja', hex: '#FF8C00', mult: 1000 },
    yellow: { name: 'Amarillo', hex: '#FFD700', mult: 10000 },
    green: { name: 'Verde', hex: '#228B22', mult: 100000, tol: 0.5 },
    blue: { name: 'Azul', hex: '#4169E1', mult: 1000000, tol: 0.25 },
    violet: { name: 'Violeta', hex: '#8B00FF', mult: 10000000, tol: 0.1 },
    gray: { name: 'Gris', hex: '#808080', mult: 100000000, tol: 0.05 },
    white: { name: 'Blanco', hex: '#FFFFFF', mult: 1000000000 },
    gold: { name: 'Dorado', hex: '#DAA520', mult: 0.1, tol: 5 },
    silver: { name: 'Plateado', hex: '#C0C0C0', mult: 0.01, tol: 10 },
  };

/** Digit value for bands 1 and 2 (IEC 60062). */
export const bandDigits: Record<string, number> = {
  black: 0,
  brown: 1,
  red: 2,
  orange: 3,
  yellow: 4,
  green: 5,
  blue: 6,
  violet: 7,
  gray: 8,
  white: 9,
};

export const digitBandKeys = Object.keys(bandDigits);
export const multiplierBandKeys = [
  'black',
  'brown',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'violet',
  'gray',
  'white',
  'gold',
  'silver',
];
export const toleranceBandKeys = ['brown', 'red', 'green', 'blue', 'violet', 'gray', 'gold', 'silver'];

export const colorKeys = Object.keys(bandColors);
