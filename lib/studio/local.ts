// Deterministic, zero-cost generators. These are the fallback when no AI key
// is configured (or the AI service is down) and double as the free tier that
// keeps running costs at zero.

const STOP = new Set(("a an the and or of to in for with on at by from as is are be this that it we you your our will can " +
  "have has experience years work team role job ability strong skills required preferred must looking someone " +
  "seeking hiring join about who what when where which their they them also all any not but into than then more most such").split(" "));

export function keywords(text: string, max = 14): string[] {
  const freq: Record<string, number> = {};
  (text.toLowerCase().match(/[a-z][a-z+#.\-]{2,}/g) || []).forEach((w) => {
    if (!STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, max).map(([w]) => w);
}

/** Reorder bullets so those matching the job ad lead. Never invents facts. */
export function tailorBullets(bullets: string[], jd: string): string[] {
  const kw = keywords(jd, 24);
  const score = (b: string) => kw.reduce((s, k) => s + (b.toLowerCase().includes(k) ? 1 : 0), 0);
  return [...bullets].map((b, i) => ({ b, i, s: score(b) })).sort((x, y) => y.s - x.s || x.i - y.i).map((x) => x.b);
}

export function missingKeywords(cvText: string, jd: string): string[] {
  const have = cvText.toLowerCase();
  return keywords(jd, 24).filter((k) => !have.includes(k));
}

export interface SopIn { name: string; program: string; school: string; background: string; why: string; goals: string; achievements: string; }
export function sopDraft(i: SopIn): string {
  const L = (s: string, d: string) => (s.trim() ? s.trim() : d);
  return [
    `Statement of Purpose: ${L(i.program, "[Program]")}, ${L(i.school, "[University]")}`,
    "",
    `1. Opening (hook)\nMy interest in ${L(i.program, "[field]")} began with ${L(i.why, "[the moment or problem that pulled you in, one concrete scene]")}. That question has shaped every step since.`,
    `2. Academic and professional background\n${L(i.background, "[2-3 sentences: degree, key courses, roles. Lead with the strongest outcome.]")}`,
    `3. Evidence of fit\n${L(i.achievements, "[2-3 achievements with numbers: what you did, the result, what you learned.]")}`,
    `4. Why ${L(i.school, "this university")}\nName two faculty, labs, courses or resources at ${L(i.school, "the university")} and connect each to a specific goal. Avoid rankings and generic praise.`,
    `5. Goals\n${L(i.goals, "[Short-term: what you will build or research. Long-term: the impact you want.]")}`,
    `6. Closing\nI am ready to contribute from day one and to learn from the community at ${L(i.school, "the university")}. Thank you for considering my application.`,
    "",
    `Checklist: 500-1000 words, one story thread, no clichés, every claim backed by evidence, tailored per school.`,
  ].join("\n\n");
}

export interface OutIn { sender: string; target: string; company: string; offer: string; ask: string; }
export function outreachSequence(i: OutIn): string {
  const t = i.target || "there";
  const c = i.company || "your team";
  return [
    `Email 1 (Day 0) Subject: ${i.offer || "Quick idea"} for ${c}\nHi ${t},\n\nI noticed ${c} is growing and thought ${i.offer || "a quick idea"} might help. ${i.ask || "Open to a 15-minute call this week?"}\n\nBest,\n${i.sender}`,
    `Email 2 (Day 3) Subject: Re: ${i.offer || "Quick idea"}\nHi ${t}, bumping this up in case it got buried. One line: I help teams like ${c} get results with ${i.offer || "this"}. Worth a short chat?\n\n${i.sender}`,
    `Email 3 (Day 7) Subject: A small example for ${c}\nHi ${t}, here is a concrete example of what I would do for ${c}: [add one specific, free micro-deliverable]. Happy to share more.\n\n${i.sender}`,
    `Email 4 (Day 14) Subject: Closing the loop\nHi ${t}, I will stop here so I do not clutter your inbox. If timing changes, reply any time and I will pick it up.\n\n${i.sender}`,
  ].join("\n\n---\n\n");
}

export interface HandIn { title: string; audience: string; deliverables: string; deadline: string; notes: string; }
export function handoffDoc(i: HandIn): string {
  const dl = i.deliverables.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  return [
    `# Design Handoff: ${i.title || "Untitled"}`,
    `Audience: ${i.audience || "TBD"}   Deadline: ${i.deadline || "TBD"}`,
    `## Deliverables\n${(dl.length ? dl : ["TBD"]).map((d) => `- [ ] ${d}`).join("\n")}`,
    `## Specs\n- Grid / spacing scale: 4px base\n- Type: define heading, body, caption sizes\n- Colour: list tokens + contrast ratios (AA minimum)\n- States: default, hover, focus, active, disabled, error, empty, loading\n- Breakpoints: 375 / 768 / 1280`,
    `## Assets & export\n- Icons as SVG, images as WebP at 1x/2x\n- Name layers and components consistently\n- Link the source file and a clickable prototype`,
    `## Acceptance criteria\n- Matches design at all breakpoints\n- Keyboard and screen-reader pass\n- Copy approved by owner`,
    `## Notes\n${i.notes || "None"}`,
    `## Handoff checklist\n- [ ] Review call scheduled\n- [ ] Open questions logged\n- [ ] Owner sign-off`,
  ].join("\n\n");
}

export function socialVariants(topic: string): Record<string, string> {
  const t = topic.trim() || "my latest work";
  return {
    linkedin: `${t}\n\nHere is what I learned and what I would do differently. Three takeaways below.\n\n1. [insight]\n2. [insight]\n3. [insight]\n\nWhat would you add?`,
    x: `${t.slice(0, 200)}\n\nThread below.`,
    instagram: `${t}\n\nSave this for later.\n\n#marketing #growth #career`,
    facebook: `${t}\n\nTell me what you think in the comments.`,
  };
}

export function cardCopy(scene: string, name: string, role: string, highlight: string) {
  if (scene === "founder")
    return { kicker: "FOUNDER TO FOUNDER", headline: `${name}: building in the same lane`, body: highlight || "We are solving adjacent problems. Worth comparing notes?", cta: "Let's connect" };
  return { kicker: "OPEN TO ROLES", headline: `${name}, ${role}`, body: highlight || "Proven track record of measurable growth.", cta: "See my work" };
}
