"use client";

import { useMemo, useState } from "react";
import { store } from "@/lib/studio/resilience";

/* ─────────────────────────────────────────────────────────────
   Social Autopilot Playbook — a build tutorial for an n8n
   social-media automation that writes, reviews (human approval)
   and posts to LinkedIn, Instagram, Facebook, Telegram + email.
   ───────────────────────────────────────────────────────────── */

const FLOW = [
  ["Trigger", "Daily schedule"],
  ["Source", "Read sheet"],
  ["Prepare", "Pick row · caption"],
  ["Human", "Approve by email"],
  ["Publish", "LinkedIn · IG · FB · Telegram"],
  ["Record", "Mark posted"],
];

type Item = { id: string; title: string; note: string };
const PREREQS: { group: string; items: Item[] }[] = [
  {
    group: "Accounts",
    items: [
      { id: "linkedin", title: "LinkedIn", note: "Admin of the company Page if posting as the brand" },
      { id: "meta", title: "Meta Developer account", note: "One app serves Instagram and Facebook" },
      { id: "fbig", title: "Facebook Page + IG Business", note: "Instagram account linked to the Page — required for IG" },
      { id: "telegram", title: "Telegram bot + channel", note: "Token from BotFather; bot added as channel admin" },
      { id: "google", title: "Google account", note: "For Gmail + Sheets — personal, not a managed Workspace" },
      { id: "cloudinary", title: "Cloudinary account", note: "Free image hosting with clean URLs" },
    ],
  },
  {
    group: "Tools to install",
    items: [
      { id: "node", title: "Node.js + npm", note: "The LTS build from nodejs.org" },
      { id: "n8n", title: "n8n", note: "Installed globally via npm" },
      { id: "cloudflared", title: "cloudflared", note: "For approving from a phone (the tunnel)" },
      { id: "machine", title: "A machine that stays on", note: "A laptop is fine for building" },
    ],
  },
  {
    group: "Assets to prepare",
    items: [
      { id: "posts", title: "Your posts, written out", note: "Caption in each language you'll publish" },
      { id: "images", title: "Images, two sizes", note: "1:1 and 4:5, hosted as public JPG/PNG URLs" },
      { id: "biz", title: "Business details", note: "Legal name, website, Privacy + ToS URLs — for LinkedIn / Meta app reviews" },
    ],
  },
];
const ALL_IDS = PREREQS.flatMap((g) => g.items.map((i) => i.id));

const PHASES: { n: string; title: string; body: string }[] = [
  { n: "1", title: "Decide the plan", body: "Pick your channels, where the content comes from (a spreadsheet of ready posts), where images are hosted, and that a human approves before posting." },
  { n: "2", title: "Stand up n8n", body: "Install the automation tool on a machine and get it running. It only works while it's on — keep that in mind for later." },
  { n: "3", title: "Connect the accounts", body: "Give n8n permission to post to each platform. The longest phase — every platform has its own login dance and its own traps." },
  { n: "4", title: "Build the content source", body: "A Google Sheet, one row per post, holding the caption, the image links, and a status column the workflow writes back to." },
  { n: "5", title: "Build the posting line", body: "Wire the nodes: read the next post, format it per platform, push it to each channel, then stamp the row as posted." },
  { n: "6", title: "Add the approval gate", body: "Insert a human checkpoint — an email with Approve / Decline — so nothing publishes without a person saying yes." },
  { n: "7", title: "Go live", body: "Fill in your posts, switch the schedule on, and — for a real client — move it off your laptop to an always-on server." },
];

type Note = { title: string; body: string };
type Step = { h: string; body: string };
type Section = { id: string; title: string; intro?: string; steps?: Step[]; bullets?: string[]; code?: string; notes?: Note[] };

