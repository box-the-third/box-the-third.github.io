export type AgentId =
  | "cv" | "sop" | "outreach" | "handoff" | "invoice"
  | "paywall" | "meeting" | "social" | "approval" | "cards";

export interface AgentMeta {
  id: AgentId;
  name: string;
  tagline: string;
  /** feather-style 24x24 stroke paths */
  icon: string;
  tone: "teal" | "amber" | "violet" | "emerald";
  xp: number; // XP for first successful run
  price?: string; // service this agent sells as (revenue planner)
}

export const AGENTS: AgentMeta[] = [
  { id: "cv", name: "CV Agent", tagline: "Tailor a CV to any job ad. ATS-clean, print to PDF.", tone: "teal", xp: 40, price: "CV Standard",
    icon: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h6" },
  { id: "sop", name: "SOP Agent", tagline: "Statement of Purpose scaffold from your story.", tone: "violet", xp: 40, price: "SOP Standard",
    icon: "M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" },
  { id: "outreach", name: "Outreach Agent", tagline: "Cold emails and a 4-touch follow-up sequence.", tone: "amber", xp: 30, price: "Outreach Startup",
    icon: "M4 4h16v16H4z M4 6l8 7 8-7" },
  { id: "handoff", name: "Design Handoff", tagline: "Turn a request into a spec, checklist and handoff doc.", tone: "emerald", xp: 30,
    icon: "M12 2l9 5-9 5-9-5z M3 12l9 5 9-5 M3 17l9 5 9-5" },
  { id: "invoice", name: "Invoice Agent", tagline: "VAT invoices with ZATCA-style QR (TLV). Print or save.", tone: "teal", xp: 50,
    icon: "M6 2h12v20l-3-2-3 2-3-2-3 2z M9 7h6 M9 11h6 M9 15h4" },
  { id: "paywall", name: "Paywall", tagline: "Bank-transfer checkout with reference codes and verification.", tone: "amber", xp: 60,
    icon: "M3 10l9-6 9 6 M5 10v8 M9 10v8 M15 10v8 M19 10v8 M3 21h18" },
  { id: "meeting", name: "Scheduler", tagline: "Share availability, get bookings, export to calendar.", tone: "violet", xp: 30,
    icon: "M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4" },
  { id: "social", name: "Social Poster", tagline: "Write once, queue for every platform via n8n.", tone: "emerald", xp: 40,
    icon: "M22 2L11 13 M22 2l-7 20-4-9-9-4z" },
  { id: "approval", name: "Approval Queue", tagline: "Nothing posts until you approve it. Human in the loop.", tone: "teal", xp: 20,
    icon: "M9 12l2 2 4-4 M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" },
  { id: "cards", name: "Photo Cards", tagline: "Scenario cards for recruiters and founders. Download PNG.", tone: "amber", xp: 40,
    icon: "M3 5h18v14H3z M3 15l5-5 4 4 3-3 6 6 M16 9h.01" },
];

export const agentById = (id: string) => AGENTS.find((a) => a.id === id);
