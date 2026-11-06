import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { enqueue, flushOutbox, circuitOpen, recordResult, store, withRetry, withTimeout } from "./resilience";

export interface Item {
  id: string;
  kind: string; // cv | sop | email | handoff | invoice | booking | post | card | payment
  title: string;
  status: string; // draft | pending | approved | rejected | sent | paid ...
  payload: Record<string, unknown>;
  created_at: string;
}
const KEY = "yas_items_v1";
const all = () => store.read<Item[]>(KEY, []);

export const listItems = (kind?: string) =>
  all().filter((i) => !kind || i.kind === kind).sort((a, b) => b.created_at.localeCompare(a.created_at));

async function remote(table: string, row: Record<string, unknown>) {
  const { error } = await getSupabase().from(table).upsert(row);
  if (error) throw error;
}

/** Local-first save; syncs to Supabase when reachable, otherwise queues. */
export async function saveItem(
  userId: string | null,
  it: Partial<Item> & { kind: string; title: string }
): Promise<Item> {
  const item: Item = {
    id: it.id ?? crypto.randomUUID(),
    kind: it.kind,
    title: it.title,
    status: it.status ?? "draft",
    payload: it.payload ?? {},
    created_at: it.created_at ?? new Date().toISOString(),
  };
  const rest = all().filter((i) => i.id !== item.id);
  store.write(KEY, [item, ...rest].slice(0, 500));
  if (userId && supabaseConfigured) {
    const row = { ...item, user_id: userId };
    if (circuitOpen("supabase")) enqueue("studio_items", row);
    else {
      try {
        await withRetry(() => withTimeout(remote("studio_items", row)), 2);
        recordResult("supabase", true);
      } catch {
        recordResult("supabase", false);
        enqueue("studio_items", row);
      }
    }
  }
  return item;
}

export function removeItem(id: string) {
  store.write(KEY, all().filter((i) => i.id !== id));
}

export const syncOutbox = () => flushOutbox(remote);

/** Pull the user's server copies and merge (server wins on same id). */
export async function pullItems(userId: string) {
  try {
    const q = getSupabase()
      .from("studio_items")
      .select("id,kind,title,status,payload,created_at")
      .eq("user_id", userId)
      .limit(300);
    const { data, error } = (await withTimeout(Promise.resolve(q), 7000)) as {
      data: Item[] | null;
      error: unknown;
    };
    if (error || !data) return;
    const map = new Map(all().map((i) => [i.id, i]));
    data.forEach((d) => map.set(d.id, d));
    store.write(KEY, [...map.values()]);
    recordResult("supabase", true);
  } catch {
    recordResult("supabase", false);
  }
}

/** Feedback loop: ratings + comments, captured even when offline. */
export async function sendFeedback(userId: string | null, agent: string, rating: number, comment: string) {
  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    agent,
    rating,
    comment: comment.slice(0, 1000),
    created_at: new Date().toISOString(),
  };
  const log = store.read<unknown[]>("yas_feedback_v1", []);
  store.write("yas_feedback_v1", [row, ...log].slice(0, 100));
  if (userId && supabaseConfigured) {
    try {
      await withTimeout(remote("studio_feedback", row), 6000);
    } catch {
      enqueue("studio_feedback", row);
    }
  }
}
