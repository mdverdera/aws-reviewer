'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ReviewCard } from '@/types/reviewer';
import { StudyProgress } from '@/types/reviewer';
import StudyCard from '@/components/StudyCard';
import { filterByTopic } from '@/lib/reviewer';

interface StudyModeViewProps {
  cards: ReviewCard[];
  progress: StudyProgress;
  topicFilter: string | null;
  onMarkKnown: (id: string) => void;
  onMarkReviewAgain: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onExit: () => void;
}

export default function StudyModeView({
  cards,
  progress,
  topicFilter,
  onMarkKnown,
  onMarkReviewAgain,
  onMarkReviewed,
  onExit,
}: StudyModeViewProps) {
  const filteredCards = topicFilter ? filterByTopic(cards, topicFilter) : cards;
  const [index, setIndex] = useState(0);

  const card = filteredCards[index];
  const total = filteredCards.length;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIndex(0); }, [topicFilter]);

  // Keyboard shortcuts
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
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-500">No questions match your current filter.</p>
        <button onClick={onExit} className="text-orange-500 underline text-sm">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Mode header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-slate-700 flex items-center gap-2">
          <span>📚</span> Study Mode
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
