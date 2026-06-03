export function fmtV(v: number): string {
  const a = Math.abs(v);
  if (a >= 1) return `${v.toFixed(3)} V`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(2)} mV`;
  return `${(v * 1e6).toFixed(1)} µV`;
}

export function fmtI(v: number): string {
  const a = Math.abs(v);
  if (a >= 1) return `${v.toFixed(3)} A`;
  if (a >= 1e-3) return `${(v * 1e3).toFixed(2)} mA`;
  if (a >= 1e-6) return `${(v * 1e6).toFixed(1)} µA`;
  return `${(v * 1e9).toFixed(0)} nA`;
}

export function fmtP(w: number): string {
  const a = Math.abs(w);
  if (a >= 1) return `${w.toFixed(3)} W`;
  if (a >= 1e-3) return `${(w * 1e3).toFixed(2)} mW`;
  return `${(w * 1e6).toFixed(1)} µW`;
}
