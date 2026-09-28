'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ReviewCard, StudyProgress } from '@/types/reviewer';
import QuickReviewCard from '@/components/QuickReviewCard';
import { createRandomSession, filterByTopic } from '@/lib/reviewer';

interface RandomReviewViewProps {
  cards: ReviewCard[];
  progress: StudyProgress;
  topicFilter: string | null;
  onMarkKnown: (id: string) => void;
  onMarkReviewAgain: (id: string) => void;
  onMarkReviewed: (id: string) => void;
  onExit: () => void;
}

export default function RandomReviewView({
  cards,
  progress,
  topicFilter,
  onMarkKnown,
  onMarkReviewAgain,
  onMarkReviewed,
  onExit,
}: RandomReviewViewProps) {
  const filteredCards = useMemo(
    () => (topicFilter ? filterByTopic(cards, topicFilter) : cards),
    [cards, topicFilter]
  );

  const [sessionCards, setSessionCards] = useState<ReviewCard[]>(() =>
    createRandomSession(filteredCards)
  );
  const [index, setIndex] = useState(0);

  // Re-shuffle when filter changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSessionCards(createRandomSession(filteredCards));
    setIndex(0);
  }, [filteredCards]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExit]);

  const card = sessionCards[index];
  const total = sessionCards.length;

  const handleNext = useCallback(() => {
    if (card) onMarkReviewed(card.id);
    if (index + 1 >= total) {
      // Reshuffle for a new round
      setSessionCards(createRandomSession(filteredCards));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
  }, [card, index, total, filteredCards, onMarkReviewed]);

  const handlePrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  if (total === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No questions match your current filter.</p>
        <button onClick={onExit} className="text-orange-500 underline text-sm mt-2">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-slate-700 flex items-center gap-2">
          <span>🎲</span> Random Review
        </h2>
        <button
          onClick={onExit}
          className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          ✕ Exit
        </button>
      </div>

      <QuickReviewCard
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
