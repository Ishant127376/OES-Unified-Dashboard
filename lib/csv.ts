export type CsvRow = Record<string, string | number | boolean | null | undefined>;

function escapeCsvValue(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function rowsToCsv(rows: CsvRow[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];

  for (const row of rows) {
    const values = headers.map((h) => {
      const raw = row[h];
      if (raw === null || raw === undefined) return "";
      return escapeCsvValue(String(raw));
    });
    lines.push(values.join(","));
  }

  return lines.join("\n");
}

export function downloadTextFile({
  filename,
  mime,
  content,
}: {
  filename: string;
  mime: string;
  content: string;
}) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
