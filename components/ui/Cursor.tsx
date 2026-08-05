"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom trailing cursor: a small dot that tracks instantly and a ring
 * that lags behind with easing. Grows + labels on interactive elements.
 * Disabled on touch / small screens (body keeps its native cursor).
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(max-width: 1024px)").matches) return;

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;

    const move = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
      setHidden(false);

      const el = (e.target as HTMLElement).closest(
        "a, button, [data-cursor]"
      ) as HTMLElement | null;
      if (el) {
        setActive(true);
        setLabel(el.getAttribute("data-cursor") || "");
      } else {
        setActive(false);
        setLabel("");
      }
    };

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.15;
      ringPos.y += (pos.y - ringPos.y) * 0.15;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const leave = () => setHidden(true);
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  // Only fill into a solid teal disc when there's a label to show
  // (buttons, cards, CTAs). Plain links/nav items get a hollow ring so
  // the text underneath stays readable.
  const solid = label.trim().length > 0;
  const size = solid ? 74 : active ? 46 : 34;

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          borderRadius: "50%",
          background: "var(--accent)",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: hidden ? 0 : 1,
          transition: "opacity .3s",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ring}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          display: "grid",
          placeItems: "center",
          width: size,
          height: size,
          borderRadius: "50%",
          border: `1.5px solid ${solid || active ? "var(--accent)" : "var(--line-strong)"}`,
          background: solid ? "var(--accent)" : "transparent",
          color: "var(--on-accent)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: hidden ? 0 : 1,
          transition:
            "width .35s var(--ease), height .35s var(--ease), background .35s var(--ease), opacity .3s",
        }}
      >
        {label}
      </div>
    </>
  );
}
