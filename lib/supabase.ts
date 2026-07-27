import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Same project + anon key as the static dashboard (public/assets/js/db.js).
// IMPORTANT: use the DEFAULT auth storage options so the session is written
// to `sb-<ref>-auth-token` in localStorage — the exact key the CDN client on
// dashboard.html reads. That way a sign-in here is instantly recognised there.
const SUPABASE_URL = "https://fssauttfaolebmulqyuz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzc2F1dHRmYW9sZWJtdWxxeXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTQ1NDIsImV4cCI6MjA5NzA5MDU0Mn0.FtUFC8bM5jOB6h_TXuF5G2UEmklWWYQo5KH8EPyCyOI";

let client: SupabaseClient | null = null;

/** Lazily create a single browser Supabase client (client-side only). */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}
