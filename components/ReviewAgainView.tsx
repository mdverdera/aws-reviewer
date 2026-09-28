'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ReviewCard, StudyProgress } from '@/types/reviewer';
import StudyCard from '@/components/StudyCard';

interface ReviewAgainViewProps {
  cards: ReviewCard[];
  progress: StudyProgress;
  onMarkKnown: (id: string) => void;
  onMarkReviewAgain: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onStartFullReview: () => void;
  onExit: () => void;
}

export default function ReviewAgainView({
  cards,
  progress,
  onMarkKnown,
  onMarkReviewAgain,
  onMarkReviewed,
  onStartFullReview,
  onExit,
}: ReviewAgainViewProps) {
  const reviewAgainCards = cards.filter((c) => progress.reviewAgainQuestions.includes(c.id));
  const [index, setIndex] = useState(0);

  const card = reviewAgainCards[index];
  const total = reviewAgainCards.length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExit]);

  const handleNext = useCallback(() => {
    if (card) onMarkReviewed(card.id);
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [card, onMarkReviewed, total]);

  const handlePrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  if (total === 0) {
    return (
      <div className="text-center py-16 space-y-5">
        <div className="text-6xl">🎉</div>
        <h3 className="text-xl font-bold text-slate-700">Nothing to review!</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          You haven&apos;t marked any cards for review. Keep studying!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onStartFullReview}
            className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Start Full Review
          </button>
          <button
            onClick={onExit}
            className="px-5 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-slate-700 flex items-center gap-2">
          <span>🔁</span> Review Again
          <span className="bg-amber-100 text-amber-700 text-xs rounded-full px-2 py-0.5 font-medium">
            {total}
          </span>
        </h2>
        <button
          onClick={onExit}
          className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          ✕ Exit
        </button>
      </div>

      <StudyCard
        card={card}
        current={index + 1}
        total={total}
        isKnown={progress.knownQuestions.includes(card.id)}
        isReviewAgain={progress.reviewAgainQuestions.includes(card.id)}
        onKnown={() => onMarkKnown(card.id)}
        onReviewAgain={() => onMarkReviewAgain(card.id)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
}
