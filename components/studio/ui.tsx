"use client";

import { useState, type ReactNode } from "react";
import { AGENTS, type AgentMeta } from "@/lib/studio/agents";
import { award } from "@/lib/studio/game";
import { useAuth } from "@/components/providers/AuthProvider";

export function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {d.split(" M").map((p, i) => <path key={i} d={(i ? "M" : "") + p} />)}
    </svg>
  );
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="st-field"><span>{label}</span>{children}</label>
);

export function Out({ text, source, onCopy }: { text: string; source?: "ai" | "local"; onCopy?: () => void }) {
  const [ok, setOk] = useState(false);
  if (!text) return null;
  return (
    <div className="st-out glass-card">
      <div className="st-out-bar">
        <span className="st-chip">{source === "ai" ? "AI generated" : "Built-in template"}</span>
        <button className="st-btn ghost" onClick={() => { navigator.clipboard?.writeText(text).then(() => { setOk(true); onCopy?.(); setTimeout(() => setOk(false), 1500); }); }}>
          {ok ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>{text}</pre>
    </div>
  );
}

/** Award XP once an agent produces something; surfaces a toast. */
export function useAward(agent: AgentMeta["id"]) {
  const meta = AGENTS.find((a) => a.id === agent)!;
  return () => {
    const r = award(agent, meta.xp);
    window.dispatchEvent(new CustomEvent("studio:xp", { detail: r }));
  };
}

export function useUid() {
  const { user } = useAuth();
  return user?.id ?? null;
}
