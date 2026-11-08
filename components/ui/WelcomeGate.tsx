"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { legalDocs, LegalDoc } from "@/content/legal";
import LegalModal from "@/components/ui/LegalModal";
import { isGuest, setGuest } from "@/lib/guest";
import { signInWithGoogle } from "@/lib/oauth";

const PERKS = [
  { b: "Live order status", t: "see every step, no email digging" },
  { b: "Consultations", t: "book and join from one place" },
  { b: "Free revisions", t: "always included, request in seconds" },
];

type GateWindow = Window & { lenis?: { stop: () => void; start: () => void } };

/**
 * First thing a signed-out visitor sees on the home page: sign in with Google,
 * use email, or continue as a guest. Guests browse freely, and Temu Bhodbhar
 * (the Guide) invites them to sign in when they reach for a member feature.
 *
 * `<html data-gate>` tells the Guide to hold his greeting until we are done.
 */
export default function WelcomeGate() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"pending" | "open" | "done">("pending");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openDoc, setOpenDoc] = useState<LegalDoc | null>(null);

  const finish = useCallback(() => {
    setPhase("done");
    document.documentElement.removeAttribute("data-gate");
    window.dispatchEvent(new Event("gate:done"));
  }, []);

  // Only the home page, only signed-out visitors who have not chosen guest yet.
  useEffect(() => {
    if (phase !== "pending") return;
    if (pathname !== "/" || isGuest()) return finish();
    document.documentElement.setAttribute("data-gate", "1");
    if (loading) return;
    if (user) finish();
    else setPhase("open");
  }, [phase, pathname, loading, user, finish]);

  // Freeze the page behind the gate.
  useEffect(() => {
    if (phase !== "open") return;
    const lenis = (window as GateWindow).lenis;
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.documentElement.style.overflow = "";
      lenis?.start();
    };
  }, [phase]);

  if (phase !== "open") return null;

  const asGuest = () => {
    setGuest(true);
    finish();
  };

  const google = async () => {
    setBusy(true);
    setErr(null);
    const e = await signInWithGoogle();
    if (e) {
      setErr(e);
      setBusy(false);
    }
  };

  return (
    <div className="gate" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="login-cta gate-card">
        <div className="login-cta-copy">
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            Welcome back
          </div>
          <h2 className="login-cta-title">
            Your boring things, <em>organized neatly.</em>
          </h2>
          <p className="login-cta-sub">
            Manage your orders, access consultations, and request free revisions in seconds.
          </p>
          <ul className="lc-perks">
            {PERKS.map((p) => (
              <li key={p.b}>
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>
                  <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6 10.4l2.8 2.8L14 7.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>
                  <b>{p.b}</b> {p.t}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="login-cta-actions">
          <button className="oauth-btn lc-btn" onClick={google} disabled={busy} data-cursor="Google">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.3 7.4 24 12 24z" />
              <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.4-.4-2.4s.2-1.7.4-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z" />
            </svg>
            {busy ? "Redirecting…" : "Continue with Google"}
          </button>
          <a href="/login/" className="oauth-btn lc-btn gate-email" data-cursor="Email">
            Create an account with email →
          </a>
          <button className="login-cta-alt gate-skip" onClick={asGuest} data-cursor="Skip">
            Continue without email
          </button>
          <p className="login-cta-consent">
            By signing in, you agree to our{" "}
            <button className="consent-link" onClick={() => setOpenDoc(legalDocs.terms)} data-cursor="View">
              Terms of Service
            </button>{" "}
            &amp;{" "}
            <button className="consent-link" onClick={() => setOpenDoc(legalDocs.privacy)} data-cursor="View">
              Privacy Policy
            </button>
            .
          </p>
          {err && <p className="form-status err">{err}</p>}
        </div>
      </div>
      <LegalModal doc={openDoc} onClose={() => setOpenDoc(null)} />
    </div>
  );
}
