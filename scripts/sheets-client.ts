// Google Sheets API クライアント
// 使用: googleapis パッケージ (別途 pnpm add googleapis)

interface SheetData {
  headers: string[];
  rows: string[][];
}

export async function fetchSheetData(
  apiKey: string,
  spreadsheetId: string,
  range: string,
): Promise<SheetData> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Sheets API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { values?: string[][] };
  const values = data.values ?? [];

  if (values.length === 0) {
    return { headers: [], rows: [] };
  }

  return {
    headers: values[0],
    rows: values.slice(1),
  };
}
