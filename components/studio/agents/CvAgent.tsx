"use client";

import { useEffect, useState } from "react";
import { runAI, parseJson } from "@/lib/studio/ai";
import { missingKeywords, tailorBullets } from "@/lib/studio/local";
import { saveItem } from "@/lib/studio/data";
import { store } from "@/lib/studio/resilience";
import { Field, Out, useAward, useUid } from "../ui";

// White-labelled port of the standalone CV maker: same data model, same
// sidebar/main layout and the same truthful-tailoring prompts.
interface Job { dates: string; title: string; org: string; bullets: string[] }
interface CV {
  name: string; role: string; contact: string[]; summary: string; skills: string; tools: string;
  jobs: Job[]; education: { year: string; degree: string; school: string }[]; interests: string;
  theme: { side: string; head: string; accent: string }; flip: boolean;
}
const BLANK: CV = {
  name: "YOUR NAME", role: "Job title  •  Field",
  contact: ["City, Country", "email@example.com", "linkedin.com/in/username"],
  summary: "Two or three lines on what you do, how long you have done it, and the result you are known for.",
  skills: "Skill, skill, skill.", tools: "Tool, tool, tool.",
  jobs: [{ dates: "Month Year – Present", title: "Job title", org: "Company, Country", bullets: ["What you did and what it produced."] }],
  education: [{ year: "Year", degree: "Degree", school: "Institution, Country" }],
  interests: "Interest  •  Interest",
  theme: { side: "#3E5060", head: "#33434F", accent: "#33434F" }, flip: false,
};
const THEMES = [
  { n: "Slate", side: "#3E5060", head: "#33434F", accent: "#33434F" },
  { n: "Teal", side: "#0F5D63", head: "#0B454A", accent: "#0B454A" },
  { n: "Plum", side: "#4B3A66", head: "#392B4F", accent: "#392B4F" },
  { n: "Ink", side: "#2A2F36", head: "#1B1F24", accent: "#1B1F24" },
];
const KEY = "yas_cv_v1";

