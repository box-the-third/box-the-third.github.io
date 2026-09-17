"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/ui/Magnetic";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthModal from "@/components/ui/AuthModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { cartCount } from "@/lib/cart";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cart, setCart] = useState(0);
  const { session, user } = useAuth();

  // A short, friendly label + initial for the signed-in chip.
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    "";
  const firstName = displayName.split(/[\s@]/)[0] || "Account";
  const initial = (displayName.trim()[0] || "•").toUpperCase();

  // On the homepage the nav anchors scroll in-page (via Lenis); on any other
  // route (e.g. /dashboard/) they need a leading "/" so they navigate home
  // and then jump to the section, instead of doing nothing.
  const pathname = usePathname();
  const onHome = pathname === "/";
  const toHref = (hash: string) => (onHome ? hash : `/${hash}`);

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

  // Let any part of the site open the auth modal (e.g. "add to cart" while logged out).
  useEffect(() => {
    const openAuth = () => setAuthOpen(true);
    window.addEventListener("auth:open", openAuth);
    return () => window.removeEventListener("auth:open", openAuth);
  }, []);

  // Keep the cart badge in sync with the visitor's saved selections. Re-runs
  // whenever the session changes (login/logout) and on any cart:changed event.
  useEffect(() => {
    const refresh = () => cartCount(session).then(setCart);
    refresh();
    window.addEventListener("cart:changed", refresh);
    return () => window.removeEventListener("cart:changed", refresh);
  }, [session]);

  return (
    <>
      <header className={cn("nav", scrolled && "scrolled", hidden && "hidden")}>
        <a href={onHome ? "#home" : "/"} className="nav-logo" data-cursor="Top">
          {site.shortName}
          <span>.</span>
        </a>

        <div className="nav-right">
          <nav className="nav-links">
            {site.nav.map((item) => (
              <Magnetic key={item.href} strength={0.25}>
                <a href={toHref(item.href)}>{item.label}</a>
              </Magnetic>
            ))}
            {user ? (
              <Magnetic strength={0.25}>
                <a href="/dashboard/" className="nav-account" data-cursor="Dashboard" title="Your dashboard">
                  <span className="nav-account-dot">{initial}</span>
                  <span className="nav-account-name">{firstName}</span>
                </a>
              </Magnetic>
            ) : (
              <button
                className="nav-cta"
                onClick={() => setAuthOpen(true)}
                data-cursor="Join"
              >
                <span>Create account</span>
              </button>
            )}
          </nav>

          <a
            href="/dashboard/"
            className="nav-cart"
            aria-label={cart > 0 ? `Cart, ${cart} items` : "Your dashboard"}
            title="Your cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6L5 3H2" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {cart > 0 && <span className="nav-cart-count">{cart}</span>}
          </a>

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
              <a key={item.href} href={toHref(item.href)} onClick={() => setOpen(false)}>
                <span>0{i + 1}</span>
                {item.label}
              </a>
            ))}
            {user ? (
              <a
                href="/dashboard/"
                onClick={() => setOpen(false)}
                style={{ color: "var(--accent)" }}
              >
                <span>→</span>
                Your dashboard
              </a>
            ) : (
              <a
                href={toHref("#account")}
                onClick={() => {
                  setOpen(false);
                  setAuthOpen(true);
                }}
                style={{ color: "var(--accent)" }}
              >
                <span>→</span>
                Create account
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
