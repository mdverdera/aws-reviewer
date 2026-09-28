'use client';

import React from 'react';
import { ReviewCard } from '@/types/reviewer';
import { highlightText } from '@/lib/reviewer';

interface SearchResultsProps {
  cards: ReviewCard[];
  query: string;
  onSelectCard: (card: ReviewCard) => void;
}

export default function SearchResults({ cards, query, onSelectCard }: SearchResultsProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-2xl mb-2">🔍</p>
        <p>No results for &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        {cards.length} result{cards.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => onSelectCard(card)}
          className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-400 hover:bg-orange-50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 font-semibold">
              {card.item}
            </span>
          </div>
          <p
            className="text-sm font-medium text-slate-700 line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: highlightText(card.question, query),
            }}
          />
          {card.answer && (
            <p
              className="text-xs text-slate-500 mt-1 line-clamp-1"
              dangerouslySetInnerHTML={{
                __html: highlightText(card.answer, query),
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
