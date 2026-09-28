'use client';

import React, { useState } from 'react';
import { StudyMode } from '@/types/reviewer';
import { useReviewer } from '@/context/ReviewerContext';
import StatsCards from '@/components/StatsCards';
import StudyModeSelector from '@/components/StudyModeSelector';
import ImportExcel from '@/components/ImportExcel';
import ConfirmDialog from '@/components/ConfirmDialog';
import { exportProgressAsJSON } from '@/lib/storage';

interface DashboardProps {
  onStartMode: (mode: StudyMode) => void;
}

export default function Dashboard({ onStartMode }: DashboardProps) {
  const { state, setCards, handleResetProgress, handleClearCards } = useReviewer();
  const [showImport, setShowImport] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const { statistics, progress, cards, isUsingSample } = state;

  const handleImport = (importedCards: typeof cards) => {
    setCards(importedCards, false);
    setShowImport(false);
    setImportSuccess(`✓ Imported ${importedCards.length} review cards successfully!`);
    setTimeout(() => setImportSuccess(null), 4000);
  };

  const pct =
    statistics.total > 0
      ? Math.round((statistics.known / statistics.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold leading-tight">
              AWS Developer Associate
              <br />
              <span className="text-orange-400">Power Reviewer ⚡</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Remember faster. Review smarter.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{pct}%</div>
            <div className="text-xs text-slate-400">Mastered</div>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Sample data banner */}
      {isUsingSample && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-500 mt-0.5">⚠</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Using Sample Data</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Import your Excel reviewer to study your own material.
            </p>
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="shrink-0 text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Import Now
          </button>
        </div>
      )}

      {/* Import success */}
      {importSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 font-medium">
          {importSuccess}
        </div>
      )}

      {/* Statistics */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Progress Overview
        </h2>
        <StatsCards stats={statistics} />
      </div>

      {/* Study Modes */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Study Modes
        </h2>
        <StudyModeSelector
          onSelect={onStartMode}
          reviewAgainCount={progress.reviewAgainQuestions.length}
        />
      </div>

      {/* Import toggle */}
      {showImport ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Import Excel Reviewer</h2>
            <button
              onClick={() => setShowImport(false)}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <ImportExcel onImport={handleImport} />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex-1 py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 font-medium text-sm transition-colors"
          >
            📊 Import Excel File
          </button>
          <button
            onClick={() => exportProgressAsJSON(cards, progress)}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            ↓ Export Progress JSON
          </button>
        </div>
      )}

      {/* Settings actions */}
      <div className="border-t border-slate-200 pt-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Settings</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex-1 py-2.5 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
          >
            🔄 Reset Progress
          </button>
          {!isUsingSample && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              🗑 Clear Import
            </button>
          )}
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Progress?"
        message="This will clear all your Known, Review Again, and Reviewed question records. Your imported reviewer data will not be affected."
        confirmLabel="Reset Progress"
        onConfirm={() => {
          handleResetProgress();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
        danger
      />
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Imported Data?"
        message="This will remove your imported Excel reviewer and switch back to the sample data. Your progress will not be deleted."
        confirmLabel="Clear Import"
        onConfirm={() => {
          handleClearCards();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
        danger
      />
    </div>
  );
}
