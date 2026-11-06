import { getSupabase, supabaseAnonKey, supabaseUrl, supabaseConfigured } from "@/lib/supabase";
import { circuitOpen, recordResult, withTimeout } from "./resilience";

export interface AIResult {
  text: string;
  /** "ai" = server model answered, "local" = built-in template engine */
  source: "ai" | "local";
}

/**
 * Ask the server-side agent (Supabase Edge Function `agent-run`). The model
 * key lives only in that function's secrets, never in the browser or in git.
 * If the function is down, rate-limited, or unconfigured, we fall back to the
 * deterministic local engine so the agent always produces something useful.
 */
export async function runAI(agent: string, prompt: string, local: () => string): Promise<AIResult> {
  if (supabaseConfigured && !circuitOpen("agent-run")) {
    try {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        const res = await withTimeout(
          fetch(`${supabaseUrl}/functions/v1/agent-run`, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: supabaseAnonKey, Authorization: `Bearer ${token}` },
            body: JSON.stringify({ agent, prompt }),
          }),
          25000
        );
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { text?: string };
        if (j.text) {
          recordResult("agent-run", true);
          return { text: j.text, source: "ai" };
        }
      }
    } catch {
      recordResult("agent-run", false);
    }
  }
  return { text: local(), source: "local" };
}

/** Pull the first JSON object out of a model reply (tolerates fences/prose). */
export function parseJson<T>(raw: string): T | null {
  try {
    const b = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(b.slice(b.indexOf("{"), b.lastIndexOf("}") + 1)) as T;
  } catch {
    return null;
  }
}
