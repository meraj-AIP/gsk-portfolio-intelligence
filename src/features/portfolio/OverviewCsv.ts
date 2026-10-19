/**
 * Quotes every cell so commas, quotes and line breaks survive a spreadsheet import, and prefixes cells that a
 * spreadsheet would run as a formula, since names and owners come from upstream sources we do not control.
 */
export function toCsv(rows: string[][]): string {
  const cell = (c: string) => `"${(/^[=+\-@\t\r]/.test(c) ? `'${c}` : c).replace(/"/g, '""')}"`;
  return rows.map((r) => r.map(cell).join(',')).join('\r\n');
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