const SECTIONS: Section[] = [
  {
    id: "A",
    title: "Install n8n",
    intro: "n8n is the engine — a visual tool where each box (“node”) does one thing and arrows pass data along.",
    steps: [
      { h: "Install Node.js", body: "n8n runs on it. Grab the LTS build from nodejs.org." },
      { h: "Install n8n globally", body: "One command in your terminal." },
      { h: "Start it and open the editor", body: "It serves at localhost:5678 in your browser." },
    ],
    code: "# install, then run\nnpm install -g n8n\nn8n start   # open http://localhost:5678",
    notes: [
      { title: "It only runs while it runs", body: "n8n lives on your machine. Close the terminal or sleep the PC and the automation stops — no posts, no approvals. Fine for building; for a client it belongs on an always-on server. Keep n8n current, too: an out-of-date install asks LinkedIn for a permission LinkedIn deleted in 2023 and the login just fails with unauthorized_scope — update n8n first." },
    ],
  },
  {
    id: "B",
    title: "Connect the accounts",
    intro: "Each platform needs a credential inside n8n. Here's the path — and the trap — for each.",
    bullets: [
      "LinkedIn — create an OAuth app, add “Sign In with OpenID Connect” + “Share on LinkedIn”, then connect it in n8n. Posting as yourself is quick; posting as a company Page needs the Community Management API on a separate app and a review against a registered business.",
      "Instagram + Facebook — one Meta app covers both. Generate a permanent Page token (short-lived → long-lived → Page token), not the 1-hour one the explorer hands you.",
      "Telegram — get a bot token from BotFather. Use the plain Telegram (send) node, not the Telegram Trigger (which only receives). Add the bot as an admin of your channel.",
      "Gmail — OAuth2. Publish the consent screen to “In production” so the login doesn't expire every 7 days.",
      "Google Sheets — use a Service Account, not OAuth. Share the sheet with the service account's email.",
    ],
    notes: [
      { title: "Instagram's hidden requirement", body: "There is no API way to auto-post to Instagram without a Facebook Page behind it. The IG account must be Business/Creator and linked to a Facebook Page, and all posting runs through the Facebook Graph API. Even if you never touch Facebook, the Page has to exist." },
      { title: "Sheets wants a Service Account", body: "Normal OAuth hits Google Drive's “restricted scope” and an unverified app is blocked with a restricted error. A Service Account sidesteps the whole verification dance: create one, download its JSON key, copy client_email and private_key into n8n, and share your sheet with that email as an Editor." },
    ],
  },
  {
    id: "C",
    title: "Host the images",
    intro: "Every platform fetches the image from a public URL. Instagram, in particular, fetches it from Meta's servers — so it has to be a real, reachable link.",
    bullets: [
      "We use Cloudinary (free): upload each finished creative, get a clean .jpg / .png URL.",
      "Design two sizes: a 1:1 square for LinkedIn, a 4:5 portrait for Instagram / Facebook / Telegram. Canva Pro's “Resize” makes both from one design.",
    ],
    code: "https://res.cloudinary.com/<you>/image/upload/f_jpg,q_auto/v.../image.png",
    notes: [
      { title: "Format matters", body: "WebP breaks posting — LinkedIn and Telegram reject it, so export JPG or PNG. Instagram wants JPEG specifically; a PNG often fails at the /media step. If it does, let Cloudinary convert on the fly with the f_jpg flag shown above." },
    ],
  },
  {
    id: "D",
    title: "Build the content source",
    intro: "A single Google Sheet tab, headers in row 1 (no title rows above them, or n8n can't read it). One row per post.",
    bullets: [
      "Columns: Post_ID, Audience, Caption_EN, Caption_AR, Image_URL_EN, Image_URL_AR, Status.",
      "Status starts blank; the workflow writes posted into it at the end so the post is never repeated.",
      "A row is only picked up once it has both images filled in — half-ready rows are skipped automatically.",
    ],
  },
  {
    id: "E",
    title: "Build the posting line",
    intro: "The nodes, left to right. Each posting node reads from the “Prepare Post” node, so language and image stay matched to the platform.",
    steps: [
      { h: "Schedule Trigger", body: "Fires once a day at a set hour." },
      { h: "Google Sheets → Get rows", body: "Pulls every row from the sheet." },
      { h: "Code → “Prepare Post”", body: "Picks the next unposted row that has images, and builds the English and Arabic captions." },
      { h: "Download Image → Post to LinkedIn", body: "LinkedIn needs the file uploaded, so the English image is downloaded first, then attached. Caption: English." },
      { h: "IG: Create Media → IG: Publish Media", body: "Instagram is two steps — stage the image by URL, then publish. Image: Arabic (as JPEG). Caption: Arabic." },
      { h: "Post to Facebook · Send to Telegram", body: "Arabic image + Arabic caption to both." },
      { h: "Google Sheets → Update row", body: "Matches on Post_ID and sets Status = posted." },
    ],
    notes: [
      { title: "Match the caption to the image", body: "Send the English caption to the English (LinkedIn) image and the Arabic caption to the Arabic (IG/FB/Telegram) image — keep them as separate fields out of “Prepare Post” so each platform gets exactly one language." },
      { title: "“No path back to node”", body: "If you disconnect a node that others reference by name, their expressions break with No path back to node. When you retire a setup/config node, either keep it in the chain or hardcode the fixed values (like account IDs) into the nodes that used it." },
    ],
  },
  {
    id: "F",
    title: "Add the approval gate",
    intro: "Drop this between “Prepare Post” and the posting nodes, so a person decides before anything publishes.",
    steps: [
      { h: "Gmail → “Send and Wait for Response”", body: "Emails you the draft (caption + image links) with Approve / Decline buttons and pauses the whole workflow." },
      { h: "IF → approved", body: "Only the “true” branch continues into the posting nodes. Decline ends the run." },
    ],
    code: "cloudflared tunnel --url http://localhost:5678\n# then, before starting n8n:\n$env:WEBHOOK_URL=\"https://your-sub.trycloudflare.com/\"",
    notes: [
      { title: "The approve button points at localhost", body: "By default the Approve link is localhost — it only works in a browser on the n8n machine. To approve from a phone, expose n8n with a free Cloudflare Tunnel and set n8n's WEBHOOK_URL to the tunnel address. The free “quick tunnel” URL changes every restart, so you reset WEBHOOK_URL each time — a reason to script startup, or move to a server with a fixed address." },
    ],
  },
  {
    id: "G",
    title: "Go live",
    bullets: [
      "Fill in real posts and images in the sheet, then flip the workflow to Active so the schedule runs on its own.",
      "For production, move n8n to a small always-on server (a ~$5/month VPS or n8n Cloud). Your workflow exports and imports as one file — a laptop that's asleep at 9am is a missed post.",
    ],
  },
];

