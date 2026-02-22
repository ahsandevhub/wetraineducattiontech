/**
 * Convert array of objects to CSV format
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: (keyof T)[],
): string {
  if (data.length === 0) {
    return "";
  }

  // Create header row
  const header = columns.join(",");

  // Create data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col];
        // Handle null/undefined
        if (value === null || value === undefined) {
          return "";
        }
        // Escape quotes and wrap in quotes if contains comma or quotes
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(","),
  );

  return [header, ...rows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV with filename
 */
export function exportAsCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: (keyof T)[],
  filename: string,
): void {
  const csv = convertToCSV(data, columns);
  downloadCSV(csv, filename);
}
