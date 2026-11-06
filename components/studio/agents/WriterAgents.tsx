"use client";

import { useState } from "react";
import { runAI } from "@/lib/studio/ai";
import { handoffDoc, outreachSequence, sopDraft } from "@/lib/studio/local";
import { saveItem } from "@/lib/studio/data";
import { Field, Out, useAward, useUid } from "../ui";

type Kind = "sop" | "outreach" | "handoff";
type Form = Record<string, string>;

const FIELDS: Record<Kind, { key: string; label: string; area?: boolean; ph?: string }[]> = {
  sop: [
    { key: "name", label: "Your name" }, { key: "program", label: "Program", ph: "MSc Computer Science" },
    { key: "school", label: "University" }, { key: "why", label: "What pulled you into this field?", area: true },
    { key: "background", label: "Background (degree, roles)", area: true },
    { key: "achievements", label: "Top achievements with numbers", area: true },
    { key: "goals", label: "Short and long term goals", area: true },
  ],
  outreach: [
    { key: "sender", label: "Your name" }, { key: "target", label: "Recipient first name" },
    { key: "company", label: "Company" }, { key: "offer", label: "What you offer", ph: "UGC video for your product launch" },
    { key: "ask", label: "The ask", ph: "15-minute call this week?" },
  ],
  handoff: [
    { key: "title", label: "Project" }, { key: "audience", label: "Audience" },
    { key: "deliverables", label: "Deliverables (comma or line separated)", area: true },
    { key: "deadline", label: "Deadline" }, { key: "notes", label: "Notes", area: true },
  ],
};

const PROMPT: Record<Kind, (f: Form) => string> = {
  sop: (f) => `Write a 700-word Statement of Purpose in first person. Use ONLY the facts below, invent nothing, no cliches, one story thread, concrete evidence.\n${JSON.stringify(f, null, 1)}`,
  outreach: (f) => `Write a 4-email cold outreach sequence (day 0, 3, 7, 14). Short, specific, no hype, one clear ask each. Facts:\n${JSON.stringify(f, null, 1)}`,
  handoff: (f) => `Produce a developer-ready design handoff document in Markdown: deliverables checklist, specs, states, breakpoints, assets, acceptance criteria. Facts:\n${JSON.stringify(f, null, 1)}`,
};
const LOCAL: Record<Kind, (f: Form) => string> = {
  sop: (f) => sopDraft(f as never),
  outreach: (f) => outreachSequence(f as never),
  handoff: (f) => handoffDoc(f as never),
};

export default function WriterAgent({ kind }: { kind: Kind }) {
  const [f, setF] = useState<Form>({});
  const [res, setRes] = useState<{ text: string; source: "ai" | "local" } | null>(null);
  const [busy, setBusy] = useState(false);
  const uid = useUid();
  const award = useAward(kind);

  const go = async () => {
    setBusy(true);
    // Every field defaults to "" so untouched inputs never reach a generator as undefined.
    const full: Form = Object.fromEntries(FIELDS[kind].map((x) => [x.key, (f[x.key] || "").trim()]));
    try {
      const r = await runAI(kind, PROMPT[kind](full), () => LOCAL[kind](full));
      setRes(r);
      await saveItem(uid, { kind, title: full.program || full.company || full.title || kind, payload: { form: full, text: r.text } });
      award();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="st-split">
      <div className="st-form">
        {FIELDS[kind].map((x) => (
          <Field key={x.key} label={x.label}>
            {x.area
              ? <textarea rows={3} placeholder={x.ph} value={f[x.key] || ""} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} />
              : <input placeholder={x.ph} value={f[x.key] || ""} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} />}
          </Field>
        ))}
        <button className="st-btn" onClick={go} disabled={busy}>{busy ? "Working…" : "Generate"}</button>
        <p className="st-note">Facts stay yours: the generator never adds employers, numbers or dates you did not provide.</p>
      </div>
      <div>{res ? <Out text={res.text} source={res.source} /> : <p className="st-note">Fill the form and press Generate. Results are saved to your account.</p>}</div>
    </div>
  );
}
