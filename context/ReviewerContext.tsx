'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { ReviewCard, StudyMode, StudyProgress, ReviewerStatistics } from '@/types/reviewer';
import {
  loadProgress,
  saveProgress,
  loadCards,
  saveCards,
  markKnown,
  markReviewAgain,
  markReviewed,
  resetProgress as resetProgressStorage,
  computeStatistics,
  loadLastMode,
  saveLastMode,
  loadSampleFlag,
  saveSampleFlag,
  clearCards,
} from '@/lib/storage';
import { SAMPLE_CARDS } from '@/data/sample-reviewer';

interface ReviewerState {
  cards: ReviewCard[];
  progress: StudyProgress;
  statistics: ReviewerStatistics;
  activeMode: StudyMode | null;
  topicFilter: string | null;
  searchQuery: string;
  isUsingSample: boolean;
  isLoaded: boolean;
}

type ReviewerAction =
  | { type: 'LOAD_STATE'; cards: ReviewCard[]; progress: StudyProgress; isUsingSample: boolean }
  | { type: 'SET_CARDS'; cards: ReviewCard[]; isUsingSample: boolean }
  | { type: 'SET_PROGRESS'; progress: StudyProgress }
  | { type: 'SET_MODE'; mode: StudyMode | null }
  | { type: 'SET_TOPIC_FILTER'; topic: string | null }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'RESET_PROGRESS' }
  | { type: 'CLEAR_CARDS' };

function computeStats(cards: ReviewCard[], progress: StudyProgress): ReviewerStatistics {
  return computeStatistics(cards, progress);
}

function reducer(state: ReviewerState, action: ReviewerAction): ReviewerState {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...state,
        cards: action.cards,
        progress: action.progress,
        statistics: computeStats(action.cards, action.progress),
        isUsingSample: action.isUsingSample,
        isLoaded: true,
      };
    case 'SET_CARDS':
      return {
        ...state,
        cards: action.cards,
        isUsingSample: action.isUsingSample,
        statistics: computeStats(action.cards, state.progress),
      };
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.progress,
        statistics: computeStats(state.cards, action.progress),
      };
    case 'SET_MODE':
      return { ...state, activeMode: action.mode };
    case 'SET_TOPIC_FILTER':
      return { ...state, topicFilter: action.topic };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'RESET_PROGRESS': {
      const p = resetProgressStorage();
      return { ...state, progress: p, statistics: computeStats(state.cards, p) };
    }
    case 'CLEAR_CARDS':
      return {
        ...state,
        cards: SAMPLE_CARDS,
        isUsingSample: true,
        statistics: computeStats(SAMPLE_CARDS, state.progress),
      };
    default:
      return state;
  }
}

interface ReviewerContextValue {
  state: ReviewerState;
  setCards: (cards: ReviewCard[], isUsingSample?: boolean) => void;
  setMode: (mode: StudyMode | null) => void;
  setTopicFilter: (topic: string | null) => void;
  setSearchQuery: (q: string) => void;
  handleMarkKnown: (id: string) => void;
  handleMarkReviewAgain: (id: string) => void;
  handleMarkReviewed: (id: string) => void;
  handleResetProgress: () => void;
  handleClearCards: () => void;
}

const ReviewerContext = createContext<ReviewerContextValue | null>(null);

const INITIAL_STATE: ReviewerState = {
  cards: [],
  progress: { knownQuestions: [], reviewAgainQuestions: [], reviewedQuestions: [] },
  statistics: { total: 0, known: 0, reviewAgain: 0, reviewed: 0, notReviewed: 0 },
  activeMode: null,
  topicFilter: null,
  searchQuery: '',
  isUsingSample: false,
  isLoaded: false,
};

export function ReviewerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    const progress = loadProgress();
    const storedCards = loadCards();
    const isUsingSample = loadSampleFlag();

    if (storedCards && storedCards.length > 0 && !isUsingSample) {
      dispatch({ type: 'LOAD_STATE', cards: storedCards, progress, isUsingSample: false });
    } else {
      dispatch({ type: 'LOAD_STATE', cards: SAMPLE_CARDS, progress, isUsingSample: true });
    }

    const lastMode = loadLastMode();
    if (lastMode) dispatch({ type: 'SET_MODE', mode: lastMode });
  }, []);

  const setCards = useCallback((cards: ReviewCard[], isUsingSample = false) => {
    saveCards(cards);
    saveSampleFlag(isUsingSample);
    dispatch({ type: 'SET_CARDS', cards, isUsingSample });
  }, []);

  const setMode = useCallback((mode: StudyMode | null) => {
    if (mode) saveLastMode(mode);
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const setTopicFilter = useCallback((topic: string | null) => {
    dispatch({ type: 'SET_TOPIC_FILTER', topic });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query });
  }, []);

  const handleMarkKnown = useCallback((id: string) => {
    const newProgress = markKnown(id, state.progress);
    saveProgress(newProgress);
    dispatch({ type: 'SET_PROGRESS', progress: newProgress });
  }, [state.progress]);

  const handleMarkReviewAgain = useCallback((id: string) => {
    const newProgress = markReviewAgain(id, state.progress);
    saveProgress(newProgress);
    dispatch({ type: 'SET_PROGRESS', progress: newProgress });
  }, [state.progress]);

  const handleMarkReviewed = useCallback((id: string) => {
    const newProgress = markReviewed(id, state.progress);
    saveProgress(newProgress);
    dispatch({ type: 'SET_PROGRESS', progress: newProgress });
  }, [state.progress]);

  const handleResetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
  }, []);

  const handleClearCards = useCallback(() => {
    clearCards();
    saveSampleFlag(true);
    dispatch({ type: 'CLEAR_CARDS' });
  }, []);

  return (
    <ReviewerContext.Provider
      value={{
        state,
        setCards,
        setMode,
        setTopicFilter,
        setSearchQuery,
        handleMarkKnown,
        handleMarkReviewAgain,
        handleMarkReviewed,
        handleResetProgress,
        handleClearCards,
      }}
    >
      {children}
    </ReviewerContext.Provider>
  );
}

export function useReviewer() {
  const ctx = useContext(ReviewerContext);
  if (!ctx) throw new Error('useReviewer must be used within ReviewerProvider');
  return ctx;
}
