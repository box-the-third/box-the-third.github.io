// Tiny synthesized UI sounds (Web Audio, no asset files).
// Browsers block audio until the first user gesture, so the context is created lazily.

let ctx: AudioContext | null = null;
let muted = false;
let quietUntil = 0;

try {
  muted = localStorage.getItem("sfx:muted") === "1";
} catch {}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call from any user gesture so later (scroll) sounds are allowed. */
export function unlockAudio() {
  ac();
}

export const isMuted = () => muted;
export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem("sfx:muted", v ? "1" : "0");
  } catch {}
}
/** Suppress scroll ticks for a while (e.g. during the guided tour's auto-scroll). */
export function quietFor(ms: number) {
  quietUntil = performance.now() + ms;
}

type Tone = { f: number; to?: number; t?: number; d: number; type?: OscillatorType; v?: number };

function play(tones: Tone[]) {
  if (muted) return;
  const a = ac();
  if (!a || a.state !== "running") return;
  const now = a.currentTime;
  for (const tn of tones) {
    const o = a.createOscillator();
    const g = a.createGain();
    const start = now + (tn.t ?? 0);
    o.type = tn.type ?? "sine";
    o.frequency.setValueAtTime(tn.f, start);
    if (tn.to) o.frequency.exponentialRampToValueAtTime(tn.to, start + tn.d);
    const peak = tn.v ?? 0.06;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + tn.d);
    o.connect(g).connect(a.destination);
    o.start(start);
    o.stop(start + tn.d + 0.02);
  }
}

/** Soft airy whoosh: band-passed noise whose pitch sweeps up, then fades. */
function whoosh(opts: { from: number; to: number; d: number; v: number }) {
  if (muted) return;
  const a = ac();
  if (!a || a.state !== "running") return;
  const len = Math.floor(a.sampleRate * opts.d);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.9;
  const now = a.currentTime;
  bp.frequency.setValueAtTime(opts.from, now);
  bp.frequency.exponentialRampToValueAtTime(opts.to, now + opts.d);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(opts.v, now + opts.d * 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, now + opts.d);
  src.connect(bp).connect(g).connect(a.destination);
  src.start(now);
}

/** Pip clicked: gentle rising whoosh. */
export const sfxPip = () => whoosh({ from: 350, to: 2200, d: 0.38, v: 0.1 });

/**
 * Accordion: soft "transformer" servo. Two detuned saws glide down (open) or up
 * (close) through a low-pass filter, with a quick fast tremolo for the mechanical
 * whirr and a tiny metallic click at the start. Kept quiet on purpose.
 */
export function sfxTransform(dir: "open" | "close") {
  if (muted) return;
  const a = ac();
  if (!a || a.state !== "running") return;
  const now = a.currentTime;
  const d = dir === "open" ? 0.42 : 0.3;
  const [f0, f1] = dir === "open" ? [560, 150] : [170, 430];

  const master = a.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.05, now + 0.05);
  master.gain.exponentialRampToValueAtTime(0.0001, now + d);

  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 4;
  lp.frequency.setValueAtTime(dir === "open" ? 2200 : 700, now);
  lp.frequency.exponentialRampToValueAtTime(dir === "open" ? 500 : 1800, now + d);

  // servo tremolo
  const trem = a.createGain();
  trem.gain.value = 0.7;
  const lfo = a.createOscillator();
  const lfoAmt = a.createGain();
  lfo.frequency.value = 32;
  lfoAmt.gain.value = 0.3;
  lfo.connect(lfoAmt).connect(trem.gain);

  [1, 1.012].forEach((det) => {
    const o = a.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f0 * det, now);
    o.frequency.exponentialRampToValueAtTime(f1 * det, now + d);
    o.connect(lp);
    o.start(now);
    o.stop(now + d + 0.03);
  });
  lp.connect(trem).connect(master).connect(a.destination);
  lfo.start(now);
  lfo.stop(now + d + 0.03);

  // metallic click
  play([{ f: 2400, to: 900, d: 0.03, type: "square", v: 0.018 }]);
}

/** Tour next / button press. */
export const sfxClick = () => play([{ f: 520, to: 700, d: 0.07, type: "sine", v: 0.07 }]);

/** Tour step change: soft rising blip. */
export const sfxStep = () =>
  play([
    { f: 440, d: 0.09, type: "triangle", v: 0.07 },
    { f: 660, t: 0.07, d: 0.12, type: "triangle", v: 0.07 },
  ]);

/** Tour finished. */
export const sfxDone = () =>
  play([
    { f: 523, d: 0.12, type: "triangle", v: 0.08 },
    { f: 659, t: 0.1, d: 0.12, type: "triangle", v: 0.08 },
    { f: 784, t: 0.2, d: 0.22, type: "triangle", v: 0.08 },
  ]);

/** Soft tick while scrolling; pitch wobbles a little so it feels organic. */
export function sfxTick() {
  if (performance.now() < quietUntil) return;
  const f = 900 + Math.random() * 220;
  play([{ f, to: f * 0.7, d: 0.035, type: "sine", v: 0.025 }]);
}

/** Soft footstep while Bhodbhar walks. */
export const sfxFoot = () => play([{ f: 150, to: 70, d: 0.07, type: "sine", v: 0.045 }]);
