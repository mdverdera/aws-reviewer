'use client';

import React from 'react';
import { StudyMode } from '@/types/reviewer';

interface Mode {
  id: StudyMode;
  icon: string;
  label: string;
  desc: string;
  color: string;
}

const MODES: Mode[] = [
  {
    id: 'study',
    icon: '📚',
    label: 'Study Mode',
    desc: 'Step through questions with full answer reveals',
    color: 'hover:border-blue-400 hover:bg-blue-50',
  },
  {
    id: 'quick-review',
    icon: '⚡',
    label: 'Quick Review',
    desc: 'Fast-paced review with keyboard shortcuts',
    color: 'hover:border-orange-400 hover:bg-orange-50',
  },
  {
    id: 'random-review',
    icon: '🎲',
    label: 'Random Review',
    desc: 'Randomly shuffled questions, no repeats',
    color: 'hover:border-violet-400 hover:bg-violet-50',
  },
  {
    id: 'power-memory',
    icon: '🧠',
    label: 'Power Memory',
    desc: 'Memory-first mode for deep recall practice',
    color: 'hover:border-purple-400 hover:bg-purple-50',
  },
  {
    id: 'review-again',
    icon: '🔁',
    label: 'Review Again',
    desc: 'Revisit cards you marked for review',
    color: 'hover:border-amber-400 hover:bg-amber-50',
  },
];

interface StudyModeSelectorProps {
  onSelect: (mode: StudyMode) => void;
  reviewAgainCount: number;
}

export default function StudyModeSelector({ onSelect, reviewAgainCount }: StudyModeSelectorProps) {
  return (
    <div className="grid gap-3">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className={`w-full text-left p-4 rounded-xl border border-slate-200 bg-white transition-all ${mode.color} group`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mode.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                {mode.label}
                {mode.id === 'review-again' && reviewAgainCount > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs rounded-full px-2 py-0.5 font-medium">
                    {reviewAgainCount}
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500 mt-0.5 truncate">{mode.desc}</div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}
