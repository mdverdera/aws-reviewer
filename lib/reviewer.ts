import { ReviewCard } from '@/types/reviewer';

/**
 * Creates a shuffled copy of the array using Fisher-Yates algorithm.
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns cards for the current random session.
 * All cards are shuffled once; won't repeat until all shown.
 */
export function createRandomSession(cards: ReviewCard[]): ReviewCard[] {
  return shuffle(cards);
}

/**
 * Groups cards by item/topic and returns a sorted map of topic → cards.
 */
export function groupByTopic(cards: ReviewCard[]): Map<string, ReviewCard[]> {
  const map = new Map<string, ReviewCard[]>();
  for (const card of cards) {
    const topic = card.item || 'General';
    if (!map.has(topic)) map.set(topic, []);
    map.get(topic)!.push(card);
  }
  // Sort by topic name
  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

/**
 * Returns unique topic names sorted alphabetically.
 */
export function getTopics(cards: ReviewCard[]): string[] {
  const topics = Array.from(new Set(cards.map((c) => c.item || 'General')));
  return topics.sort((a, b) => a.localeCompare(b));
}

/**
 * Filters cards by topic (case-insensitive exact match).
 */
export function filterByTopic(cards: ReviewCard[], topic: string): ReviewCard[] {
  if (!topic || topic === 'all') return cards;
  return cards.filter((c) => (c.item || 'General').toLowerCase() === topic.toLowerCase());
}

/**
 * Searches cards across all text fields.
 */
export function searchCards(cards: ReviewCard[], query: string): ReviewCard[] {
  if (!query.trim()) return cards;
  const q = query.toLowerCase().trim();
  return cards.filter(
    (c) =>
      c.item?.toLowerCase().includes(q) ||
      c.question?.toLowerCase().includes(q) ||
      c.answer?.toLowerCase().includes(q) ||
      c.powerMemory1?.toLowerCase().includes(q) ||
      c.powerMemory2?.toLowerCase().includes(q)
  );
}

/**
 * Highlights query occurrences in text by wrapping them in <mark>.
 */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}
