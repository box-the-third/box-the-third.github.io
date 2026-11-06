// Supabase Edge Function: agent-run
// Server-side proxy for the AI model so the key never reaches the browser or git.
// Deploy:  supabase functions deploy agent-run
// Secrets: supabase secrets set GEMINI_API_KEY=...   (free tier at aistudio.google.com)
//
// Protections: requires a signed-in user (JWT verified by the platform),
// per-user rate limit, prompt size cap, CORS allow-list.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "https://box-the-third.github.io,http://localhost:3000").split(",");
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
const MAX_PROMPT = 12000;
const PER_HOUR = 40;

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": ALLOWED.includes(origin) ? origin : ALLOWED[0],
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Vary": "Origin",
});

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const h = { ...cors(origin), "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response(null, { headers: h });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "method" }), { status: 405, headers: h });

  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: u } = await supa.auth.getUser();
  if (!u.user) return new Response(JSON.stringify({ error: "auth" }), { status: 401, headers: h });

  // Rate limit using the user's own RLS-protected usage log.
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supa.from("studio_usage").select("id", { count: "exact", head: true }).gte("created_at", since);
  if ((count ?? 0) >= PER_HOUR) return new Response(JSON.stringify({ error: "rate" }), { status: 429, headers: h });

  const body = await req.json().catch(() => ({}));
  const prompt = String(body.prompt ?? "").slice(0, MAX_PROMPT);
  const agent = String(body.agent ?? "generic").slice(0, 32);
  if (!prompt) return new Response(JSON.stringify({ error: "prompt" }), { status: 400, headers: h });

  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return new Response(JSON.stringify({ error: "not-configured" }), { status: 503, headers: h });

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!r.ok) return new Response(JSON.stringify({ error: "upstream" }), { status: 502, headers: h });
  const d = await r.json();
  const text = (d.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");

  await supa.from("studio_usage").insert({ user_id: u.user.id, agent });
  return new Response(JSON.stringify({ text }), { headers: h });
});
