const ipRequests = new Map<
  string,
  {
    count: number;
    lastReset: number;
  }
>();

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();

  const existing = ipRequests.get(key);

  if (!existing) {
    ipRequests.set(key, {
      count: 1,
      lastReset: now,
    });

    return {
      allowed: true,
      remaining: limit - 1,
    };
  }

  if (now - existing.lastReset > windowMs) {
    existing.count = 1;
    existing.lastReset = now;

    return {
      allowed: true,
      remaining: limit - 1,
    };
  }

  existing.count++;

  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: limit - existing.count,
  };
}