import { StudyProgress, ReviewerStatistics, ReviewCard } from '@/types/reviewer';
import { StudyMode } from '@/types/reviewer';

const STORAGE_KEYS = {
  PROGRESS: 'aws-reviewer-progress',
  CARDS: 'aws-reviewer-cards',
  LAST_MODE: 'aws-reviewer-last-mode',
  USING_SAMPLE: 'aws-reviewer-using-sample',
} as const;

export const DEFAULT_PROGRESS: StudyProgress = {
  knownQuestions: [],
  reviewAgainQuestions: [],
  reviewedQuestions: [],
};

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable
  }
}

// Progress
export function loadProgress(): StudyProgress {
  return safeGetItem<StudyProgress>(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
}

export function saveProgress(progress: StudyProgress): void {
  safeSetItem(STORAGE_KEYS.PROGRESS, progress);
}

export function markKnown(id: string, progress: StudyProgress): StudyProgress {
  const known = Array.from(new Set([...progress.knownQuestions, id]));
  const reviewAgain = progress.reviewAgainQuestions.filter((q) => q !== id);
  const reviewed = Array.from(new Set([...progress.reviewedQuestions, id]));
  return { knownQuestions: known, reviewAgainQuestions: reviewAgain, reviewedQuestions: reviewed };
}

export function markReviewAgain(id: string, progress: StudyProgress): StudyProgress {
  const reviewAgain = Array.from(new Set([...progress.reviewAgainQuestions, id]));
  const known = progress.knownQuestions.filter((q) => q !== id);
  const reviewed = Array.from(new Set([...progress.reviewedQuestions, id]));
  return { knownQuestions: known, reviewAgainQuestions: reviewAgain, reviewedQuestions: reviewed };
}

export function markReviewed(id: string, progress: StudyProgress): StudyProgress {
  const reviewed = Array.from(new Set([...progress.reviewedQuestions, id]));
  return { ...progress, reviewedQuestions: reviewed };
}

export function resetProgress(): StudyProgress {
  safeSetItem(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
}

// Cards
export function saveCards(cards: ReviewCard[]): void {
  safeSetItem(STORAGE_KEYS.CARDS, cards);
}

export function loadCards(): ReviewCard[] | null {
  return safeGetItem<ReviewCard[] | null>(STORAGE_KEYS.CARDS, null);
}

export function clearCards(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.USING_SAMPLE);
  } catch {
    // ignore
  }
}

// Last mode
export function saveLastMode(mode: StudyMode): void {
  safeSetItem(STORAGE_KEYS.LAST_MODE, mode);
}

export function loadLastMode(): StudyMode | null {
  return safeGetItem<StudyMode | null>(STORAGE_KEYS.LAST_MODE, null);
}

// Using sample data flag
export function saveSampleFlag(usingSample: boolean): void {
  safeSetItem(STORAGE_KEYS.USING_SAMPLE, usingSample);
}

export function loadSampleFlag(): boolean {
  return safeGetItem<boolean>(STORAGE_KEYS.USING_SAMPLE, false);
}

// Statistics
export function computeStatistics(cards: ReviewCard[], progress: StudyProgress): ReviewerStatistics {
  const total = cards.length;
  const known = progress.knownQuestions.filter((id) => cards.some((c) => c.id === id)).length;
  const reviewAgain = progress.reviewAgainQuestions.filter((id) =>
    cards.some((c) => c.id === id)
  ).length;
  const reviewed = progress.reviewedQuestions.filter((id) => cards.some((c) => c.id === id)).length;
  const notReviewed = total - reviewed;
  return { total, known, reviewAgain, reviewed, notReviewed };
}

// Export progress as JSON
export function exportProgressAsJSON(cards: ReviewCard[], progress: StudyProgress): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    statistics: computeStatistics(cards, progress),
    progress,
    cardsSummary: cards.map((c) => ({
      id: c.id,
      item: c.item,
      question: c.question.substring(0, 60) + (c.question.length > 60 ? '...' : ''),
      status: progress.knownQuestions.includes(c.id)
        ? 'known'
        : progress.reviewAgainQuestions.includes(c.id)
        ? 'review-again'
        : progress.reviewedQuestions.includes(c.id)
        ? 'reviewed'
        : 'not-reviewed',
    })),
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aws-reviewer-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
