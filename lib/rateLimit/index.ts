export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

const MAX_TRACKED_KEYS = 1000;

/**
 * Basic in-memory, fixed-window, per-key rate limiter. Scoped to a single
 * warm serverless function instance — resets on cold start and isn't
 * shared across concurrent instances, so this is a soft deterrent against
 * one actor hammering an endpoint, not a hard distributed guarantee. A
 * Supabase-table-backed version would close that gap, but applying a new
 * migration against the live project needs a credential this agent
 * doesn't have (the configured service-role key is data-plane only, no
 * DDL access) — logged as a blocker in AGENT_STATE.md rather than
 * fabricated or worked around.
 */
export function createRateLimiter(windowMs: number, max: number) {
  const buckets = new Map<string, Bucket>();

  return function checkRateLimit(key: string): RateLimitResult {
    const now = Date.now();

    if (buckets.size > MAX_TRACKED_KEYS) {
      for (const [trackedKey, bucket] of buckets) {
        if (now - bucket.windowStart >= windowMs) buckets.delete(trackedKey);
      }
    }

    const bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart >= windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (bucket.count < max) {
      bucket.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    }

    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.windowStart + windowMs - now) / 1000) };
  };
}

/** Best-effort client IP from standard proxy headers — Vercel sets x-forwarded-for. */
export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
