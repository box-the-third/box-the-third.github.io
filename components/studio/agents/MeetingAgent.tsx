"use client";

import { useEffect, useMemo, useState } from "react";
import { saveItem, listItems } from "@/lib/studio/data";
import { store } from "@/lib/studio/resilience";
import { Field, useAward, useUid } from "../ui";

interface Avail { days: number[]; start: string; end: string; slot: number; buffer: number; tz: string }
const KEY = "yas_avail_v1";
const DEF: Avail = { days: [0, 1, 2, 3, 4], start: "10:00", end: "17:00", slot: 30, buffer: 10, tz: "Asia/Riyadh" };
const DN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const mins = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
const pad = (n: number) => String(n).padStart(2, "0");

function slotsFor(a: Avail, taken: Set<string>, daysAhead = 10) {
  const out: { date: string; times: string[] }[] = [];
  const now = new Date();
  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    if (!a.days.includes(day.getDay())) continue;
    const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    const times: string[] = [];
    for (let m = mins(a.start); m + a.slot <= mins(a.end); m += a.slot + a.buffer) {
      const t = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
      const past = d === 0 && m <= now.getHours() * 60 + now.getMinutes();
      if (!past && !taken.has(`${date} ${t}`)) times.push(t);
    }
    if (times.length) out.push({ date, times });
  }
  return out;
}

function ics(title: string, date: string, time: string, slot: number) {
  const s = new Date(`${date}T${time}:00`);
  const e = new Date(s.getTime() + slot * 60000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//YAS Studio//EN", "BEGIN:VEVENT", `UID:${crypto.randomUUID()}@yas`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`, `SUMMARY:${title}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}

export default function MeetingAgent() {
  const [a, setA] = useState<Avail>(DEF);
  const [bookings, setBookings] = useState(() => listItems("booking"));
  const [who, setWho] = useState("");
  const uid = useUid();
  const award = useAward("meeting");
  useEffect(() => { setA(store.read<Avail>(KEY, DEF)); setBookings(listItems("booking")); }, []);
  const upd = (p: Partial<Avail>) => { const n = { ...a, ...p }; setA(n); store.write(KEY, n); };
  const taken = useMemo(() => new Set(bookings.filter((b) => b.status !== "cancelled").map((b) => `${(b.payload as { date: string }).date} ${(b.payload as { time: string }).time}`)), [bookings]);
  const slots = useMemo(() => slotsFor(a, taken), [a, taken]);

  const book = async (date: string, time: string) => {
    const name = who.trim() || "Guest";
    await saveItem(uid, { kind: "booking", title: `${name} · ${date} ${time}`, status: "confirmed", payload: { date, time, name, slot: a.slot, tz: a.tz } });
    setBookings(listItems("booking"));
    const blob = new Blob([ics(`Meeting with ${name}`, date, time, a.slot)], { type: "text/calendar" });
    const l = document.createElement("a"); l.href = URL.createObjectURL(blob); l.download = "meeting.ics"; l.click();
    award();
  };
  const cancel = async (id: string) => {
    const b = bookings.find((x) => x.id === id);
    if (b) { await saveItem(uid, { ...b, status: "cancelled" }); setBookings(listItems("booking")); }
  };
  const share = slots.slice(0, 4).map((s) => `${s.date}: ${s.times.slice(0, 4).join(", ")}`).join("\n");

  return (
    <div className="st-split">
      <div className="st-form">
        <div className="st-row">{DN.map((n, i) => (
          <button key={n} className={`st-btn ${a.days.includes(i) ? "" : "ghost"}`} onClick={() => upd({ days: a.days.includes(i) ? a.days.filter((d) => d !== i) : [...a.days, i] })}>{n}</button>
        ))}</div>
        <div className="st-row">
          <Field label="From"><input type="time" value={a.start} onChange={(e) => upd({ start: e.target.value })} /></Field>
          <Field label="To"><input type="time" value={a.end} onChange={(e) => upd({ end: e.target.value })} /></Field>
        </div>
        <div className="st-row">
          <Field label="Slot (min)"><input type="number" min={10} step={5} value={a.slot} onChange={(e) => upd({ slot: +e.target.value || 30 })} /></Field>
          <Field label="Buffer (min)"><input type="number" min={0} step={5} value={a.buffer} onChange={(e) => upd({ buffer: +e.target.value || 0 })} /></Field>
        </div>
        <Field label="Time zone"><input value={a.tz} onChange={(e) => upd({ tz: e.target.value })} /></Field>
        <Field label="Who is booking?"><input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Name" /></Field>
        <button className="st-btn ghost" onClick={() => navigator.clipboard?.writeText(`My availability (${a.tz}):\n${share}\nReply with a time that suits you.`)}>Copy availability for email</button>
        <h4 className="st-h">Booked</h4>
        {bookings.filter((b) => b.status !== "cancelled").map((b) => (
          <div key={b.id} className="glass-card st-li"><span>{b.title}</span><button className="st-btn ghost" onClick={() => cancel(b.id)}>Cancel</button></div>
        ))}
      </div>
      <div>
        <h4 className="st-h">Open slots (click to book + download .ics)</h4>
        {slots.length === 0 && <p className="st-note">No slots. Pick working days above.</p>}
        {slots.map((s) => (
          <div key={s.date} className="glass-card st-slotrow">
            <b>{new Date(s.date + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</b>
            <div className="st-row">{s.times.map((t) => <button key={t} className="st-btn ghost" onClick={() => book(s.date, t)}>{t}</button>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