export default function CvAgent() {
  const [cv, setCv] = useState<CV>(BLANK);
  const [jd, setJd] = useState("");
  const [report, setReport] = useState<{ text: string; source: "ai" | "local" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const uid = useUid();
  const award = useAward("cv");

  useEffect(() => { setCv(store.read<CV>(KEY, BLANK)); }, []);
  const upd = (p: Partial<CV>) => { const n = { ...cv, ...p }; setCv(n); store.write(KEY, n); };
  const setJob = (i: number, p: Partial<Job>) => upd({ jobs: cv.jobs.map((j, k) => (k === i ? { ...j, ...p } : j)) });

  const digest = () => JSON.stringify({ role: cv.role, summary: cv.summary, skills: cv.skills, jobs: cv.jobs.map((j) => ({ title: j.title, org: j.org, dates: j.dates, bullets: j.bullets })) }, null, 1);

  const tailor = async () => {
    if (!jd.trim()) return setMsg("Paste the job ad first.");
    setBusy(true); setMsg("");
    const prompt = `You are editing a CV. Keep every claim truthful: reuse only facts already present, never invent metrics, employers or dates.
Rewrite the profile summary and the bullets so they answer this job ad, leading with the most relevant evidence and mirroring the ad's vocabulary where it is honest to do so.

JOB AD:
${jd}

CURRENT CV (JSON):
${digest()}

Reply with JSON only, no prose, no code fences:
{"summary":"...","jobs":[{"index":0,"bullets":["...","..."]}]}
Keep the same number of bullets per job. Keep each bullet under 32 words.`;
    const local = () => JSON.stringify({ summary: cv.summary, jobs: cv.jobs.map((j, index) => ({ index, bullets: tailorBullets(j.bullets, jd) })) });
    const r = await runAI("cv", prompt, local);
    const data = parseJson<{ summary?: string; jobs?: { index: number; bullets: string[] }[] }>(r.text);
    if (!data) { setBusy(false); return setMsg("Could not read the reply. Try again."); }
    const jobs = cv.jobs.map((j, i) => {
      const m = data.jobs?.find((x) => x.index === i);
      return m?.bullets?.length ? { ...j, bullets: m.bullets.map(String) } : j;
    });
    upd({ summary: typeof data.summary === "string" ? data.summary : cv.summary, jobs });
    const miss = missingKeywords(`${cv.summary} ${cv.skills} ${cv.tools} ${cv.jobs.map((j) => j.bullets.join(" ")).join(" ")}`, jd);
    setReport({ source: r.source, text: miss.length ? `Applied (${r.source === "ai" ? "AI rewrite" : "re-ordered by relevance"}).\nJob-ad terms your CV never mentions: ${miss.join(", ")}.\nAdd them only where they are true.` : "Applied. Strong keyword coverage." });
    await saveItem(uid, { kind: "cv", title: `${cv.name} – ${cv.role}`, payload: { cv } });
    award();
    setBusy(false);
  };

  const sw = 236;
  return (
    <div className="st-cv">
      <div className="st-cv-ed">
        <div className="st-row">
          {THEMES.map((t) => (
            <button key={t.n} className="st-swatch" title={t.n} style={{ background: t.side }} onClick={() => upd({ theme: t })} />
          ))}
          <button className="st-btn ghost" onClick={() => upd({ flip: !cv.flip })}>Flip</button>
          <button className="st-btn ghost" onClick={() => window.print()}>Print / PDF</button>
          <button className="st-btn ghost" onClick={() => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(cv)], { type: "application/json" })); a.download = "cv.json"; a.click(); }}>Save JSON</button>
          <label className="st-btn ghost">Load<input hidden type="file" accept=".json" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { upd(JSON.parse(await f.text())); } catch { setMsg("Not a valid CV file."); } } }} /></label>
        </div>
        <Field label="Job ad (for tailoring)"><textarea rows={4} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description" /></Field>
        <button className="st-btn" onClick={tailor} disabled={busy}>{busy ? "Tailoring…" : "Tailor CV to this job"}</button>
        {msg && <p className="st-note err">{msg}</p>}
        {report && <Out text={report.text} source={report.source} />}
        <Field label="Name"><input value={cv.name} onChange={(e) => upd({ name: e.target.value })} /></Field>
        <Field label="Headline"><input value={cv.role} onChange={(e) => upd({ role: e.target.value })} /></Field>
        <Field label="Contact (one per line)"><textarea rows={3} value={cv.contact.join("\n")} onChange={(e) => upd({ contact: e.target.value.split("\n") })} /></Field>
        <Field label="Profile"><textarea rows={4} value={cv.summary} onChange={(e) => upd({ summary: e.target.value })} /></Field>
        <Field label="Skills"><textarea rows={2} value={cv.skills} onChange={(e) => upd({ skills: e.target.value })} /></Field>
        <Field label="Tools"><textarea rows={2} value={cv.tools} onChange={(e) => upd({ tools: e.target.value })} /></Field>
        {cv.jobs.map((j, i) => (
          <fieldset key={i} className="st-fs">
            <legend>Role {i + 1} {cv.jobs.length > 1 && <button className="st-x" onClick={() => upd({ jobs: cv.jobs.filter((_, k) => k !== i) })}>remove</button>}</legend>
            <input placeholder="Dates" value={j.dates} onChange={(e) => setJob(i, { dates: e.target.value })} />
            <input placeholder="Title" value={j.title} onChange={(e) => setJob(i, { title: e.target.value })} />
            <input placeholder="Company" value={j.org} onChange={(e) => setJob(i, { org: e.target.value })} />
            <textarea rows={4} placeholder="One bullet per line" value={j.bullets.join("\n")} onChange={(e) => setJob(i, { bullets: e.target.value.split("\n") })} />
          </fieldset>
        ))}
        <button className="st-btn ghost" onClick={() => upd({ jobs: [...cv.jobs, { ...BLANK.jobs[0] }] })}>+ Add role</button>
        <Field label="Education (year | degree | school)"><textarea rows={2} value={cv.education.map((e) => [e.year, e.degree, e.school].join(" | ")).join("\n")} onChange={(e) => upd({ education: e.target.value.split("\n").map((l) => { const [year = "", degree = "", school = ""] = l.split("|").map((s) => s.trim()); return { year, degree, school }; }) })} /></Field>
        <Field label="Interests"><input value={cv.interests} onChange={(e) => upd({ interests: e.target.value })} /></Field>
      </div>

      <div className="st-paper-wrap">
        <div id="cv-paper" className="st-paper" style={{ ["--side" as string]: cv.theme.side, ["--head" as string]: cv.theme.head, ["--acc" as string]: cv.theme.accent, ["--sw" as string]: `${sw}px` }}>
          <div className="cvp-mast"><div className="cvp-name">{cv.name}</div><div className="cvp-role">{cv.role}</div></div>
          <div className="cvp-cols" style={{ flexDirection: cv.flip ? "row-reverse" : "row" }}>
            <aside className="cvp-side">
              <h4>Contact</h4>{cv.contact.map((c, i) => <p key={i}>{c}</p>)}
              <h4>Skills</h4><p>{cv.skills}</p>
              <h4>Tools</h4><p>{cv.tools}</p>
            </aside>
            <main className="cvp-main">
              <h4>Profile</h4><p>{cv.summary}</p>
              <h4>Professional Experience</h4>
              {cv.jobs.map((j, i) => (
                <div key={i} className="cvp-job">
                  <div className="cvp-dates">{j.dates}</div>
                  <b>{j.title}</b> <i>{j.org}</i>
                  <ul>{j.bullets.filter(Boolean).map((b, k) => <li key={k}>{b}</li>)}</ul>
                </div>
              ))}
              <h4>Education</h4>
              {cv.education.map((e, i) => <p key={i}><b>{e.year}</b> {e.degree}, {e.school}</p>)}
              <h4>Hobbies and Interests</h4><p>{cv.interests}</p>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
