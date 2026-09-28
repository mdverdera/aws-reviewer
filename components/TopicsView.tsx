'use client';

import React from 'react';
import { useReviewer } from '@/context/ReviewerContext';
import TopicFilter from '@/components/TopicFilter';
import { StudyMode } from '@/types/reviewer';

interface TopicsViewProps {
  onStartMode: (mode: StudyMode) => void;
}

export default function TopicsView({ onStartMode }: TopicsViewProps) {
  const { state, setTopicFilter, setMode } = useReviewer();

  const handleTopicSelect = (topic: string | null) => {
    setTopicFilter(topic);
    setMode('study');
    onStartMode('study');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-slate-800 text-lg mb-1">Topics</h2>
        <p className="text-sm text-slate-500">
          Select a topic to study questions for that AWS service.
        </p>
      </div>

      <TopicFilter
        cards={state.cards}
        selected={state.topicFilter}
        onSelect={handleTopicSelect}
      />
    </div>
  );
}
