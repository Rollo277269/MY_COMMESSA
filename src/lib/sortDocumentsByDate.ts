/**
 * Sorts documents by "data documento" (from ai_extracted_data.data) descending.
 * Falls back to created_at if no document date is available.
 */
export function sortDocumentsByDate(documents: any[]): any[] {
  return [...documents].sort((a, b) => {
    const dateA = parseDocDate(a.ai_extracted_data?.data) ?? new Date(a.created_at);
    const dateB = parseDocDate(b.ai_extracted_data?.data) ?? new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });
}

function parseDocDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  // Try DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = dateStr.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (parts) {
    const d = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
    if (!isNaN(d.getTime())) return d;
  }
  // Try ISO or other standard format
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
}
