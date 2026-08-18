/**
 * Read path resilience.
 *
 *   in-memory cache  →  Postgres  →  build-time snapshot
 *
 * The app and the database live on different providers (Firebase App Hosting
 * and Railway), so a network partition between them is a realistic failure —
 * not a hypothetical one. When it happens the public site must keep serving
 * timings, phone numbers and addresses rather than returning 500s.
 */

const DEFAULT_TTL_MS = 60_000;
const QUERY_TIMEOUT_MS = 4_000;
/** Don't flood logs while an outage is ongoing. */
const LOG_INTERVAL_MS = 30_000;

type Entry = { value: unknown; storedAt: number };

const cache = new Map<string, Entry>();

let lastFailureAt: number | null = null;
let lastSuccessAt: number | null = null;
let lastLoggedAt = 0;

export type ContentHealth = {
  degraded: boolean;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
};

export function contentHealth(): ContentHealth {
  return {
    degraded:
      lastFailureAt !== null &&
      (lastSuccessAt === null || lastFailureAt > lastSuccessAt),
    lastFailureAt,
    lastSuccessAt,
  };
}

/** Called by admin actions after a write so edits appear immediately. */
export function invalidateContentCache() {
  cache.clear();
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Database did not respond within ${ms}ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function report(key: string, error: unknown, servedFrom: string) {
  const now = Date.now();
  if (now - lastLoggedAt < LOG_INTERVAL_MS) return;
  lastLoggedAt = now;
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `[resilient] "${key}" failed (${message}). Serving ${servedFrom}.`,
  );
}

/**
 * Reads `key` through the cache, falling back to the last good value and then
 * to the compiled-in snapshot. Never throws — a read failure degrades the page
 * to older content instead of breaking it.
 */
export async function resilientRead<T>(
  key: string,
  load: () => Promise<T>,
  fallback: () => T,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);

  if (hit && now - hit.storedAt < ttlMs) return hit.value as T;

  try {
    const value = await withTimeout(load(), QUERY_TIMEOUT_MS);
    cache.set(key, { value, storedAt: now });
    lastSuccessAt = now;
    return value;
  } catch (error) {
    lastFailureAt = now;

    if (hit) {
      report(key, error, "the last known good value");
      return hit.value as T;
    }

    report(key, error, "the build-time snapshot");
    return fallback();
  }
}
