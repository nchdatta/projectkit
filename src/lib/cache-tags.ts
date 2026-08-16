/**
 * Cache tags applied with `cacheTag()` at fetch time and invalidated by the
 * Server Actions in `src/lib/actions.ts`. Keeping them in one place stops
 * the read side and the invalidation side drifting apart.
 */
export const CACHE_TAGS = {
  dashboard: 'dashboard',
  conversations: 'conversations',
  knowledgeBase: 'knowledge-base',
};

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
