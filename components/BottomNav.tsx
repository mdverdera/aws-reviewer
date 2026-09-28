'use client';

import React from 'react';
import { StudyMode } from '@/types/reviewer';
import { useReviewer } from '@/context/ReviewerContext';

type NavView = 'dashboard' | StudyMode | 'topics' | 'search';

const BOTTOM_NAV = [
  { id: 'dashboard' as NavView, icon: '🏠', label: 'Home' },
  { id: 'study' as NavView, icon: '📚', label: 'Study' },
  { id: 'quick-review' as NavView, icon: '⚡', label: 'Quick' },
  { id: 'topics' as NavView, icon: '🗂', label: 'Topics' },
  { id: 'search' as NavView, icon: '🔍', label: 'Search' },
];

interface BottomNavProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
}

export default function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const { state } = useReviewer();
  const reviewAgainCount = state.progress.reviewAgainQuestions.length;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 safe-area-pb">
      <div className="flex">
        {BOTTOM_NAV.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-colors relative ${
                isActive ? 'text-orange-600' : 'text-slate-500'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'dashboard' && reviewAgainCount > 0 && (
                <span className="absolute top-1 right-1/2 translate-x-4 text-[10px] bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {reviewAgainCount > 9 ? '9+' : reviewAgainCount}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 inset-x-2 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
