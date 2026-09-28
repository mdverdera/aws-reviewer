'use client';

import React, { useState, useRef } from 'react';
import { getSheetNames, parseExcelSheet } from '@/lib/excelParser';
import { ReviewCard } from '@/types/reviewer';

interface ImportExcelProps {
  onImport: (cards: ReviewCard[]) => void;
}

export default function ImportExcel({ onImport }: ImportExcelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[] | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExts = ['.xlsx', '.xls'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      setError('Please upload an .xlsx or .xls file.');
      return;
    }

    setIsLoading(true);
    try {
      const sheets = await getSheetNames(file);
      if (sheets.length > 1) {
        setSheetNames(sheets);
        setPendingFile(file);
        setIsLoading(false);
        return;
      }
      // Single sheet — parse directly
      await parseAndImport(file, sheets[0]);
    } catch {
      setError('Failed to read the Excel file. Please check the file and try again.');
      setIsLoading(false);
    }
  };

  const parseAndImport = async (file: File, sheetName?: string) => {
    setIsLoading(true);
    setError(null);
    const result = await parseExcelSheet(file, sheetName);
    setIsLoading(false);
    if (!result.success || result.cards.length === 0) {
      setError(result.error || 'No cards found.');
      return;
    }
    setSheetNames(null);
    setPendingFile(null);
    onImport(result.cards);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!sheetNames && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-orange-400 bg-orange-50'
              : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">📊</div>
            <div className="font-semibold text-slate-700">
              {isLoading ? 'Reading file…' : 'Drop your Excel file here'}
            </div>
            <div className="text-sm text-slate-500">or click to browse</div>
            <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Supports .xlsx and .xls
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      )}

      {/* Sheet selector */}
      {sheetNames && pendingFile && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <p className="font-semibold text-slate-700">Select a worksheet:</p>
          <div className="grid gap-2">
            {sheetNames.map((name) => (
              <button
                key={name}
                onClick={() => parseAndImport(pendingFile, name)}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-orange-400 hover:bg-orange-50 transition-colors font-medium text-slate-700"
              >
                📄 {name}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setSheetNames(null); setPendingFile(null); }}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">⚠ Import Error</p>
          <p>{error}</p>
          <div className="mt-3 text-xs bg-red-100 rounded-lg p-3 font-mono">
            <div className="font-semibold mb-1">Expected columns:</div>
            <div>A = Item / Topic</div>
            <div>B = Question</div>
            <div>C = Answer</div>
            <div>D = Power Memory 1 (optional)</div>
            <div>E = Power Memory 2 (optional)</div>
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        <span className="mt-0.5 text-green-600">🔒</span>
        <span>
          Your reviewer stays in your browser. The Excel file is{' '}
          <strong>not uploaded to a server</strong>.
        </span>
      </div>
    </div>
  );
}
