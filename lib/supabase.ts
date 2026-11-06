import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Config comes from env (inlined at build). Nothing is hardcoded in source.
// The anon key is a *public* key by design — row-level security is what
// protects data — but keeping it out of git lets us rotate it freely.
// Real secrets (service_role, AI keys, bank details) never belong here.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const supabaseUrl = SUPABASE_URL;
export const supabaseAnonKey = SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** Lazily create a single browser Supabase client (client-side only).
 *  Default auth storage is kept so the legacy static pages share the session. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    // Placeholder host keeps the app rendering (degraded) if env is missing.
    client = createClient(
      SUPABASE_URL || "http://supabase.invalid",
      SUPABASE_ANON_KEY || "missing-anon-key"
    );
  }
  return client;
}
