import type { Metadata } from "next";
import { TutorialPanel } from "@/components/studio/Tutorial";
import "@/app/dashboard/glass.css";
import "@/components/studio/studio.css";

export const metadata: Metadata = {
  title: "Automation — Social Autopilot",
  description:
    "A build tutorial: a self-hosted n8n automation that writes, human-approves and posts to LinkedIn, Instagram, Facebook, Telegram and email, once a day.",
};

export default function AutomationCourse() {
  return (
    <div className="glass-dash studio" style={{ paddingTop: 96 }}>
      <div className="glass-scene">
        <i className="glass-orb o1" />
        <i className="glass-orb o2" />
        <i className="glass-orb o3" />
        <i className="glass-veil" />
      </div>
      <div className="st-wrap">
        <header className="st-head">
          <div>
            <p className="st-eyebrow">Course · Automation</p>
            <h1>Social Autopilot</h1>
            <p className="st-sub">
              Build a self-hosted automation that writes, reviews and posts to five channels every
              day — with a human approving every post before it goes live. The real build, including
              the dead ends.
            </p>
          </div>
          <a className="st-btn ghost" href="/courses/" style={{ alignSelf: "center" }}>
            ← All courses
          </a>
        </header>

        <section className="glass-card st-panel">
          <TutorialPanel />
        </section>
      </div>
    </div>
  );
}
