/**
 * Client-side rate limiter using sliding window counters in memory.
 * Prevents abuse of auth, order submissions, and other sensitive operations.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if an action is rate-limited.
 * @param key - Unique identifier (e.g., "auth:login", "order:submit:userId")
 * @param maxAttempts - Maximum allowed attempts in the window
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean, retryAfterMs: number, remaining: number }
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number; remaining: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxAttempts) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    return { allowed: false, retryAfterMs, remaining: 0 };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    retryAfterMs: 0,
    remaining: maxAttempts - entry.timestamps.length,
  };
}

/**
 * Reset rate limit for a specific key (e.g., after successful auth)
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

// Predefined rate limit configs
export const RATE_LIMITS = {
  AUTH_LOGIN: { maxAttempts: 5, windowMs: 5 * 60 * 1000 },       // 5 attempts per 5 min
  AUTH_SIGNUP: { maxAttempts: 3, windowMs: 10 * 60 * 1000 },     // 3 attempts per 10 min
  AUTH_RESET: { maxAttempts: 3, windowMs: 15 * 60 * 1000 },      // 3 per 15 min
  ORDER_SUBMIT: { maxAttempts: 5, windowMs: 60 * 1000 },         // 5 per minute
  SPIN_WHEEL: { maxAttempts: 1, windowMs: 24 * 60 * 60 * 1000 }, // 1 per day (backup to DB)
  REVIEW_SUBMIT: { maxAttempts: 3, windowMs: 60 * 1000 },        // 3 per minute
  SEARCH_QUERY: { maxAttempts: 30, windowMs: 60 * 1000 },        // 30 per minute
} as const;

/**
 * Format retry time for user display
 */
export function formatRetryTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}
