'use client';

import React from 'react';

interface Shortcut {
  key: string;
  action: string;
}

interface KeyboardShortcutsProps {
  shortcuts?: Shortcut[];
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { key: 'Space / →', action: 'Reveal answer / Next question' },
  { key: '1', action: 'Mark as Known' },
  { key: '2', action: 'Mark as Review Again' },
  { key: 'Escape', action: 'Return to menu' },
];

export default function KeyboardShortcuts({ shortcuts = DEFAULT_SHORTCUTS }: KeyboardShortcutsProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        ⌨ Keyboard Shortcuts
      </div>
      <div className="grid gap-2">
        {shortcuts.map((s) => (
          <div key={s.key} className="flex items-center justify-between text-sm">
            <kbd className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-mono text-slate-700 shadow-sm">
              {s.key}
            </kbd>
            <span className="text-slate-600 text-xs">{s.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
