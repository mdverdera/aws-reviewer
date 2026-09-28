'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewCard } from '@/types/reviewer';
import PowerMemoryCard from './PowerMemoryCard';
import ProgressBar from './ProgressBar';

interface PowerMemoryModeCardProps {
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

type Phase = 'memory' | 'question' | 'answer';

export default function PowerMemoryModeCard({
  card,
  current,
  total,
  isKnown,
  isReviewAgain,
  onKnown,
  onReviewAgain,
  onNext,
  onPrev,
}: PowerMemoryModeCardProps) {
  const [phase, setPhase] = useState<Phase>('memory');

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPhase('memory'); }, [card.id]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-orange-100 border border-orange-200 text-orange-800 rounded-full px-3 py-1 text-sm font-semibold">
          <span className="w-2 h-2 bg-orange-500 rounded-full inline-block" />
          {card.item}
        </div>
        <span className="text-xs text-slate-400 font-medium">🧠 Power Memory Mode</span>
      </div>

      {/* Progress */}
      <ProgressBar current={current} total={total} />

      {/* Power Memory always shown first */}
      {card.powerMemory1 || card.powerMemory2 ? (
        <PowerMemoryCard
          powerMemory1={card.powerMemory1}
          powerMemory2={card.powerMemory2}
          visible={true}
        />
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-700 text-sm text-center">
          No Power Memory for this card.
        </div>
      )}

      {/* Recall prompt */}
      {phase === 'memory' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-slate-600 italic text-base">
          &ldquo;What AWS concept does this remind you of?&rdquo;
        </div>
      )}

      {/* Reveal Question */}
      {phase === 'memory' && (
        <button
          onClick={() => setPhase('question')}
          className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
        >
          Reveal Question →
        </button>
      )}

      {/* Question */}
      <AnimatePresence>
        {(phase === 'question' || phase === 'answer') && (
          <motion.div
            key="q"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Question
            </div>
            <p className="text-lg font-medium text-slate-800 leading-relaxed">{card.question}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal Answer */}
      {phase === 'question' && (
        <button
          onClick={() => setPhase('answer')}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
        >
          Reveal Answer →
        </button>
      )}

      {/* Answer */}
      <AnimatePresence>
        {phase === 'answer' && (
          <motion.div
            key="a"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
              Answer
            </div>
            <p className="text-base text-slate-800 leading-relaxed">{card.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {phase === 'answer' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2"
        >
          <button
            onClick={onKnown}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors border ${
              isKnown
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            ✓ I Know This
          </button>
          <button
            onClick={onReviewAgain}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors border ${
              isReviewAgain
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            🔁 Review Again
          </button>
        </motion.div>
      )}

      {/* Navigation */}
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
          Next →
        </button>
      </div>
    </div>
  );
}
