"use client";

import { useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { saveItem, listItems, type Item } from "@/lib/studio/data";
import { site } from "@/content/site";
import { useAuth } from "@/components/providers/AuthProvider";
import { Field, useAward } from "../ui";

// Bank-transfer paywall. Bank details are NOT in the repo: they live in the
// RLS-protected `studio_bank` table (readable only by signed-in users) and are
// set by the owner in Supabase. Payment gateways (Moyasar, Stripe, HyperPay)
// charge fees and need a merchant account, so a verified transfer is the
// zero-cost path; a gateway can replace `confirm()` later.
const OFFERS = [
  { id: "cv", name: "CV Standard", sar: 40 },
  { id: "sop", name: "SOP Standard", sar: 150 },
  { id: "outreach-50", name: "Outreach: 50 leads", sar: 160 },
  { id: "site", name: "Portfolio Website", sar: 2438 },
  { id: "content", name: "Content Production (4 pieces)", sar: 230 },
  { id: "growth", name: "Growth Retainer (month)", sar: 1500 },
];
interface Bank { holder: string; bank: string; iban: string; note?: string }

export default function PaywallAgent() {
  const { user } = useAuth();
  const [offer, setOffer] = useState(OFFERS[0]);
  const [bank, setBank] = useState<Bank | null>(null);
  const [bankErr, setBankErr] = useState(false);
  const [ref] = useState(() => "YAS-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [txn, setTxn] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState<Item[]>([]);
  const award = useAward("paywall");
  const isOwner = !!user?.email && user.email.toLowerCase() === site.email.toLowerCase();

  useEffect(() => {
    if (!supabaseConfigured || !user) return;
    Promise.resolve(getSupabase().from("studio_bank").select("holder,bank,iban,note").limit(1).maybeSingle())
      .then(({ data, error }) => { if (error || !data) setBankErr(true); else setBank(data as Bank); })
      .catch(() => setBankErr(true));
  }, [user]);

  const loadOwner = async () => {
    if (!isOwner) return;
    const { data } = await getSupabase().from("studio_items").select("*").eq("kind", "payment").eq("status", "pending");
    setPending((data as Item[]) || []);
  };
  useEffect(() => { loadOwner(); /* eslint-disable-next-line */ }, [isOwner]);

  const confirm = async () => {
    if (!txn.trim()) return;
    await saveItem(user?.id ?? null, { kind: "payment", title: `${offer.name} (${ref})`, status: "pending", payload: { offer, ref, txn: txn.trim(), amount: offer.sar, currency: "SAR", email: user?.email } });
    setDone(true);
    award();
  };

  const mark = async (it: Item, status: "paid" | "rejected") => {
    await getSupabase().from("studio_items").update({ status }).eq("id", it.id);
    loadOwner();
  };

  if (!user) return <p className="st-note">Sign in to see payment details and track your order.</p>;
  return (
    <div className="st-split">
      <div className="st-form">
        <Field label="Service">
          <select value={offer.id} onChange={(e) => setOffer(OFFERS.find((o) => o.id === e.target.value)!)}>
            {OFFERS.map((o) => <option key={o.id} value={o.id}>{o.name} — {o.sar} SAR</option>)}
          </select>
        </Field>
        <div className="glass-card st-pay">
          <div className="st-big">{offer.sar} SAR</div>
          <p>Reference (put this in the transfer note): <b>{ref}</b></p>
          {bank ? (
            <dl><dt>Account holder</dt><dd>{bank.holder}</dd><dt>Bank</dt><dd>{bank.bank}</dd><dt>IBAN</dt><dd className="mono">{bank.iban}</dd></dl>
          ) : (
            <p className="st-note">{bankErr ? "Bank details are not published yet. Message the owner on WhatsApp to receive them." : "Loading bank details…"}</p>
          )}
        </div>
        {done ? (
          <p className="st-note ok">Thanks. We will verify the transfer and confirm by email. Status: pending.</p>
        ) : (
          <>
            <Field label="Your bank transfer reference / receipt no."><input value={txn} onChange={(e) => setTxn(e.target.value)} /></Field>
            <button className="st-btn" onClick={confirm} disabled={!txn.trim()}>I have paid</button>
          </>
        )}
        <p className="st-note">We never see or store your card or bank login. You pay from your own banking app.</p>
      </div>
      <div>
        <h4 className="st-h">Your orders</h4>
        {listItems("payment").map((p) => <div key={p.id} className="glass-card st-li"><span>{p.title}</span><span className={`st-chip ${p.status}`}>{p.status}</span></div>)}
        {isOwner && (
          <>
            <h4 className="st-h">Owner: pending verification</h4>
            {pending.length === 0 && <p className="st-note">Nothing pending.</p>}
            {pending.map((p) => (
              <div key={p.id} className="glass-card st-li">
                <span>{p.title}<br /><small>txn {String((p.payload as { txn?: string }).txn)}</small></span>
                <span className="st-row"><button className="st-btn" onClick={() => mark(p, "paid")}>Paid</button><button className="st-btn ghost" onClick={() => mark(p, "rejected")}>Reject</button></span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
