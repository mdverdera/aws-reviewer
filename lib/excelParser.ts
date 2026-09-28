import * as XLSX from 'xlsx';
import { ReviewCard } from '@/types/reviewer';

export interface ParseResult {
  success: boolean;
  cards: ReviewCard[];
  error?: string;
  sheetNames?: string[];
  requiresSheetSelection?: boolean;
}

export function getSheetNames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames);
      } catch {
        reject(new Error('Failed to read Excel file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function parseExcelSheet(file: File, sheetName?: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const targetSheet = sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[targetSheet];

        if (!worksheet) {
          resolve({ success: false, cards: [], error: 'Selected sheet not found.' });
          return;
        }

        // raw: true preserves cell values as-is (keeps newlines from Alt+Enter in Excel).
        // We convert to string ourselves so numbers and dates still work.
        const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: true,
        }) as unknown[][];

        // Filter out empty rows
        const dataRows = rows.filter(
          (row) => row.some((cell) => cell && String(cell).trim() !== '')
        );

        if (dataRows.length === 0) {
          resolve({ success: false, cards: [], error: 'The sheet appears to be empty.' });
          return;
        }

        // Detect if first row is a header by checking if it contains "item", "question", etc.
        let startRow = 0;
        const firstRow = dataRows[0];
        const firstRowLower = firstRow.map((c) => String(c).toLowerCase().trim());
        const isHeader =
          firstRowLower.some((c) => c === 'item' || c === 'topic') &&
          firstRowLower.some((c) => c === 'question');
        if (isHeader) startRow = 1;

        // Convert a raw cell value to string, preserving internal newlines.
        const cellStr = (val: unknown): string => {
          if (val === null || val === undefined) return '';
          // Numbers / booleans — plain string conversion
          if (typeof val === 'number' || typeof val === 'boolean') return String(val);
          // Strings — trim leading/trailing whitespace but keep internal newlines
          return String(val).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
        };

        const cards: ReviewCard[] = [];
        for (let i = startRow; i < dataRows.length; i++) {
          const row = dataRows[i];
          const item = cellStr(row[0]);
          const question = cellStr(row[1]);
          const answer = cellStr(row[2]);
          const powerMemory1 = cellStr(row[3]) || undefined;
          const powerMemory2 = cellStr(row[4]) || undefined;

          // Require at minimum item + question or question + answer
          if (!question && !item) continue;
          if (!question && !answer) continue;

          cards.push({
            id: `imported-${i}-${Date.now()}`,
            item: item || 'General',
            question,
            answer,
            powerMemory1: powerMemory1 || undefined,
            powerMemory2: powerMemory2 || undefined,
          });
        }

        if (cards.length === 0) {
          resolve({
            success: false,
            cards: [],
            error:
              'No valid review cards found. Make sure Column A = Item, Column B = Question, Column C = Answer.',
          });
          return;
        }

        resolve({ success: true, cards });
      } catch (err) {
        resolve({
          success: false,
          cards: [],
          error: `Failed to parse Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
      }
    };
    reader.onerror = () =>
      resolve({ success: false, cards: [], error: 'Failed to read file.' });
    reader.readAsArrayBuffer(file);
  });
}

// ---------------------------------------------------------------------------
// Google Sheets URL import
// ---------------------------------------------------------------------------

/**
 * Extracts the spreadsheet ID from any Google Sheets URL.
 * Returns null if the URL is not a Google Sheets URL.
 */
export function extractGoogleSheetsId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl.trim());
    if (!url.hostname.includes('docs.google.com')) return null;
    const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Builds the xlsx export URL for a Google Sheets spreadsheet.
 * Exporting as xlsx gives us ALL sheets in one request so we can
 * show the user a sheet selector identical to the file-upload flow.
 */
function buildXlsxExportUrl(id: string): string {
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
}

/** Shared network-error helper */
async function fetchWorkbook(url: string): Promise<{ wb: ReturnType<typeof XLSX.read> } | { error: string }> {
  let buf: ArrayBuffer;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          error: 'Access denied. Make sure the sheet is shared as "Anyone with the link can view".',
        };
      }
      return {
        error: `Could not fetch the sheet (HTTP ${res.status}). Check the URL and sharing settings.`,
      };
    }
    buf = await res.arrayBuffer();
  } catch {
    return {
      error: 'Network error fetching the sheet. Check your connection and that the sheet is publicly accessible.',
    };
  }
  try {
    const wb = XLSX.read(new Uint8Array(buf), { type: 'array', raw: true });
    return { wb };
  } catch {
    return { error: 'Could not parse the downloaded file. Make sure the sheet is publicly accessible.' };
  }
}

/**
 * Fetches a Google Sheets workbook and returns the list of sheet names.
 * Call this first; if there is more than one sheet, show a selector
 * and then call parseGoogleSheetByName() with the chosen name.
 */
export async function getGoogleSheetNames(rawUrl: string): Promise<{ sheetNames: string[]; id: string } | { error: string }> {
  const id = extractGoogleSheetsId(rawUrl);
  if (!id) {
    return {
      error: 'That does not look like a valid Google Sheets URL. Copy the full URL from your browser address bar.',
    };
  }

  const result = await fetchWorkbook(buildXlsxExportUrl(id));
  if ('error' in result) return result;
  return { sheetNames: result.wb.SheetNames, id };
}

/**
 * Parses a specific sheet (by name) from a Google Sheets workbook
 * that was already fetched. Accepts the spreadsheet ID directly.
 */
export async function parseGoogleSheetByName(id: string, sheetName: string): Promise<ParseResult> {
  const result = await fetchWorkbook(buildXlsxExportUrl(id));
  if ('error' in result) return { success: false, cards: [], error: result.error };

  const { wb } = result;
  const worksheet = wb.Sheets[sheetName];
  if (!worksheet) {
    return { success: false, cards: [], error: `Sheet "${sheetName}" not found.` };
  }

  return rowsToCards(worksheet, 'gsheet');
}

/** Shared row → ReviewCard converter (used by both file and URL paths). */
function rowsToCards(worksheet: XLSX.WorkSheet, idPrefix: string): ParseResult {
  const cellStr = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return String(val).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  };

  const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: true,
  }) as unknown[][];

  const dataRows = rows.filter(
    (row) => row.some((cell) => cell && String(cell).trim() !== '')
  );

  if (dataRows.length === 0) {
    return { success: false, cards: [], error: 'The sheet appears to be empty.' };
  }

  let startRow = 0;
  const firstRowLower = dataRows[0].map((c) => String(c).toLowerCase().trim());
  const isHeader =
    firstRowLower.some((c) => c === 'item' || c === 'topic') &&
    firstRowLower.some((c) => c === 'question');
  if (isHeader) startRow = 1;

  const cards: ReviewCard[] = [];
  const ts = Date.now();
  for (let i = startRow; i < dataRows.length; i++) {
    const row = dataRows[i];
    const item = cellStr(row[0]);
    const question = cellStr(row[1]);
    const answer = cellStr(row[2]);
    const powerMemory1 = cellStr(row[3]) || undefined;
    const powerMemory2 = cellStr(row[4]) || undefined;

    if (!question && !item) continue;
    if (!question && !answer) continue;

    cards.push({
      id: `${idPrefix}-${i}-${ts}`,
      item: item || 'General',
      question,
      answer,
      powerMemory1,
      powerMemory2,
    });
  }

  if (cards.length === 0) {
    return {
      success: false,
      cards: [],
      error: 'No valid review cards found. Make sure Column A = Item, Column B = Question, Column C = Answer.',
    };
  }

  return { success: true, cards };
}
