"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/ui/Magnetic";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthModal from "@/components/ui/AuthModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 300 && y > last && !open);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header className={cn("nav", scrolled && "scrolled", hidden && "hidden")}>
        <a href="#home" className="nav-logo" data-cursor="Top">
          {site.shortName}
          <span>.</span>
        </a>

        <div className="nav-right">
          <nav className="nav-links">
            {site.nav.map((item) => (
              <Magnetic key={item.href} strength={0.25}>
                <a href={item.href}>{item.label}</a>
              </Magnetic>
            ))}
            <button
              className="nav-cta"
              onClick={() => setAuthOpen(true)}
              data-cursor="Join"
            >
              <span>Create account</span>
            </button>
          </nav>

          <ThemeToggle />

          <button
            className={cn("nav-toggle", open && "open")}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {site.nav.map((item, i) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <span>0{i + 1}</span>
                {item.label}
              </a>
            ))}
            <a
              href="#account"
              onClick={() => {
                setOpen(false);
                setAuthOpen(true);
              }}
              style={{ color: "var(--accent)" }}
            >
              <span>→</span>
              Create account
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
