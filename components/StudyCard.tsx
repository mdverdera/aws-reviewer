'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewCard } from '@/types/reviewer';
import PowerMemoryCard from './PowerMemoryCard';
import ProgressBar from './ProgressBar';

interface StudyCardProps {
  card: ReviewCard;
  current: number;
  total: number;
  isKnown: boolean;
  isReviewAgain: boolean;
  onKnown: () => void;
  onReviewAgain: () => void;
  onNext: () => void;
  onPrev: () => void;
  showTopicBadge?: boolean;
}

type Phase = 'question' | 'answer' | 'memory';

export default function StudyCard({
  card,
  current,
  total,
  isKnown,
  isReviewAgain,
  onKnown,
  onReviewAgain,
  onNext,
  onPrev,
  showTopicBadge = true,
}: StudyCardProps) {
  const [phase, setPhase] = React.useState<Phase>('question');

  // Reset phase when card changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { setPhase('question'); }, [card.id]);

  const handleRevealAnswer = () => setPhase('answer');
  const handleShowMemory = () => setPhase('memory');

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {showTopicBadge && (
          <div className="flex items-center gap-2 bg-orange-100 border border-orange-200 text-orange-800 rounded-full px-3 py-1 text-sm font-semibold">
            <span className="w-2 h-2 bg-orange-500 rounded-full inline-block" />
            {card.item}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isKnown && (
            <span className="text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-medium">
              ✓ Known
            </span>
          )}
          {isReviewAgain && (
            <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">
              🔁 Review Again
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <ProgressBar current={current} total={total} />

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Question
        </div>
        <p className="text-lg font-medium text-slate-800 leading-relaxed">{card.question}</p>
      </div>

      {/* Think First / Reveal Answer */}
      {phase === 'question' && (
        <button
          onClick={handleRevealAnswer}
          className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-lg transition-colors shadow-sm"
        >
          Think First 🤔 → Show Answer
        </button>
      )}

      {/* Answer */}
      <AnimatePresence>
        {(phase === 'answer' || phase === 'memory') && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
              Answer
            </div>
            <p className="text-base text-slate-800 leading-relaxed">{card.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show Power Memory button */}
      {phase === 'answer' && (card.powerMemory1 || card.powerMemory2) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={handleShowMemory}
          className="w-full py-3 rounded-2xl bg-purple-100 hover:bg-purple-200 border border-purple-200 text-purple-800 font-semibold transition-colors"
        >
          🧠 Show Power Memory
        </motion.button>
      )}

      {/* Power Memory */}
      {(phase === 'answer' || phase === 'memory') && (
        <PowerMemoryCard
          powerMemory1={card.powerMemory1}
          powerMemory2={card.powerMemory2}
          visible={phase === 'memory'}
        />
      )}

      {/* Action Buttons */}
      {(phase === 'answer' || phase === 'memory') && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
          Next Question →
        </button>
      </div>
    </div>
  );
}
