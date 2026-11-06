"use client";

import { useEffect, useRef, useState } from "react";
import { cardCopy } from "@/lib/studio/local";
import { saveItem } from "@/lib/studio/data";
import { Field, useAward, useUid } from "../ui";

const SCENES = [
  { id: "recruiter", label: "Recruiter outreach", a: "#00b2bc", b: "#0a1628" },
  { id: "founder", label: "Founder with similar profile", a: "#ffba08", b: "#2b1b4d" },
];
const W = 1080, H = 1350;

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = "", yy = y;
  for (const w of text.split(" ")) {
    const t = line + w + " ";
    if (ctx.measureText(t).width > max && line) { ctx.fillText(line.trim(), x, yy); line = w + " "; yy += lh; } else line = t;
  }
  ctx.fillText(line.trim(), x, yy);
  return yy;
}

export default function CardsAgent() {
  const [scene, setScene] = useState(SCENES[0]);
  const [f, setF] = useState({ name: "", role: "", highlight: "", shared: "", contact: "" });
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const uid = useUid();
  const award = useAward("cards");

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const copy = cardCopy(scene.id, f.name || "Your Name", f.role || "Your Role", f.highlight);
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, scene.b); g.addColorStop(1, scene.a);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.arc(W * 0.85, H * 0.15, 320, 0, 7); ctx.fill();
    // glass panel
    ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(80, 140, W - 160, H - 280, 48); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.textBaseline = "alphabetic";
    ctx.font = "600 30px system-ui"; ctx.globalAlpha = 0.8; ctx.fillText(copy.kicker, 140, 230); ctx.globalAlpha = 1;
    let y = 330;
    if (photo) {
      ctx.save(); ctx.beginPath(); ctx.arc(W - 270, 330, 110, 0, 7); ctx.clip();
      const s = Math.max(220 / photo.width, 220 / photo.height);
      ctx.drawImage(photo, W - 270 - (photo.width * s) / 2, 330 - (photo.height * s) / 2, photo.width * s, photo.height * s); ctx.restore();
    }
    ctx.font = "800 68px system-ui"; y = wrap(ctx, copy.headline, 140, y, photo ? 560 : 800, 80) + 90;
    ctx.font = "400 40px system-ui"; ctx.globalAlpha = 0.92; y = wrap(ctx, copy.body, 140, Math.max(y, 520), 800, 56) + 80; ctx.globalAlpha = 1;
    if (f.shared) {
      ctx.font = "600 30px system-ui"; ctx.fillText(scene.id === "founder" ? "WHAT WE HAVE IN COMMON" : "WHY I FIT", 140, y); y += 56;
      ctx.font = "400 36px system-ui";
      f.shared.split("\n").filter(Boolean).slice(0, 4).forEach((s) => { ctx.fillText("•  " + s, 140, y); y += 56; });
    }
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(140, H - 330, 420, 84, 42); ctx.fill();
    ctx.fillStyle = scene.b; ctx.font = "700 34px system-ui"; ctx.fillText(copy.cta, 190, H - 277);
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "400 30px system-ui"; ctx.fillText(f.contact || "", 140, H - 190);
  }, [scene, f, photo]);

  const download = async () => {
    const url = ref.current!.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = `card-${scene.id}.png`; a.click();
    await saveItem(uid, { kind: "card", title: `${scene.label}: ${f.name}`, payload: { scene: scene.id, ...f } });
    award();
  };

  return (
    <div className="st-split">
      <div className="st-form">
        <div className="st-row">{SCENES.map((s) => <button key={s.id} className={`st-btn ${s.id === scene.id ? "" : "ghost"}`} onClick={() => setScene(s)}>{s.label}</button>)}</div>
        <Field label="Name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Role"><input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></Field>
        <Field label="One-line highlight"><textarea rows={2} value={f.highlight} onChange={(e) => setF({ ...f, highlight: e.target.value })} /></Field>
        <Field label={scene.id === "founder" ? "What you share (one per line)" : "Why you fit (one per line)"}><textarea rows={3} value={f.shared} onChange={(e) => setF({ ...f, shared: e.target.value })} /></Field>
        <Field label="Contact line"><input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></Field>
        <Field label="Photo (stays in your browser)"><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const im = new Image(); im.onload = () => setPhoto(im); im.src = URL.createObjectURL(file); }} /></Field>
        <button className="st-btn" onClick={download}>Download PNG</button>
      </div>
      <canvas ref={ref} width={W} height={H} className="st-canvas" />
    </div>
  );
}
