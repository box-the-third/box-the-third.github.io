"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { sendFeedback } from "@/lib/studio/data";
import { store } from "@/lib/studio/resilience";
import { Field, useUid } from "./ui";
import { useAuth } from "@/components/providers/AuthProvider";

/* ───────── Revenue planner: honest math for a 10,000 SAR week ───────── */
const OFFERS = [
  { id: "cv", name: "CV Standard", sar: 40, rate: 0.12 },
  { id: "sop", name: "SOP Standard", sar: 150, rate: 0.06 },
  { id: "out", name: "Outreach 50 leads", sar: 160, rate: 0.04 },
  { id: "site", name: "Portfolio Website", sar: 320, rate: 0.03 },
  { id: "content", name: "Content Production", sar: 230, rate: 0.03 },
  { id: "retainer", name: "Growth Retainer", sar: 1500, rate: 0.01 },
];
export function RevenuePlanner() {
  const [target, setTarget] = useState(10000);
  const [qty, setQty] = useState<Record<string, number>>(() => store.read("yas_plan_v1", { cv: 40, sop: 10, out: 6, site: 3, retainer: 4 }));
  const set = (id: string, n: number) => { const q = { ...qty, [id]: Math.max(0, n) }; setQty(q); store.write("yas_plan_v1", q); };
  const sum = useMemo(() => OFFERS.reduce((s, o) => s + (qty[o.id] || 0) * o.sar, 0), [qty]);
  const leads = useMemo(() => Math.ceil(OFFERS.reduce((s, o) => s + (qty[o.id] || 0) / o.rate, 0)), [qty]);
  const gap = target - sum;
  const hi = [...OFFERS].sort((a, b) => b.sar - a.sar)[0];
  return (
    <div className="st-split">
      <div className="st-form">
        <Field label="Weekly target (SAR)"><input type="number" value={target} onChange={(e) => setTarget(+e.target.value)} /></Field>
        {OFFERS.map((o) => (
          <div key={o.id} className="st-line plan">
            <span>{o.name} <small>{o.sar} SAR</small></span>
            <input type="number" min={0} value={qty[o.id] || 0} onChange={(e) => set(o.id, +e.target.value)} />
          </div>
        ))}
      </div>
      <div>
        <div className="glass-card st-pay">
          <div className="st-big">{sum.toLocaleString()} SAR</div>
          <p>{gap <= 0 ? "Plan meets the target." : `Gap: ${gap.toLocaleString()} SAR. That is ${Math.ceil(gap / hi.sar)} more ${hi.name} sales.`}</p>
          <p>Leads needed at typical conversion: <b>~{leads.toLocaleString()}</b> ({Math.ceil(leads / 7)} per day).</p>
        </div>
        <h4 className="st-h">Zero-cost playbook</h4>
        <ol className="st-steps">
          <li>Day 1: publish offers + paywall; DM your warm network with the Outreach and Photo-card agents.</li>
          <li>Day 2-3: personalised founder and recruiter outreach, 30 a day, approval-queued posts on 2 platforms.</li>
          <li>Day 4-5: free CV or SOP review as a hook, upsell retainers and the website package.</li>
          <li>Day 6-7: follow-up sequence, scarcity close, invoice and collect via bank transfer.</li>
        </ol>
        <p className="st-note">This is a planning tool, not a guarantee. 10,000 SAR in a week depends on your audience and close rate; the retainer and website lines carry most of the value, so focus outreach there.</p>
      </div>
    </div>
  );
}

/* ───────── Feedback loop ───────── */
export function FeedbackBox({ agent }: { agent: string }) {
  const [r, setR] = useState(0);
  const [c, setC] = useState("");
  const [sent, setSent] = useState(false);
  const uid = useUid();
  useEffect(() => { setR(0); setC(""); setSent(false); }, [agent]);
  if (sent) return <p className="st-note ok">Thanks. Your feedback shapes the next update.</p>;
  return (
    <div className="st-feedback glass-card">
      <b>How was this agent?</b>
      <div className="st-row">{[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={`${n} stars`} className={`st-star ${n <= r ? "on" : ""}`} onClick={() => setR(n)}>★</button>)}</div>
      <input placeholder="What would make it better? (optional)" value={c} onChange={(e) => setC(e.target.value)} />
      <button className="st-btn ghost" disabled={!r} onClick={async () => { await sendFeedback(uid, agent, r, c); setSent(true); }}>Send</button>
    </div>
  );
}

/* ───────── Privacy: GDPR / CCPA controls ───────── */
export function PrivacyPanel() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const exportData = async () => {
    const local: Record<string, unknown> = {};
    try { Object.keys(localStorage).filter((k) => k.startsWith("yas_")).forEach((k) => (local[k] = JSON.parse(localStorage.getItem(k) || "null"))); } catch { /* ignore */ }
    let server: unknown = null;
    if (user) { const { data } = await getSupabase().rpc("studio_export_my_data"); server = data; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ local, server }, null, 2)], { type: "application/json" }));
    a.download = "my-data.json"; a.click();
  };
  const erase = async () => {
    if (!confirm("Delete all your studio data from this device and the server? This cannot be undone.")) return;
    try { Object.keys(localStorage).filter((k) => k.startsWith("yas_")).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
    if (user) { const { error } = await getSupabase().rpc("studio_delete_my_data"); if (error) return setMsg("Server delete failed. Try again, or email us to erase your account."); }
    setMsg("Your studio data has been deleted.");
  };
  return (
    <div className="glass-card st-privacy">
      <h4 className="st-h">Your data</h4>
      <p className="st-note">We store only what the agents create, in your own account, protected by row-level security. Photos used in cards never leave your browser. AI text is sent to our server function only when you press Generate, and is not used for training. You can export or erase everything at any time (GDPR Art. 15/17/20, CCPA).</p>
      <div className="st-row"><button className="st-btn ghost" onClick={exportData}>Export my data</button><button className="st-btn ghost danger" onClick={erase}>Delete my data</button></div>
      {msg && <p className="st-note ok">{msg}</p>}
    </div>
  );
}
