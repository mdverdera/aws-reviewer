export interface ReviewCard {
  id: string;
  item: string;
  question: string;
  answer: string;
  powerMemory1?: string;
  powerMemory2?: string;
}

export type StudyMode =
  | 'study'
  | 'quick-review'
  | 'random-review'
  | 'power-memory'
  | 'review-again';

export type ReviewStatus = 'not-reviewed' | 'known' | 'review-again';

export interface StudyProgress {
  knownQuestions: string[];
  reviewAgainQuestions: string[];
  reviewedQuestions: string[];
}

export interface ReviewerStatistics {
  total: number;
  known: number;
  reviewAgain: number;
  reviewed: number;
  notReviewed: number;
}

export interface StudySession {
  mode: StudyMode;
  currentIndex: number;
  cards: ReviewCard[];
  topicFilter: string | null;
}
