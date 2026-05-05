type Bucket = { tokens: number; lastRefill: number };

const buckets: Map<string, Bucket> = new Map();

// Token bucket: allow `capacity` tokens, refill `rate` tokens per `intervalMs`.
export function allowSend(key: string, capacity = 5, refillTokens = 5, intervalMs = 10_000) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: capacity, lastRefill: now };
    buckets.set(key, b);
  }
  // refill
  const elapsed = now - b.lastRefill;
  if (elapsed > 0) {
    const chunks = Math.floor(elapsed / intervalMs);
    if (chunks > 0) {
      b.tokens = Math.min(capacity, b.tokens + chunks * refillTokens);
      b.lastRefill = now;
    }
  }
  if (b.tokens > 0) {
    b.tokens -= 1;
    return true;
  }
  return false;
}

export function timeUntilRefill(key: string, intervalMs = 10_000) {
  const b = buckets.get(key);
  if (!b) return 0;
  const since = Date.now() - b.lastRefill;
  const wait = Math.max(0, intervalMs - since);
  return wait;
}
