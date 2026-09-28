'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PowerMemoryCardProps {
  powerMemory1?: string;
  powerMemory2?: string;
  visible: boolean;
}

export default function PowerMemoryCard({ powerMemory1, powerMemory2, visible }: PowerMemoryCardProps) {
  if (!visible) return null;
  if (!powerMemory1 && !powerMemory2) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-purple-800 text-base tracking-wide uppercase text-sm">
              Power Memory
            </span>
          </div>
          <div className="space-y-3">
            {powerMemory1 && (
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{powerMemory1}</p>
              </div>
            )}
            {powerMemory2 && (
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{powerMemory2}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
