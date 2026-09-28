'use client';

import React from 'react';
import { getTopics } from '@/lib/reviewer';
import { ReviewCard } from '@/types/reviewer';

interface TopicFilterProps {
  cards: ReviewCard[];
  selected: string | null;
  onSelect: (topic: string | null) => void;
}

export default function TopicFilter({ cards, selected, onSelect }: TopicFilterProps) {
  const topics = getTopics(cards);

  const countForTopic = (topic: string) => cards.filter((c) => c.item === topic).length;

  return (
    <div className="space-y-2">
      {/* All topics */}
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors font-medium text-sm flex items-center justify-between ${
          selected === null
            ? 'bg-orange-500 border-orange-500 text-white'
            : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50'
        }`}
      >
        <span>All Topics</span>
        <span
          className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
            selected === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {cards.length}
        </span>
      </button>

      {/* Individual topics */}
      {topics.map((topic) => {
        const count = countForTopic(topic);
        const isActive = selected === topic;
        return (
          <button
            key={topic}
            onClick={() => onSelect(topic)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between ${
              isActive
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50'
            }`}
          >
            <span className="font-medium text-sm truncate">{topic}</span>
            <span
              className={`text-xs rounded-full px-2 py-0.5 font-semibold shrink-0 ml-2 ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {count} Q
            </span>
          </button>
        );
      })}
    </div>
  );
}
