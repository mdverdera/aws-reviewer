'use client';

import React from 'react';
import { ReviewerStatistics } from '@/types/reviewer';

interface StatsCardsProps {
  stats: ReviewerStatistics;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      label: 'Total',
      value: stats.total,
      icon: '📋',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      valueColor: 'text-slate-800',
    },
    {
      label: 'Known',
      value: stats.known,
      icon: '✓',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      valueColor: 'text-emerald-700',
    },
    {
      label: 'Review Again',
      value: stats.reviewAgain,
      icon: '🔁',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      valueColor: 'text-amber-700',
    },
    {
      label: 'Not Reviewed',
      value: stats.notReviewed,
      icon: '📚',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      valueColor: 'text-blue-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border p-3 flex flex-col items-center gap-1 ${item.color}`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className={`text-2xl font-bold ${item.valueColor}`}>{item.value}</span>
          <span className="text-xs font-medium opacity-80">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
