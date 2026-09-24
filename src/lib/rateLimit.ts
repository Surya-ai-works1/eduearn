interface RateLimitRecord {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private hits: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: any = null;

  constructor() {
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval?.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check and record a hit for an identifier
   * @param identifier - e.g. IP address or user ID
   * @param limit - Maximum requests allowed within window
   * @param windowSeconds - Time window in seconds
   */
  check(
    identifier: string,
    limit: number = 60,
    windowSeconds: number = 60
  ): {
    allowed: boolean;
    remaining: number;
    resetSeconds: number;
  } {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    let record = this.hits.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.hits.set(identifier, record);
    }

    // Filter out timestamps outside current window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldestInWindow = record.timestamps[0] || now;
      const resetSeconds = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: Math.max(1, resetSeconds),
      };
    }

    record.timestamps.push(now);
    const remaining = limit - record.timestamps.length;
    const resetSeconds = Math.ceil(windowSeconds);

    return {
      allowed: true,
      remaining,
      resetSeconds,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 10 * 60 * 1000);
      if (record.timestamps.length === 0) {
        this.hits.delete(key);
      }
    }
  }
}

const globalRateLimiter = new SlidingWindowRateLimiter();

export function rateLimit(
  request: Request,
  limit: number = 30,
  windowSeconds: number = 60,
  keyPrefix: string = "general"
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const identifier = `${keyPrefix}:${ip}`;

  return globalRateLimiter.check(identifier, limit, windowSeconds);
}
