'use client';

import React from 'react';
import { StudyMode } from '@/types/reviewer';
import { useReviewer } from '@/context/ReviewerContext';

type NavView = 'dashboard' | StudyMode | 'topics' | 'search';

interface SidebarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
}

const NAV_ITEMS: Array<{ id: NavView; icon: string; label: string; badge?: string }> = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'study', icon: '📚', label: 'Study Mode' },
  { id: 'quick-review', icon: '⚡', label: 'Quick Review' },
  { id: 'random-review', icon: '🎲', label: 'Random' },
  { id: 'power-memory', icon: '🧠', label: 'Power Memory' },
  { id: 'review-again', icon: '🔁', label: 'Review Again' },
  { id: 'topics', icon: '🗂', label: 'Topics' },
  { id: 'search', icon: '🔍', label: 'Search' },
];

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { state } = useReviewer();
  const reviewAgainCount = state.progress.reviewAgainQuestions.length;

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-slate-200 min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="font-extrabold text-slate-800 text-sm leading-tight">
          AWS Developer Associate
          <br />
          <span className="text-orange-500">Power Reviewer ⚡</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === 'review-again' && reviewAgainCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 font-semibold">
                  {reviewAgainCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="text-xs text-slate-400 leading-relaxed">
          🔒 Data stays in your browser
        </div>
      </div>
    </aside>
  );
}
