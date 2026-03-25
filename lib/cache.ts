interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = {
  geocodio: 24 * 60 * 60 * 1000,   // 24 hours
  fec: 12 * 60 * 60 * 1000,         // 12 hours
  pac: 24 * 60 * 60 * 1000,         // 24 hours
};

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlType: keyof typeof DEFAULT_TTL = "geocodio"): void {
  cache.set(key, {
    data,
    expiry: Date.now() + DEFAULT_TTL[ttlType],
  });
}

export function normalizeZip(input: string): string {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}
