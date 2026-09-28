'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewCard } from '@/types/reviewer';
import PowerMemoryCard from './PowerMemoryCard';
import ProgressBar from './ProgressBar';
import KeyboardShortcuts from './KeyboardShortcuts';

interface QuickReviewCardProps {
  card: ReviewCard;
  current: number;
  total: number;
  isKnown: boolean;
  isReviewAgain: boolean;
  onKnown: () => void;
  onReviewAgain: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuickReviewCard({
  card,
  current,
  total,
  isKnown,
  isReviewAgain,
  onKnown,
  onReviewAgain,
  onNext,
  onPrev,
}: QuickReviewCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setRevealed(false); }, [card.id]);

  const handleReveal = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (!revealed) handleReveal();
        else onNext();
      } else if (e.key === '1' && revealed) {
        onKnown();
      } else if (e.key === '2' && revealed) {
        onReviewAgain();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [revealed, handleReveal, onKnown, onReviewAgain, onNext]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-orange-100 border border-orange-200 text-orange-800 rounded-full px-3 py-1 text-sm font-semibold">
          <span className="w-2 h-2 bg-orange-500 rounded-full inline-block" />
          {card.item}
        </div>
        <button
          onClick={() => setShowHelp((h) => !h)}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
        >
          ⌨ Shortcuts
        </button>
      </div>

      {showHelp && (
        <KeyboardShortcuts
          shortcuts={[
            { key: 'Space / →', action: revealed ? 'Next question' : 'Reveal answer' },
            { key: '1', action: 'Mark as Known' },
            { key: '2', action: 'Mark as Review Again' },
          ]}
        />
      )}

      {/* Progress */}
      <ProgressBar current={current} total={total} />

      {/* Question */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Question
        </div>
        <p className="text-xl font-medium text-slate-800 leading-relaxed">{card.question}</p>
      </div>

      {/* Reveal / Answer */}
      {!revealed ? (
        <button
          onClick={handleReveal}
          className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-lg transition-colors shadow-sm"
        >
          Reveal Answer ⚡
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            key="qa"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Answer */}
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                Answer
              </div>
              <p className="text-base text-slate-800 leading-relaxed">{card.answer}</p>
            </div>

            {/* Power Memory */}
            <PowerMemoryCard
              powerMemory1={card.powerMemory1}
              powerMemory2={card.powerMemory2}
              visible={true}
            />

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onKnown}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors border ${
                  isKnown
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                ✓ Know It <span className="opacity-60 text-xs">[1]</span>
              </button>
              <button
                onClick={onReviewAgain}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors border ${
                  isReviewAgain
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                }`}
              >
                🔁 Review <span className="opacity-60 text-xs">[2]</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Nav */}
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={current <= 1}
          className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
        >
          Next → <span className="opacity-60 text-xs">[Space]</span>
        </button>
      </div>
    </div>
  );
}
