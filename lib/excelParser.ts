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

        const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false,
        }) as string[][];

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

        const cards: ReviewCard[] = [];
        for (let i = startRow; i < dataRows.length; i++) {
          const row = dataRows[i];
          const item = String(row[0] || '').trim();
          const question = String(row[1] || '').trim();
          const answer = String(row[2] || '').trim();
          const powerMemory1 = String(row[3] || '').trim() || undefined;
          const powerMemory2 = String(row[4] || '').trim() || undefined;

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