const LESSONS = [
  "Instagram needs a Facebook Page. No API path around it — Business account linked to a Page, posting through the Graph API.",
  "Use a Service Account for Google Sheets. Normal OAuth is blocked by Drive's restricted scope; a service account isn't.",
  "WebP breaks posting; Instagram wants JPEG. Export JPG/PNG, and convert to JPEG for IG with Cloudinary's f_jpg.",
  "Old n8n breaks LinkedIn login. It requests a scope LinkedIn retired. Update n8n and the error disappears.",
  "Get a permanent Meta token. The explorer's token dies in an hour. Exchange it up to a non-expiring Page token.",
  "Telegram: channel ID ≠ bot username. Post to the channel's @handle or -100… ID, with the bot added as an admin.",
  "Approval links need a tunnel. localhost only works on the n8n machine; Cloudflare Tunnel + WEBHOOK_URL makes it reachable from a phone.",
  "Model IDs expire. If you generate captions with an AI provider, hosted model names get deprecated — check the live list when a call 404s.",
  "Company-page posting is gated. LinkedIn, Meta, and TikTok all review your app before public auto-posting — start those applications early.",
];

const KEY = "yas_tut_social_v1";

export function TutorialPanel() {
  const [done, setDone] = useState<Record<string, boolean>>(() => store.read(KEY, {} as Record<string, boolean>));
  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    store.write(KEY, next);
  };
  const completed = useMemo(() => ALL_IDS.filter((id) => done[id]).length, [done]);
  const pct = Math.round((completed / ALL_IDS.length) * 100);

  return (
    <div className="st-tut">
      <p className="st-note">
        A self-hosted automation that writes, reviews and posts to LinkedIn, Instagram, Facebook,
        Telegram and email — once a day, with a human approving every post before it goes live.
      </p>
      <div className="st-tut-stack">
        {["n8n (self-hosted)", "Google Sheets", "Cloudinary", "Email approval", "5 destinations"].map((t) => (
          <span key={t} className="st-chip">{t}</span>
        ))}
      </div>

      {/* The pipeline */}
      <h3 className="st-h">One run · one approval · five places</h3>
      <div className="st-tut-flow">
        {FLOW.map(([k, v], i) => (
          <div className="st-tut-step" key={k}>
            <div className="glass-card st-tut-node">
              <b>{k}</b>
              <small>{v}</small>
            </div>
            {i < FLOW.length - 1 && <span className="st-tut-arrow" aria-hidden>→</span>}
          </div>
        ))}
      </div>

      {/* Prerequisites — interactive, saved on this device */}
      <h3 className="st-h">Prerequisites · {completed}/{ALL_IDS.length} ready</h3>
      <p className="st-note">Gather these before touching n8n — chasing them mid-build is where momentum dies. Ticks are saved in this browser.</p>
      <div className="st-tut-bar" aria-hidden><i style={{ width: `${pct}%` }} /></div>
      <div className="st-tut-grid">
        {PREREQS.map((g) => (
          <div className="glass-card st-tut-card" key={g.group}>
            <div className="st-h" style={{ margin: "0 0 10px" }}>{g.group}</div>
            {g.items.map((it) => (
              <label key={it.id} className={`st-check ${done[it.id] ? "on" : ""}`}>
                <input type="checkbox" checked={!!done[it.id]} onChange={() => toggle(it.id)} />
                <span className="st-check-box" aria-hidden>{done[it.id] ? "✓" : ""}</span>
                <span className="st-check-text"><b>{it.title}</b><small>{it.note}</small></span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <p className="st-note">
        Tip: use a personal Gmail for the Google parts. A managed Workspace account can be blocked by its admin,
        and you'll lose an afternoon to a “restricted” error that has nothing to do with your setup.
      </p>

      {/* Part 1 — the shape of the project */}
      <h3 className="st-h">Part 1 · The shape of the project</h3>
      <p className="st-note">Before any node or token, this is the whole arc. Do the phases in order — each depends on the last.</p>
      <div className="st-tut-grid">
        {PHASES.map((p) => (
          <div className="glass-card st-tut-card" key={p.n}>
            <div className="st-tut-phase"><span>{p.n}</span><b>{p.title}</b></div>
            <p className="st-note">{p.body}</p>
          </div>
        ))}
      </div>

      {/* Part 2 — the real build, node by node */}
      <h3 className="st-h">Part 2 · Building it, node by node</h3>
      <p className="st-note">The real build, including the dead ends. The Field Notes are the things that cost an hour each — read them before you hit them.</p>
      <div className="st-tut-sections">
        {SECTIONS.map((s) => (
          <section className="glass-card st-tut-sec" key={s.id}>
            <div className="st-tut-sec-head"><span className="st-tut-az">{s.id}</span><h4>{s.title}</h4></div>
            {s.intro && <p className="st-note">{s.intro}</p>}
            {s.steps && (
              <ol className="st-steps">
                {s.steps.map((st) => (
                  <li key={st.h}><b>{st.h}.</b> {st.body}</li>
                ))}
              </ol>
            )}
            {s.bullets && (
              <ul className="st-tut-bullets">
                {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
            {s.code && <pre className="st-tut-code">{s.code}</pre>}
            {s.notes?.map((n) => (
              <div className="st-tut-note" key={n.title}>
                <b>⚑ Field note — {n.title}</b>
                <p>{n.body}</p>
              </div>
            ))}
          </section>
        ))}
      </div>

      {/* Hard-won lessons */}
      <h3 className="st-h">★ The nine things that cost real time</h3>
      <ol className="st-tut-lessons">
        {LESSONS.map((l, i) => {
          const [lead, ...rest] = l.split(". ");
          return (
            <li key={i}>
              <span className="st-tut-num">{String(i + 1).padStart(2, "0")}</span>
              <span><b>{lead}.</b> {rest.join(". ")}</span>
            </li>
          );
        })}
      </ol>

      <p className="st-note" style={{ marginTop: 18 }}>
        Stack: n8n · Google Sheets · Cloudinary · Gmail · Cloudflare Tunnel · LinkedIn / Meta / Telegram APIs.
      </p>
    </div>
  );
}
