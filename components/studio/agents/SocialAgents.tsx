"use client";

import { useCallback, useEffect, useState } from "react";
import { runAI } from "@/lib/studio/ai";
import { socialVariants } from "@/lib/studio/local";
import { listItems, saveItem, type Item } from "@/lib/studio/data";
import { circuitOpen, recordResult, withTimeout } from "@/lib/studio/resilience";
import { Field, useAward, useUid } from "../ui";

const N8N = process.env.NEXT_PUBLIC_N8N_WEBHOOK || "http://localhost:5678/webhook/yas-social";
const PLATFORMS = ["linkedin", "x", "instagram", "facebook"] as const;
type P = (typeof PLATFORMS)[number];
interface Post { variants: Record<string, string>; platforms: P[]; at: string; error?: string }

/** Send ONLY approved posts to n8n (running on localhost). */
export async function dispatchPost(uid: string | null, it: Item): Promise<"sent" | "offline" | "blocked"> {
  if (it.status !== "approved") return "blocked"; // hard gate: no approval, no publish
  if (circuitOpen("n8n")) return "offline";
  const p = it.payload as unknown as Post;
  try {
    const res = await withTimeout(fetch(N8N, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: it.id, approved: true, platforms: p.platforms, variants: p.variants, scheduleAt: p.at || null }),
    }), 8000);
    if (!res.ok) throw new Error(String(res.status));
    recordResult("n8n", true);
    await saveItem(uid, { ...it, status: "sent", payload: { ...it.payload, error: undefined } });
    return "sent";
  } catch {
    recordResult("n8n", false);
    await saveItem(uid, { ...it, payload: { ...it.payload, error: "n8n offline, will retry on next login" } });
    return "offline";
  }
}

export function SocialAgent({ onQueued }: { onQueued?: () => void }) {
  const [topic, setTopic] = useState("");
  const [v, setV] = useState<Record<string, string>>({});
  const [on, setOn] = useState<P[]>(["linkedin", "x"]);
  const [at, setAt] = useState("");
  const [src, setSrc] = useState<"ai" | "local">("local");
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState(false);
  const uid = useUid();
  const award = useAward("social");

  const draft = async () => {
    setBusy(true); setQueued(false);
    const r = await runAI("social", `Write one post about the topic below, adapted per platform (linkedin, x under 270 chars, instagram with 3 hashtags, facebook). Return JSON only: {"linkedin":"","x":"","instagram":"","facebook":""}. Topic: ${topic}`,
      () => JSON.stringify(socialVariants(topic)));
    try { setV(JSON.parse(r.text.slice(r.text.indexOf("{"), r.text.lastIndexOf("}") + 1))); } catch { setV(socialVariants(topic)); }
    setSrc(r.source); setBusy(false);
  };
  const queue = async () => {
    await saveItem(uid, { kind: "post", title: topic.slice(0, 60) || "Post", status: "pending", payload: { variants: v, platforms: on, at } });
    setQueued(true); onQueued?.(); award();
  };

  return (
    <div className="st-split">
      <div className="st-form">
        <Field label="Topic / what to say"><textarea rows={3} value={topic} onChange={(e) => setTopic(e.target.value)} /></Field>
        <div className="st-row">{PLATFORMS.map((p) => (
          <button key={p} className={`st-btn ${on.includes(p) ? "" : "ghost"}`} onClick={() => setOn(on.includes(p) ? on.filter((x) => x !== p) : [...on, p])}>{p}</button>
        ))}</div>
        <Field label="Schedule (optional)"><input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} /></Field>
        <button className="st-btn" onClick={draft} disabled={busy || !topic.trim()}>{busy ? "Drafting…" : "Draft for all platforms"}</button>
        <p className="st-note">Posts go to the Approval Queue first. Nothing is published until you approve it there.</p>
      </div>
      <div>
        {on.map((p) => v[p] !== undefined && (
          <Field key={p} label={`${p} (${src === "ai" ? "AI" : "template"})`}>
            <textarea rows={4} value={v[p]} onChange={(e) => setV({ ...v, [p]: e.target.value })} />
          </Field>
        ))}
        {Object.keys(v).length > 0 && <button className="st-btn" onClick={queue} disabled={queued}>{queued ? "Queued for approval" : "Send to approval queue"}</button>}
      </div>
    </div>
  );
}

export function ApprovalAgent() {
  const [posts, setPosts] = useState<Item[]>([]);
  const [msg, setMsg] = useState("");
  const uid = useUid();
  const award = useAward("approval");
  const load = useCallback(() => setPosts(listItems("post")), []);
  useEffect(() => { load(); }, [load]);

  const decide = async (it: Item, status: "approved" | "rejected") => {
    const saved = await saveItem(uid, { ...it, status });
    if (status === "approved") {
      const r = await dispatchPost(uid, saved);
      setMsg(r === "sent" ? "Approved and sent to n8n." : "Approved. n8n is not reachable on localhost yet, it will send on your next login.");
    }
    award(); load();
  };

  return (
    <div>
      {msg && <p className="st-note ok">{msg}</p>}
      {posts.length === 0 && <p className="st-note">Queue is empty. Draft something in Social Poster.</p>}
      {posts.map((p) => {
        const pl = p.payload as unknown as Post;
        return (
          <div key={p.id} className="glass-card st-post">
            <div className="st-out-bar"><b>{p.title}</b><span className={`st-chip ${p.status}`}>{p.status}</span></div>
            {pl.platforms?.map((pf) => <p key={pf}><small>{pf}</small><br />{pl.variants?.[pf]}</p>)}
            {pl.error && <p className="st-note err">{pl.error}</p>}
            {p.status === "pending" && (
              <div className="st-row">
                <button className="st-btn" onClick={() => decide(p, "approved")}>Approve and publish</button>
                <button className="st-btn ghost" onClick={() => decide(p, "rejected")}>Reject</button>
              </div>
            )}
            {p.status === "approved" && <button className="st-btn ghost" onClick={async () => { const r = await dispatchPost(uid, p); setMsg(r === "sent" ? "Sent." : "n8n still offline."); load(); }}>Retry send</button>}
          </div>
        );
      })}
    </div>
  );
}

/** On login, push anything already approved (and due) that never made it out. */
export async function flushApprovedOnLogin(uid: string | null) {
  const now = Date.now();
  for (const it of listItems("post")) {
    const at = (it.payload as unknown as Post).at;
    if (it.status === "approved" && (!at || new Date(at).getTime() <= now)) await dispatchPost(uid, it);
  }
}
