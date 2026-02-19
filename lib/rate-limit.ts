const bucket = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(key: string) {
  const windowSec = Number(process.env.RATE_LIMIT_WINDOW_SEC ?? 60);
  const maxReq = Number(process.env.RATE_LIMIT_MAX_REQ ?? 30);
  const now = Date.now();
  const existing = bucket.get(key);
  if (!existing || existing.resetAt < now) {
    bucket.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  if (existing.count >= maxReq) return false;
  existing.count += 1;
  return true;
}
