'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StudyMode } from '@/types/reviewer';
import { useReviewer } from '@/context/ReviewerContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import Dashboard from '@/components/Dashboard';
import StudyModeView from '@/components/StudyModeView';
import QuickReviewView from '@/components/QuickReviewView';
import RandomReviewView from '@/components/RandomReviewView';
import PowerMemoryView from '@/components/PowerMemoryView';
import ReviewAgainView from '@/components/ReviewAgainView';
import TopicsView from '@/components/TopicsView';
import SearchView from '@/components/SearchView';
import { ReviewCard } from '@/types/reviewer';
import { motion, AnimatePresence } from 'framer-motion';

type NavView = 'dashboard' | StudyMode | 'topics' | 'search';

export default function Home() {
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const { state, setMode, setTopicFilter, handleMarkKnown, handleMarkReviewAgain, handleMarkReviewed } =
    useReviewer();

  const { cards, progress, topicFilter } = state;

  // Escape key returns to dashboard from any study mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeView !== 'dashboard') {
        e.preventDefault();
        setActiveView('dashboard');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeView]);

  const handleStartMode = useCallback(
    (mode: StudyMode) => {
      setMode(mode);
      setActiveView(mode);
    },
    [setMode]
  );

  const handleNavigate = useCallback(
    (view: NavView) => {
      setActiveView(view);
      if (view !== 'study' && view !== 'quick-review' && view !== 'random-review' && view !== 'power-memory' && view !== 'review-again') {
        setMode(null);
      }
    },
    [setMode]
  );

  const handleSelectCard = useCallback(
    (card: ReviewCard) => {
      // Navigate to study mode and jump to a filtered view for the card's topic
      setTopicFilter(card.item);
      setMode('study');
      setActiveView('study');
    },
    [setTopicFilter, setMode]
  );

  const handleExit = useCallback(() => {
    setActiveView('dashboard');
    setMode(null);
  }, [setMode]);

  const renderContent = () => {
    switch (activeView) {
      case 'study':
        return (
          <StudyModeView
            cards={cards}
            progress={progress}
            topicFilter={topicFilter}
            onMarkKnown={handleMarkKnown}
            onMarkReviewAgain={handleMarkReviewAgain}
            onMarkReviewed={handleMarkReviewed}
            onExit={handleExit}
          />
        );
      case 'quick-review':
        return (
          <QuickReviewView
            cards={cards}
            progress={progress}
            topicFilter={topicFilter}
            onMarkKnown={handleMarkKnown}
            onMarkReviewAgain={handleMarkReviewAgain}
            onMarkReviewed={handleMarkReviewed}
            onExit={handleExit}
          />
        );
      case 'random-review':
        return (
          <RandomReviewView
            cards={cards}
            progress={progress}
            topicFilter={topicFilter}
            onMarkKnown={handleMarkKnown}
            onMarkReviewAgain={handleMarkReviewAgain}
            onMarkReviewed={handleMarkReviewed}
            onExit={handleExit}
          />
        );
      case 'power-memory':
        return (
          <PowerMemoryView
            cards={cards}
            progress={progress}
            topicFilter={topicFilter}
            onMarkKnown={handleMarkKnown}
            onMarkReviewAgain={handleMarkReviewAgain}
            onMarkReviewed={handleMarkReviewed}
            onExit={handleExit}
          />
        );
      case 'review-again':
        return (
          <ReviewAgainView
            cards={cards}
            progress={progress}
            onMarkKnown={handleMarkKnown}
            onMarkReviewAgain={handleMarkReviewAgain}
            onMarkReviewed={handleMarkReviewed}
            onStartFullReview={() => handleStartMode('study')}
            onExit={handleExit}
          />
        );
      case 'topics':
        return <TopicsView onStartMode={handleStartMode} />;
      case 'search':
        return <SearchView onSelectCard={handleSelectCard} />;
      case 'dashboard':
      default:
        return <Dashboard onStartMode={handleStartMode} />;
    }
  };

  if (!state.isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm">Loading reviewer…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav activeView={activeView} onNavigate={handleNavigate} />
    </div>
  );
}
