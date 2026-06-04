export interface OscTrace {
  label: string;
  data: Array<{ t: number; v: number }>;
}

/** Export osciloscope traces to CSV (time column + one column per signal). */
export function exportOscCsv(traces: OscTrace[], filename = 'osciloscopio.csv'): void {
  if (traces.length === 0) return;

  const maxLen = Math.max(...traces.map((t) => t.data.length));
  if (maxLen === 0) return;

  const headers = ['time_s', ...traces.map((t) => sanitizeCsvHeader(t.label))];
  const rows: string[] = [headers.join(',')];

  for (let i = 0; i < maxLen; i++) {
    const t =
      traces.find((tr) => tr.data[i] !== undefined)?.data[i]?.t ??
      traces[0]?.data[i]?.t ??
      i * (1 / 60);
    const cols = [t.toFixed(6), ...traces.map((tr) => formatCsvNum(tr.data[i]?.v))];
    rows.push(cols.join(','));
  }

  downloadTextFile(`\uFEFF${rows.join('\n')}`, filename, 'text/csv;charset=utf-8');
}

function sanitizeCsvHeader(label: string): string {
  const safe = label.replace(/"/g, '""').replace(/,/g, '_');
  return `"${safe}"`;
}

function formatCsvNum(v: number | undefined): string {
  if (v === undefined) return '';
  return String(v);
}

function downloadTextFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
