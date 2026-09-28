'use client';

import React, { useState, useMemo } from 'react';
import { useReviewer } from '@/context/ReviewerContext';
import SearchBox from '@/components/SearchBox';
import SearchResults from '@/components/SearchResults';
import { searchCards } from '@/lib/reviewer';
import { ReviewCard } from '@/types/reviewer';

interface SearchViewProps {
  onSelectCard: (card: ReviewCard) => void;
}

export default function SearchView({ onSelectCard }: SearchViewProps) {
  const { state } = useReviewer();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => (query.trim().length >= 2 ? searchCards(state.cards, query) : []),
    [query, state.cards]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-slate-800 text-lg mb-1">Search</h2>
        <p className="text-sm text-slate-500">
          Search across all questions, answers, and power memory cues.
        </p>
      </div>

      <SearchBox value={query} onChange={setQuery} />

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-sm text-slate-400 text-center">Type at least 2 characters to search.</p>
      )}

      {query.trim().length >= 2 && (
        <SearchResults cards={results} query={query} onSelectCard={onSelectCard} />
      )}

      {!query && (
        <div className="text-center text-slate-400 py-10">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Start typing to search your reviewer</p>
        </div>
      )}
    </div>
  );
}
