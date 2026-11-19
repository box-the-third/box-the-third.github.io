"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { sfxDone, sfxRunStep, sfxSkid, sfxTap, unlockAudio } from "@/lib/sfx";
import { BUMP, unlockBump } from "@/lib/perks";

const Bhodbhar3D = dynamic(() => import("@/components/three/Bhodbhar3D"), { ssr: false });

/**
 * The fist-bump moment. After someone picks a service, Temu Bhodbhar sprints out of
 * his corner, turns and runs at the viewer (growing as he gets closer), skids to a
 * stop and holds out his fist. Bumping it plays a soft tap, he rocks back, cheers,
 * and 5% comes off their request. A small win now makes finishing feel natural.
 *
 * Timeline: in → runA (across, side-on) → runB (toward you) → skid → offer
 *           → hit → reward → out (runs home).
 */

type Phase = "in" | "runA" | "runB" | "skid" | "offer" | "hit" | "reward" | "out";
type Box = { x: number; y: number; w: number; h: number };

export default function FistBump({ from, service, onDone }: { from: Box; service?: string; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("in");
  const [hit, setHit] = useState(0);
  const [fist, setFist] = useState<{ x: number; y: number } | null>(null);
  const [bumped, setBumped] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ringRef = useRef<HTMLButtonElement>(null);
  const reduced = useRef(false);

  // Layout: big crisp character in the upper middle, text panel under his feet.
  const [geo] = useState(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const H = Math.round(Math.min(vh * 0.5, 400, (vw - 32) * 1.385));
    const W = Math.round(H / 1.385);
    const ground = Math.round(vh * 0.64);
    const cx = vw / 2;
    const s0 = from.w / W;
    return {
      W, H, ground, cx,
      start: { x: from.x, y: from.y, s: s0 },
      mid: { x: cx - (W * s0) / 2, y: from.y + from.h - H * s0, s: s0 },
      end: { x: cx - W / 2, y: ground - H, s: 1 },
      runA: reduced.current ? 0 : Math.min(1.15, Math.max(0.55, Math.abs(from.x + from.w / 2 - cx) / 760)),
      runB: reduced.current ? 0 : 0.8,
    };
  });

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Footsteps, in time with the stride; louder as he gets closer.
  useEffect(() => {
    if (reduced.current || !(phase === "runA" || phase === "runB" || phase === "out")) return;
    const started = performance.now();
    const dur = (phase === "runA" ? geo.runA : phase === "runB" ? geo.runB : 0.9) * 1000;
    const id = setInterval(() => {
      const k = Math.min(1, (performance.now() - started) / dur);
      const near = phase === "runA" ? 0.25 : phase === "runB" ? 0.3 + 0.7 * k : 1 - 0.8 * k;
      sfxRunStep(near);
    }, phase === "runA" ? 150 : 128);
    return () => clearInterval(id);
  }, [phase, geo]);

  // Run in: across the bottom, then straight at the viewer, then skid into the offer.
  useEffect(() => {
    unlockAudio();
    const r1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setPhase("runA");
        later(() => setPhase("runB"), geo.runA * 1000);
        later(() => {
          setPhase("skid");
          if (!reduced.current) sfxSkid();
        }, (geo.runA + geo.runB) * 1000);
        later(() => setPhase("offer"), (geo.runA + geo.runB) * 1000 + 320);
      })
    );
    return () => cancelAnimationFrame(r1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "offer" && fist) ringRef.current?.focus({ preventScroll: true });
  }, [phase, fist]);

  const doBump = () => {
    if (phase !== "offer") return;
    unlockAudio();
    sfxTap();
    setHit((h) => h + 1);
    setBumped(true);
    setPhase("hit");
    unlockBump();
    later(() => {
      setPhase("reward");
      sfxDone();
    }, 520);
  };

  const leave = useCallback(
    (go?: string) => {
      if (phase === "out") return;
      if (go) {
        window.location.href = go;
        return;
      }
      setPhase("out");
      later(onDone, reduced.current ? 200 : 950);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, onDone]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leave]);

  // Where he is and how big, per phase.
  const spot = phase === "in" || phase === "out" ? geo.start : phase === "runA" ? geo.mid : geo.end;
  const dur = phase === "runA" ? geo.runA : phase === "runB" ? geo.runB : phase === "out" ? (reduced.current ? 0 : 0.9) : 0;
  const ease = phase === "runB" ? "cubic-bezier(.45,.05,.85,.55)" : phase === "out" ? "cubic-bezier(.3,.4,.6,1)" : "linear";
  const running = phase === "runA" || phase === "runB" || phase === "out";
  const facing = phase === "runA" ? Math.sign(geo.cx - (from.x + from.w / 2)) || -1 : phase === "out" ? Math.sign(from.x + from.w / 2 - geo.cx) || 1 : 0;
  const showRing = phase === "offer" && fist;
  const panelTop = geo.ground + 14;

  return (
    <div className={"fb-root" + (phase === "out" ? " leaving" : "")} role="dialog" aria-modal="true" aria-label="Fist bump from Temu Bhodbhar">
      <div className="fb-backdrop" />

      <div
        className={"fb-char" + (phase === "skid" ? " skid" : "") + (phase === "hit" ? " shake" : "") + (phase === "reward" ? " cheer" : "")}
        style={{
          width: geo.W,
          height: geo.H,
          transform: `translate3d(${spot.x}px, ${spot.y}px, 0) scale(${spot.s})`,
          transition: `transform ${dur}s ${ease}`,
        }}
      >
        <Bhodbhar3D
          width={geo.W}
          height={geo.H}
          walking={running}
          run={running}
          facing={facing}
          talking={phase === "offer" || phase === "reward"}
          bump={phase === "offer" || phase === "hit"}
          hit={hit}
          air={phase === "reward"}
          onFist={(x, y) => setFist({ x, y })}
        />
      </div>

      {showRing && (
        <button
          ref={ringRef}
          className="fb-ring"
          style={{ left: geo.end.x + fist.x, top: geo.end.y + fist.y }}
          onClick={doBump}
          aria-label={`Fist bump Temu Bhodbhar to unlock ${BUMP.pct}% off`}
        >
          <span className="fb-ring-label">Tap to bump</span>
        </button>
      )}
      {phase === "hit" && fist && <div className="fb-burst" style={{ left: geo.end.x + fist.x, top: geo.end.y + fist.y }} aria-hidden />}

      {(phase === "offer" || phase === "skid") && (
        <div className="fb-panel" style={{ top: panelTop }}>
          <p className="fb-title">{service ? `${service}? Great pick.` : "Great pick."} 👊</p>
          <p className="fb-text">You just started something good. Bump my fist and I&apos;ll take {BUMP.pct}% off when you send your request.</p>
          <div className="fb-actions">
            <button className="pip-btn solid" onClick={doBump}>👊 Fist bump</button>
            <button className="pip-btn" onClick={() => leave()}>Not now</button>
          </div>
        </div>
      )}

      {(phase === "reward" || (phase === "out" && bumped)) && (
        <div className="fb-panel reward" style={{ top: panelTop }} aria-live="polite">
          <div className="fb-badge">{BUMP.pct}% OFF</div>
          <p className="fb-title">Deal. It&apos;s locked in! 🎉</p>
          <p className="fb-text">
            Your {BUMP.pct}% is saved to your cart. Send your request to use it, it only takes a minute.
          </p>
          <div className="fb-actions">
            <button className="pip-btn solid" onClick={() => leave("/dashboard/?tab=request")}>Finish my request →</button>
            <button className="pip-btn" onClick={() => leave()}>Keep browsing</button>
          </div>
        </div>
      )}
    </div>
  );
}
