"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { isMuted, quietFor, setMuted, sfxClick, sfxDone, sfxPip, sfxStep, sfxTick, unlockAudio } from "@/lib/sfx";

/**
 * Pip: a small mascot that offers a first-visit tour of the page.
 * - Shows once (localStorage), after the preloader finishes.
 * - Afterwards stays as a small "?" buddy bottom-left to replay the tour.
 */

type Step = { target?: string; text: string; cta?: { label: string; href: string } };

const STEPS: Step[] = [
  {
    text: "Hi, I'm Pip! 👋 Want a 30-second tour so you know where everything is?",
  },
  {
    target: "#offer",
    text: "First stop: the free IELTS offer. The first 3 classes cost nothing, and booking takes 5 minutes.",
  },
  {
    target: "#work",
    text: "Here is my work: brands, websites and UGC videos. Tap any project to see the details.",
  },
  {
    target: "#about",
    text: "A little about me, the skills I use and the places I've worked.",
  },
  {
    target: "#services",
    text: "Open any service to see how to do it yourself, why to hire me, and prices. Look for the “Try the Agent” button!",
  },
  {
    text: "Psst, there's an Agent Studio too: 10 free AI helpers for CVs, SOPs, invoices and more.",
    cta: { label: "Open the Studio", href: "/studio/" },
  },
  {
    target: "#contact",
    text: "Ready to start something? Send me a message here. That's the tour, thanks for visiting! 🎉",
  },
];

const KEY = "pip:seen";

const readSeen = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
};

function Pip({ mood }: { mood: "wave" | "idle" }) {
  return (
    <svg viewBox="0 0 80 84" width="100%" height="100%" aria-hidden>
      {/* antenna */}
      <path d="M40 14 V5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="4.5" r="3.6" fill="#ffba08" />
      {/* feet */}
      <ellipse cx="29" cy="79" rx="9" ry="4" fill="#ffba08" />
      <ellipse cx="51" cy="79" rx="9" ry="4" fill="#ffba08" />
      {/* arms */}
      <g className={mood === "wave" ? "pip-arm-wave" : ""}>
        <ellipse cx="9" cy="50" rx="6" ry="10" fill="currentColor" transform="rotate(14 9 50)" />
      </g>
      <ellipse cx="71" cy="50" rx="6" ry="10" fill="currentColor" transform="rotate(-14 71 50)" />
      {/* body */}
      <rect x="9" y="12" width="62" height="66" rx="31" fill="currentColor" />
      {/* belly */}
      <ellipse cx="40" cy="62" rx="19" ry="13" fill="#fff" opacity=".92" />
      {/* eyes */}
      <g className="pip-eyes">
        <ellipse cx="29" cy="38" rx="10" ry="11.5" fill="#fff" />
        <ellipse cx="51" cy="38" rx="10" ry="11.5" fill="#fff" />
        <circle cx="31" cy="39" r="5" fill="#0a1628" />
        <circle cx="49" cy="39" r="5" fill="#0a1628" />
        <circle cx="32.6" cy="37" r="1.7" fill="#fff" />
        <circle cx="50.6" cy="37" r="1.7" fill="#fff" />
      </g>
      {/* beak */}
      <path d="M35 49 L45 49 L40 56 Z" fill="#ffba08" />
      {/* cheeks */}
      <circle cx="19" cy="52" r="3.2" fill="#ffba08" opacity=".35" />
      <circle cx="61" cy="52" r="3.2" fill="#ffba08" opacity=".35" />
    </svg>
  );
}

export default function Guide() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false); // speech bubble / tour active
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mute, setMute] = useState(false);

  // Sounds: unlock on first gesture, soft tick every ~160px of scrolling.
  useEffect(() => {
    setMute(isMuted());
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    let lastY = window.scrollY;
    let acc = 0;
    let lastT = 0;
    const onScroll = () => {
      const y = window.scrollY;
      acc += Math.abs(y - lastY);
      lastY = y;
      const now = performance.now();
      if (acc >= 160 && now - lastT > 70) {
        acc = 0;
        lastT = now;
        sfxTick();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Appear after the preloader (first visit opens the bubble automatically).
  useEffect(() => {
    if (pathname !== "/") return;
    const already = readSeen();
    setSeen(already);
    const show = () => {
      setReady(true);
      if (!already) {
        timer.current = setTimeout(() => setOpen(true), 900);
      }
    };
    window.addEventListener("preloader:done", show, { once: true });
    const safety = setTimeout(show, 14000);
    return () => {
      window.removeEventListener("preloader:done", show);
      clearTimeout(safety);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  const scrollTo = useCallback((sel?: string) => {
    if (!sel) return;
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goto = (i: number) => {
    sfxStep();
    quietFor(1400); // no scroll ticks during the guided auto-scroll
    setStep(i);
    scrollTo(STEPS[i].target);
  };

  const finish = () => {
    sfxDone();
    markSeen();
    setSeen(true);
    setOpen(false);
    setStep(0);
  };

  const start = () => {
    markSeen();
    goto(1);
  };

  const askAgain = () => {
    sfxPip();
    setStep(0);
    setOpen(true);
  };

  if (pathname !== "/" || !ready) return null;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  const intro = step === 0;

  return (
    <div className="pip-wrap" role="complementary" aria-label="Page guide">
      <AnimatePresence>
        {open && (
          <motion.div
            key="bubble"
            className="pip-bubble"
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="pip-x" onClick={finish} aria-label="Close guide">
              ×
            </button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={step}
                className="pip-text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {s.text}
              </motion.p>
            </AnimatePresence>

            {!intro && (
              <div className="pip-dots" aria-hidden>
                {STEPS.slice(1).map((_, i) => (
                  <span key={i} className={i + 1 <= step ? "on" : ""} />
                ))}
              </div>
            )}

            <div className="pip-actions">
              {intro ? (
                <>
                  <button className="pip-btn solid" onClick={start}>
                    Show me around
                  </button>
                  <button className="pip-btn" onClick={finish}>
                    No thanks
                  </button>
                </>
              ) : (
                <>
                  {step > 1 && (
                    <button className="pip-btn" onClick={() => goto(step - 1)}>
                      Back
                    </button>
                  )}
                  {s.cta && (
                    <a className="pip-btn" href={s.cta.href} onClick={markSeen}>
                      {s.cta.label}
                    </a>
                  )}
                  {last ? (
                    <button className="pip-btn solid" onClick={finish}>
                      Done
                    </button>
                  ) : (
                    <button className="pip-btn solid" onClick={() => goto(step + 1)}>
                      Next
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className="pip-mute"
        onClick={() => {
          unlockAudio();
          const m = !mute;
          setMute(m);
          setMuted(m);
          if (!m) sfxClick();
        }}
        aria-label={mute ? "Turn sounds on" : "Turn sounds off"}
        aria-pressed={mute}
        title={mute ? "Sounds off" : "Sounds on"}
      >
        {mute ? "🔇" : "🔊"}
      </button>
      <motion.button
        className={"pip-char" + (open ? " talking" : "")}
        onClick={() => {
          unlockAudio();
          if (open) {
            sfxPip();
            markSeen();
            setSeen(true);
            setOpen(false);
            setStep(0);
          } else askAgain();
        }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        aria-label={open ? "Close the guide" : "Ask Pip for a tour"}
        title={open ? "Close" : seen ? "Need a tour? Ask Pip" : "Hi! I'm Pip"}
      >
        <Pip mood={open && intro ? "wave" : "idle"} />
      </motion.button>
    </div>
  );
}
