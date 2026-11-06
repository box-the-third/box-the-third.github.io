"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { isMuted, quietFor, setMuted, sfxClick, sfxDone, sfxFoot, sfxPip, sfxStep, sfxTick, unlockAudio } from "@/lib/sfx";
import PipFace from "@/components/ui/PipFace";

// WebGL is client-only; the 2D face is the fallback if WebGL is unavailable.
const Bhodbhar3D = dynamic(() => import("@/components/three/Bhodbhar3D"), { ssr: false });

/**
 * Temu Bhodbhar (code name Pip): the site's lifelong companion, now in 3D.
 * - Always present, on every page, after the preloader finishes.
 * - Home page, wide screens: the tour is a walk. He strolls to each nav item while the rest
 *   of the page dims behind a spotlight, and his explanation stays on screen.
 * - Home page, narrow screens: a section-by-section tour (the nav is a hamburger there).
 * - First-ever visit offers the tour; return visits get a short "welcome back".
 * - Other pages: click him for quick links.
 */

type Step = { target?: string; text: string; cta?: { label: string; href: string } };

// Section tour (used on narrow screens where the nav links are hidden).
const STEPS: Step[] = [
  {
    text: "Hi, I'm Temu Bhodbhar! 👋 Want a 30-second tour so you know where everything is?",
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

// Nav tour (wide screens): what visitors find behind each nav item.
type NavDef = { key: string; label: string; sel: string; text: string; go?: { label: string; href?: string; hash?: string; click?: boolean } };
const NAV_DEFS: NavDef[] = [
  { key: "work", label: "Work", sel: '.nav-links a[href$="#work"]', text: "Everything I've made: brand identities, websites and UGC videos. Filter by client work or personal work to find what fits you.", go: { label: "Take me there", hash: "#work" } },
  { key: "studio", label: "Studio", sel: '.nav-links a[href="/studio/"]', text: "My Agent Studio: 10 free AI helpers that write CVs, SOPs and outreach emails, make invoices and more. Your work saves on this device.", go: { label: "Open the Studio", href: "/studio/" } },
  { key: "about", label: "About", sel: '.nav-links a[href$="#about"]', text: "Who I am, the skills I bring and the places I've worked.", go: { label: "Take me there", hash: "#about" } },
  { key: "services", label: "Services", sel: '.nav-links a[href$="#services"]', text: "Every service laid out: how to do it yourself, why to hire me, and prices in your currency. Open one and add a plan to your cart.", go: { label: "Take me there", hash: "#services" } },
  { key: "ielts", label: "Free IELTS", sel: '.nav-links a[href$="#offer"]', text: "Your first 3 IELTS classes are free. Book a time in about 5 minutes and get a personalised plan.", go: { label: "Take me there", hash: "#offer" } },
  { key: "contact", label: "Contact", sel: '.nav-links a[href$="#contact"]', text: "Got a project or a question? Message me here. The first consultation is always free.", go: { label: "Take me there", hash: "#contact" } },
  { key: "account", label: "Account", sel: ".nav-cta, .nav-account", text: "Create a free account to track your orders, consultations and free revisions in one place.", },
  { key: "cart", label: "Cart", sel: ".nav-cart", text: "Plans you add from Services wait here. Open it to send your request.", go: { label: "Open it", href: "/dashboard/" } },
  { key: "theme", label: "Theme", sel: ".theme-toggle", text: "Dark or light, whichever is easier on your eyes.", go: { label: "Try it", click: true } },
];
type NavItem = NavDef & { el: HTMLElement };

const visible = (el: Element | null): el is HTMLElement => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};
const buildNavItems = (): NavItem[] =>
  NAV_DEFS.map((d) => ({ ...d, el: document.querySelector(d.sel) as HTMLElement | null })).filter(
    (d): d is NavItem => visible(d.el)
  );

type Lenis = { scrollTo: (t: HTMLElement | number, o?: object) => void; stop: () => void; start: () => void };
const getLenis = () => (window as unknown as { lenis?: Lenis }).lenis;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

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

export default function Guide() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false); // speech bubble (idle / section tour)
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoClose = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepOpen = () => {
    if (autoClose.current) clearTimeout(autoClose.current);
  };
  const [mute, setMute] = useState(false);

  // --- 3D character + nav tour state
  const slotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 120, h: 166 });
  const [idle, setIdle] = useState<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null); // null = standing at his idle spot
  const curPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState(1);
  const [dur, setDur] = useState(1.1);
  const [use3d, setUse3d] = useState(true);
  const [mode, setMode] = useState<"none" | "nav">("none");
  const [items, setItems] = useState<NavItem[]>([]);
  const [ni, setNi] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const walkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

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

  // Always appear after the preloader; on the home page he greets you.
  // First-ever visit: tour offer that stays. Return visits: short welcome that fades.
  const greeted = useRef(false);
  useEffect(() => {
    const already = readSeen();
    setSeen(already);
    const show = () => {
      setReady(true);
      if (greeted.current || window.location.pathname !== "/") return;
      greeted.current = true;
      timer.current = setTimeout(() => {
        setOpen(true);
        if (already) autoClose.current = setTimeout(() => setOpen(false), 8000);
      }, 900);
    };
    window.addEventListener("preloader:done", show, { once: true });
    const safety = setTimeout(show, 14000);
    return () => {
      window.removeEventListener("preloader:done", show);
      clearTimeout(safety);
      if (timer.current) clearTimeout(timer.current);
      if (autoClose.current) clearTimeout(autoClose.current);
    };
  }, []);

  // Moving to another page closes any open bubble / tour.
  useEffect(() => {
    setOpen(false);
    setStep(0);
    endNav(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Responsive size + measure the idle spot (the empty slot in the corner).
  useEffect(() => {
    if (!ready) return;
    const measure = () => {
      const small = window.innerWidth < 640;
      setSize(small ? { w: 92, h: 127 } : { w: 120, h: 166 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ready]);
  useEffect(() => {
    if (!ready) return;
    const place = () => {
      const r = slotRef.current?.getBoundingClientRect();
      if (r) setIdle({ x: r.left, y: r.top });
    };
    place();
    const id = setTimeout(place, 60);
    window.addEventListener("resize", place);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", place);
    };
  }, [ready, size]);

  // Footsteps while walking.
  useEffect(() => {
    if (!walking) return;
    const id = setInterval(sfxFoot, 270);
    return () => clearInterval(id);
  }, [walking]);

  const scrollTo = useCallback((sel?: string) => {
    if (!sel) return;
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ---- walking
  const walkTo = (target: { x: number; y: number }, after?: () => void) => {
    if (walkTimer.current) clearTimeout(walkTimer.current);
    const from = curPos.current;
    const dx = target.x - from.x;
    const dist = Math.hypot(dx, target.y - from.y);
    curPos.current = target;
    if (reduced.current || dist < 4) {
      setPos(target);
      setWalking(false);
      after?.();
      return;
    }
    const d = clamp(0.75 + dist / 1100, 0.85, 1.5);
    if (Math.abs(dx) > 30) setFacing(Math.sign(dx));
    setDur(d);
    setWalking(true);
    setPos(target);
    walkTimer.current = setTimeout(() => {
      setWalking(false);
      after?.();
    }, d * 1000 + 60);
  };

  const showNavStep = (i: number, list: NavItem[]) => {
    const it = list[i];
    if (!it) return;
    const r = it.el.getBoundingClientRect();
    setRect(r);
    setArrived(false);
    const cx = r.left + r.width / 2;
    sfxStep();
    walkTo(
      { x: clamp(cx - size.w / 2, 8, window.innerWidth - size.w - 8), y: r.bottom + 14 },
      () => setArrived(true)
    );
  };

  const lockPage = (on: boolean) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    const lenis = getLenis();
    if (on) lenis?.stop();
    else lenis?.start();
  };

  const startNav = () => {
    const list = buildNavItems();
    if (list.length < 3) return false; // nav is collapsed: use the section tour instead
    markSeen();
    setSeen(true);
    setOpen(false);
    getLenis()?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    lockPage(true);
    setMode("nav");
    setNi(0);
    // let the navbar slide back in before measuring
    setTimeout(() => {
      const fresh = buildNavItems();
      setItems(fresh);
      showNavStep(0, fresh);
    }, 400);
    return true;
  };

  const goNav = (i: number) => {
    setNi(i);
    showNavStep(i, items);
  };

  function endNav(walkBack = true) {
    if (!rect && mode === "none" && !walking && pos === null) return;
    lockPage(false);
    setMode("none");
    setRect(null);
    setArrived(false);
    if (walkBack && idle) walkTo(idle, () => setPos(null));
    else {
      if (walkTimer.current) clearTimeout(walkTimer.current);
      setWalking(false);
      setPos(null);
      if (idle) curPos.current = idle;
    }
  }

  // keep the spotlight + character aligned if the window is resized mid-tour
  useEffect(() => {
    if (mode !== "nav" || !items[ni]) return;
    const onResize = () => {
      const r = items[ni].el.getBoundingClientRect();
      setRect(r);
      const cx = r.left + r.width / 2;
      const t = { x: clamp(cx - size.w / 2, 8, window.innerWidth - size.w - 8), y: r.bottom + 14 };
      curPos.current = t;
      setPos(t);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && endNav(true);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ni, items, size]);

  useEffect(() => () => lockPage(false), []);

  // ---- section tour (narrow screens) + shared controls
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
    quietFor(1400);
    if (!startNav()) goto(1);
  };

  const askAgain = () => {
    keepOpen();
    sfxPip();
    setStep(0);
    setOpen(true);
  };

  if (!ready) return null;

  const home = pathname === "/";
  const s: Step =
    step === 0 && !home
      ? { text: "Hi, it's Temu Bhodbhar! 👋 Need a hand? Jump somewhere:" }
      : step === 0 && seen
        ? { text: "Welcome back! 👋 I'm always here if you want the tour or a hand finding something." }
        : STEPS[step];
  const last = step === STEPS.length - 1;
  const intro = step === 0;

  // character screen position
  const at = pos ?? idle;
  const touring = mode === "nav";
  const curItem = items[ni];
  const talking = open || (touring && arrived);

  // nav-tour bubble position (under the character, kept inside the viewport)
  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const bubbleW = Math.min(330, vw - 24);
  const bubbleLeft = rect ? clamp(rect.left + rect.width / 2 - bubbleW / 2, 12, vw - bubbleW - 12) : 12;
  const bubbleTop = (pos?.y ?? 100) + size.h + 2;

  const runGo = (g: NonNullable<NavDef["go"]>) => {
    const el = curItem?.el;
    if (g.click) {
      el?.click();
      return;
    }
    endNav(false);
    if (g.href) {
      window.location.href = g.href;
    } else if (g.hash) {
      setTimeout(() => scrollTo(g.hash), 60);
    }
  };

  return (
    <>
      {/* spotlight tour: dim everything except the current nav item */}
      {touring && rect && (
        <>
          <div className="tour-block" aria-hidden />
          <div
            className="tour-spot"
            aria-hidden
            style={{ left: rect.left - 10, top: rect.top - 7, width: rect.width + 20, height: rect.height + 14 }}
          />
        </>
      )}

      {/* the 3D character: fixed, walks between spots */}
      {at && (
        <button
          className={"b3d" + (walking ? " walking" : "")}
          onClick={() => {
            if (touring) return;
            unlockAudio();
            if (open) {
              sfxPip();
              markSeen();
              setSeen(true);
              setOpen(false);
              setStep(0);
            } else askAgain();
          }}
          style={{
            width: size.w,
            height: size.h,
            transform: `translate3d(${at.x}px, ${at.y}px, 0)`,
            transitionDuration: `${reduced.current ? 0 : dur}s`,
          }}
          aria-label={open ? "Close the guide" : "Ask Temu Bhodbhar for a tour"}
          title={touring ? "Temu Bhodbhar" : open ? "Close" : "Hi! I'm Temu Bhodbhar. Click me for a tour"}
        >
          {use3d ? (
            <Bhodbhar3D
              width={size.w}
              height={size.h}
              walking={walking}
              facing={facing}
              talking={talking}
              onFail={() => setUse3d(false)}
            />
          ) : (
            <div className="pip-char-inner" style={{ width: size.w, height: size.h }}>
              <PipFace />
            </div>
          )}
        </button>
      )}

      {/* nav-tour explanation: stays on screen while the page is dimmed */}
      <AnimatePresence>
        {touring && arrived && curItem && (
          <motion.div
            key={`nav-${ni}`}
            className="pip-bubble tour-bubble"
            style={{ left: bubbleLeft, top: bubbleTop, width: bubbleW }}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label={`${curItem.label}: ${curItem.text}`}
          >
            <button className="pip-x" onClick={() => endNav(true)} aria-label="End tour">
              ×
            </button>
            <div className="tour-tag">
              {curItem.label} <span>{ni + 1}/{items.length}</span>
            </div>
            <p className="pip-text">{curItem.text}</p>
            <div className="pip-dots" aria-hidden>
              {items.map((_, i) => (
                <span key={i} className={i <= ni ? "on" : ""} />
              ))}
            </div>
            <div className="pip-actions">
              {ni > 0 && (
                <button className="pip-btn" onClick={() => goNav(ni - 1)}>
                  Back
                </button>
              )}
              {curItem.go && (
                <button className="pip-btn" onClick={() => runGo(curItem.go!)}>
                  {curItem.go.label}
                </button>
              )}
              {ni < items.length - 1 ? (
                <button className="pip-btn solid" onClick={() => goNav(ni + 1)}>
                  Next
                </button>
              ) : (
                <button
                  className="pip-btn solid"
                  onClick={() => {
                    sfxDone();
                    endNav(true);
                  }}
                >
                  Done
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* idle corner: bubble + mute + the empty slot the character stands on */}
      <div className="pip-wrap" role="complementary" aria-label="Page guide">
        <AnimatePresence>
          {open && !touring && (
            <motion.div
              key="bubble"
              className="pip-bubble"
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={keepOpen}
              onClick={keepOpen}
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
                {intro && !home ? (
                  <>
                    <a className="pip-btn solid" href="/">Home</a>
                    <a className="pip-btn" href="/studio/">Studio</a>
                    <a className="pip-btn" href="/#services">Services</a>
                    <a className="pip-btn" href="/#contact">Contact</a>
                  </>
                ) : intro ? (
                  <>
                    <button className="pip-btn solid" onClick={start}>
                      {seen ? "Tour again" : "Show me around"}
                    </button>
                    <button className="pip-btn" onClick={finish}>
                      {seen ? "I'm good" : "No thanks"}
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
          style={{ left: size.w + 2 }}
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
        <div ref={slotRef} className="b3d-slot" style={{ width: size.w, height: size.h }} aria-hidden />
      </div>
    </>
  );
}
