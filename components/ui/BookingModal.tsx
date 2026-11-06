"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "@/content/site";

// Pick a day + time, send details. Formspree emails the booking to the owner.
const TZ = "Asia/Dhaka (GMT+6)";
const TIMES = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [f, setF] = useState({ name: "", email: "", phone: "", goal: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "err">("idle");

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;

  const first = (month.getDay() + 6) % 7; // Monday-first
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const valid = date && time && f.name.trim() && /\S+@\S+\.\S+/.test(f.email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setState("sending");
    const fd = new FormData();
    fd.append("name", f.name);
    fd.append("email", f.email);
    fd.append("_replyto", f.email);
    fd.append("_subject", `Free IELTS session booking: ${f.name}, ${date} ${time}`);
    fd.append("date", date);
    fd.append("time", `${time} ${TZ}`);
    fd.append("phone", f.phone);
    fd.append("goal", f.goal);
    fd.append("message", `Free IELTS session request\nDate: ${date}\nTime: ${time} ${TZ}\nName: ${f.name}\nEmail: ${f.email}\nPhone/WhatsApp: ${f.phone}\nTarget band / goal: ${f.goal}`);
    try {
      const r = await fetch(site.formspreeEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: fd });
      if (!r.ok) throw new Error("send");
      setState("done");
    } catch {
      setState("err");
    }
  }

  function downloadIcs() {
    const s = new Date(`${date}T${time}:00+06:00`);
    const e = new Date(s.getTime() + 45 * 60000);
    const t = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${t(s)}`, `DTEND:${t(e)}`, "SUMMARY:Free IELTS session", `DESCRIPTION:With ${site.name}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "ielts-session.ics";
    a.click();
  }

  return createPortal(
    <div className="bk-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Book a free IELTS session">
      <div className="bk-card">
        <button className="bk-close" onClick={onClose} aria-label="Close">×</button>
        {state === "done" ? (
          <div className="bk-done">
            <h3>Request sent.</h3>
            <p>{date} at {time} ({TZ}). I will confirm by email shortly.</p>
            <div className="bk-actions">
              <button className="btn solid" onClick={downloadIcs}><span>Add to calendar</span></button>
              <button className="btn" onClick={onClose}><span>Close</span></button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3>Book your free IELTS session</h3>
            <div className="bk-cal">
              <div className="bk-nav">
                <button type="button" disabled={!canPrev} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">‹</button>
                <b>{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</b>
                <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">›</button>
              </div>
              <div className="bk-grid">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <span key={d} className="bk-dow">{d}</span>)}
                {cells.map((d, i) => {
                  if (!d) return <span key={i} />;
                  const dt = new Date(month.getFullYear(), month.getMonth(), d);
                  const v = iso(dt);
                  return (
                    <button type="button" key={i} disabled={dt < today} className={v === date ? "on" : ""} onClick={() => setDate(v)}>{d}</button>
                  );
                })}
              </div>
            </div>
            {date && (
              <div className="bk-times" role="group" aria-label="Time">
                {TIMES.map((t) => <button type="button" key={t} className={t === time ? "on" : ""} onClick={() => setTime(t)}>{t}</button>)}
                <small>{TZ}</small>
              </div>
            )}
            <div className="bk-fields">
              <input required placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              <input placeholder="WhatsApp / phone (optional)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              <input placeholder="Target band (optional)" value={f.goal} onChange={(e) => setF({ ...f, goal: e.target.value })} />
            </div>
            {state === "err" && <p className="bk-err">Could not send. Please try again or WhatsApp {site.phone}.</p>}
            <button className="btn solid bk-submit" type="submit" disabled={!valid || state === "sending"}>
              <span>{state === "sending" ? "Sending…" : "Confirm booking"}</span>
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
