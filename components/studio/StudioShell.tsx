"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { AGENTS, type AgentId } from "@/lib/studio/agents";
import { BADGES, getGame, levelOf, nextLevelXp, type GameState } from "@/lib/studio/game";
import { healthCheck, outboxSize } from "@/lib/studio/resilience";
import { pullItems, syncOutbox } from "@/lib/studio/data";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase";
import { Icon } from "./ui";
import { FeedbackBox, PrivacyPanel, RevenuePlanner } from "./Panels";
import { flushApprovedOnLogin } from "./agents/SocialAgents";
import "@/app/dashboard/glass.css";
import "./studio.css";

const Cv = dynamic(() => import("./agents/CvAgent"), { ssr: false });
const Writer = dynamic(() => import("./agents/WriterAgents"), { ssr: false });
const Invoice = dynamic(() => import("./agents/InvoiceAgent"), { ssr: false });
const Paywall = dynamic(() => import("./agents/PaywallAgent"), { ssr: false });
const Meeting = dynamic(() => import("./agents/MeetingAgent"), { ssr: false });
const Cards = dynamic(() => import("./agents/CardsAgent"), { ssr: false });
const Social = dynamic(() => import("./agents/SocialAgents").then((m) => m.SocialAgent), { ssr: false });
const Approval = dynamic(() => import("./agents/SocialAgents").then((m) => m.ApprovalAgent), { ssr: false });

type View = AgentId | "plan" | "privacy";

function Body({ view }: { view: View }) {
  switch (view) {
    case "cv": return <Cv />;
    case "sop": return <Writer kind="sop" />;
    case "outreach": return <Writer kind="outreach" />;
    case "handoff": return <Writer kind="handoff" />;
    case "invoice": return <Invoice />;
    case "paywall": return <Paywall />;
    case "meeting": return <Meeting />;
    case "social": return <Social />;
    case "approval": return <Approval />;
    case "cards": return <Cards />;
    case "plan": return <RevenuePlanner />;
    default: return <PrivacyPanel />;
  }
}

export default function StudioShell() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>("cv");
  const [game, setGame] = useState<GameState>(getGame());
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);

  // deep-link via #agent
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1) as View;
      if ([...AGENTS.map((a) => a.id), "plan", "privacy"].includes(h)) setView(h);
    };
    read();
    setGame(getGame());
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const go = (v: View) => { setView(v); history.replaceState(null, "", `#${v}`); };

  // XP toasts
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail as { state: GameState; gained: number; newBadges: string[] };
      setGame(d.state);
      setToast(`+${d.gained} XP${d.newBadges.length ? ` · Badge: ${d.newBadges.map((b) => BADGES[b].label).join(", ")}` : ""}`);
      setTimeout(() => setToast(""), 3200);
    };
    window.addEventListener("studio:xp", on);
    return () => window.removeEventListener("studio:xp", on);
  }, []);

  // Health + outbox sync + (on login) pull, then dispatch approved posts to n8n.
  const sync = useCallback(async () => {
    setOnline(supabaseConfigured ? await healthCheck(supabaseUrl, supabaseAnonKey) : false);
    if (user) { await syncOutbox(); await pullItems(user.id); }
    setQueued(outboxSize());
  }, [user]);
  useEffect(() => {
    sync();
    const t = setInterval(sync, 30000);
    window.addEventListener("online", sync);
    return () => { clearInterval(t); window.removeEventListener("online", sync); };
  }, [sync]);
  useEffect(() => { if (user) flushApprovedOnLogin(user.id); }, [user]);

  const lvl = levelOf(game.xp), nxt = nextLevelXp(game.xp);
  const cur = AGENTS.find((a) => a.id === view);

  return (
    <div className="glass-dash studio">
      <div className="glass-scene"><i className="glass-orb o1" /><i className="glass-orb o2" /><i className="glass-orb o3" /><i className="glass-veil" /></div>
      <div className="st-wrap">
        <header className="st-head">
          <div>
            <p className="st-eyebrow">Agent Studio</p>
            <h1>Ten agents. One workspace.</h1>
            <p className="st-sub">{loading ? "…" : user ? "Everything you make syncs to your account." : "Guest mode: work is saved on this device. Sign in to sync across devices."}</p>
          </div>
          <div className="glass-card st-xp" aria-label="progress">
            <div className="st-row"><b>Level {lvl}</b><span>{game.xp} XP</span><span>streak {game.streak}d</span></div>
            <div className="st-bar"><i style={{ width: `${Math.min(100, (game.xp / nxt) * 100)}%` }} /></div>
            <div className="st-badges">{game.badges.map((b) => <span key={b} className="st-chip">{BADGES[b].label}</span>)}</div>
          </div>
        </header>

        {(!online || queued > 0) && (
          <div className="st-banner" role="status">
            {!online ? "Cloud sync is unreachable. You can keep working: everything saves on this device and uploads automatically when the connection returns." : ""}
            {queued > 0 ? ` ${queued} item(s) waiting to sync.` : ""}
          </div>
        )}

        <nav className="st-grid" aria-label="Agents">
          {AGENTS.map((a) => (
            <button key={a.id} className={`glass-card st-agent tone-${a.tone} ${view === a.id ? "on" : ""}`} onClick={() => go(a.id)} aria-pressed={view === a.id}>
              <span className="st-ico"><Icon d={a.icon} /></span>
              <b>{a.name}</b>
              <small>{a.tagline}</small>
              {game.runs[a.id] ? <em>{game.runs[a.id]}× used</em> : <em>+{a.xp} XP first run</em>}
            </button>
          ))}
        </nav>
        <div className="st-tabs">
          <button className={`st-btn ${view === "plan" ? "" : "ghost"}`} onClick={() => go("plan")}>Revenue planner</button>
          <button className={`st-btn ${view === "privacy" ? "" : "ghost"}`} onClick={() => go("privacy")}>Privacy and data</button>
        </div>

        <motion.section key={view} className="glass-card st-panel" initial={{ opacity: 0.4, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          <h2>{cur?.name ?? (view === "plan" ? "Revenue planner" : "Privacy and data")}</h2>
          <Body view={view} />
          {cur && <FeedbackBox agent={cur.id} />}
        </motion.section>
      </div>
      <div className={`st-toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </div>
  );
}
