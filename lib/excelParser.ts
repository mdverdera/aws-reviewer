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
 * Converts a Google Sheets share/edit URL into a direct CSV export URL.
 *
 * Accepted formats:
 *   https://docs.google.com/spreadsheets/d/<ID>/edit#gid=<GID>
 *   https://docs.google.com/spreadsheets/d/<ID>/edit?usp=sharing
 *   https://docs.google.com/spreadsheets/d/<ID>/pub?...
 *   https://docs.google.com/spreadsheets/d/<ID>   (bare)
 *
 * Returns null if the URL does not look like a Google Sheets URL.
 */
export function buildGoogleSheetsCsvUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl.trim());
    if (!url.hostname.includes('docs.google.com')) return null;

    // Extract spreadsheet ID from path like /spreadsheets/d/<ID>/...
    const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    if (!match) return null;
    const id = match[1];

    // Optionally preserve gid (sheet tab) from hash or query param
    const gid =
      url.searchParams.get('gid') ||
      (url.hash.includes('gid=') ? url.hash.split('gid=')[1].split('&')[0] : null);

    const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
    return csvUrl;
  } catch {
    return null;
  }
}

/**
 * Fetches a Google Sheets CSV export URL and parses it into ReviewCards.
 * The sheet must be publicly accessible (published or shared with "Anyone with the link").
 */
export async function parseGoogleSheetUrl(rawUrl: string): Promise<ParseResult> {
  const csvUrl = buildGoogleSheetsCsvUrl(rawUrl);
  if (!csvUrl) {
    return {
      success: false,
      cards: [],
      error:
        'That does not look like a valid Google Sheets URL. Make sure you copy the full link from your browser address bar.',
    };
  }

  let csvText: string;
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          cards: [],
          error:
            'Access denied. Make sure the sheet is shared as "Anyone with the link can view" (or published to the web).',
        };
      }
      return {
        success: false,
        cards: [],
        error: `Could not fetch the sheet (HTTP ${res.status}). Check the URL and sharing settings.`,
      };
    }
    csvText = await res.text();
  } catch {
    return {
      success: false,
      cards: [],
      error:
        'Network error fetching the sheet. Check your internet connection and that the sheet is publicly accessible.',
    };
  }

  try {
    const workbook = XLSX.read(csvText, { type: 'string', raw: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
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

    const cellStr = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'number' || typeof val === 'boolean') return String(val);
      return String(val).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    };

    let startRow = 0;
    const firstRow = dataRows[0];
    const firstRowLower = firstRow.map((c) => String(c).toLowerCase().trim());
    const isHeader =
      firstRowLower.some((c) => c === 'item' || c === 'topic') &&
      firstRowLower.some((c) => c === 'question');
    if (isHeader) startRow = 1;

    const cards: ReviewCard[] = [];
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
        id: `gsheet-${i}-${Date.now()}`,
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
        error:
          'No valid review cards found. Make sure Column A = Item, Column B = Question, Column C = Answer.',
      };
    }

    return { success: true, cards };
  } catch (err) {
    return {
      success: false,
      cards: [],
      error: `Failed to parse sheet data: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}
