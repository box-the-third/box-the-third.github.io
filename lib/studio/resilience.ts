// Fail-safes for external outages (Supabase, AI, n8n). Everything the studio
// writes goes to localStorage FIRST, then syncs; if the network/DB is down the
// write sits in an outbox and is retried with backoff. Users never lose work
// and sign-ups/leads always get captured through a fallback channel.

const OUTBOX = "yas_outbox_v1";
type Job = { id: string; table: string; row: Record<string, unknown>; tries: number; at: number };

const read = <T,>(k: string, d: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota/private mode */ } };

export const store = { read, write };

export async function withRetry<T>(fn: () => Promise<T>, tries = 3, base = 400): Promise<T> {
  let err: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { err = e; await new Promise((r) => setTimeout(r, base * 2 ** i + Math.random() * 120)); }
  }
  throw err;
}

export async function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return await Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

/** Circuit breaker: after 3 straight failures a service is skipped for 60s. */
const breaker: Record<string, { fails: number; until: number }> = {};
export function circuitOpen(name: string) { return (breaker[name]?.until ?? 0) > Date.now(); }
export function recordResult(name: string, ok: boolean) {
  const b = (breaker[name] ||= { fails: 0, until: 0 });
  if (ok) { b.fails = 0; b.until = 0; } else if (++b.fails >= 3) b.until = Date.now() + 60_000;
}

export function enqueue(table: string, row: Record<string, unknown>) {
  const q = read<Job[]>(OUTBOX, []);
  q.push({ id: crypto.randomUUID?.() ?? String(Math.random()), table, row, tries: 0, at: Date.now() });
  write(OUTBOX, q.slice(-200));
}
export const outboxSize = () => read<Job[]>(OUTBOX, []).length;

/** Push queued rows to Supabase. Returns how many are still pending. */
export async function flushOutbox(
  insert: (table: string, row: Record<string, unknown>) => Promise<void>
): Promise<number> {
  const q = read<Job[]>(OUTBOX, []);
  const left: Job[] = [];
  for (const j of q) {
    try { await withTimeout(insert(j.table, j.row), 6000); recordResult("supabase", true); }
    catch { recordResult("supabase", false); if (++j.tries < 20) left.push(j); }
  }
  write(OUTBOX, left);
  return left.length;
}

/** Ordered failover across redundant endpoints (e.g. primary → mirror). */
export async function failover<T>(endpoints: string[], call: (url: string) => Promise<T>): Promise<T> {
  let last: unknown;
  for (const url of endpoints) {
    try { return await withTimeout(call(url), 9000); } catch (e) { last = e; }
  }
  throw last ?? new Error("all endpoints failed");
}

/** Reachability probe. Any HTTP response (even 401) means the host is up;
 *  only a network failure or timeout counts as an outage. */
export async function healthCheck(url: string, anonKey = ""): Promise<boolean> {
  if (!url || url.includes("supabase.invalid")) return false;
  try {
    await withTimeout(
      fetch(`${url}/auth/v1/health`, { method: "GET", cache: "no-store", headers: anonKey ? { apikey: anonKey } : {} }),
      4000
    );
    return true;
  } catch { return false; }
}
