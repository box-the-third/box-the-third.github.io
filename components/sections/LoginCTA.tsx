"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { legalDocs, LegalDoc } from "@/content/legal";
import LegalModal from "@/components/ui/LegalModal";
import Magnetic from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";

const DASHBOARD = "/dashboard/";

const PERKS = [
  { b: "Live order status", t: "see every step, no email digging" },
  { b: "Consultations", t: "book and join from one place" },
  { b: "Free revisions", t: "always included, request in seconds" },
];

const Check = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>
    <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 10.4l2.8 2.8L14 7.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Premium monochrome sign-in card near the top of the page body. */
export default function LoginCTA() {
  const { user } = useAuth();
  const signedIn = !!user;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openDoc, setOpenDoc] = useState<LegalDoc | null>(null);

  async function google() {
    setBusy(true);
    setErr(null);
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/oauth/consent/` },
    });
    if (error) {
      setErr(error.message);
      setBusy(false);
    }
  }

  return (
    <section className="section login-cta-section" id="account">
      <div className="container">
        <Reveal>
          <div
            className="login-cta"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
          >
            <span className="lc-light" aria-hidden />
            <div className="login-cta-copy">
              <div className="eyebrow" style={{ marginBottom: 18 }}>
                Welcome back
              </div>
              <h2 className="login-cta-title">
                {signedIn ? (
                  <>You&rsquo;re signed in.</>
                ) : (
                  <>
                    Your project hub, <em>all in one place.</em>
                  </>
                )}
              </h2>
              <p className="login-cta-sub">
                {signedIn
                  ? "Jump back into your dashboard to see your orders, consultations and revisions."
                  : "Manage your orders, access consultations, and request free revisions in seconds."}
              </p>
              {!signedIn && (
                <ul className="lc-perks">
                  {PERKS.map((p) => (
                    <li key={p.b}>
                      <Check />
                      <span>
                        <b>{p.b}</b> {p.t}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="login-cta-actions">
              {signedIn ? (
                <Magnetic>
                  <a href={DASHBOARD} className="oauth-btn lc-btn" data-cursor="Open">
                    Go to dashboard →
                  </a>
                </Magnetic>
              ) : (
                <>
                  <div className="lc-secure">
                    <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden>
                      <path d="M10 2l6 2.4v4.7c0 4-2.5 6.9-6 8.4-3.5-1.5-6-4.4-6-8.4V4.4L10 2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      <path d="M7.2 10l2 2 3.6-3.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Secure 1-click access
                  </div>
                  <button
                    className="oauth-btn lc-btn"
                    onClick={google}
                    disabled={busy}
                    data-cursor="Google"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
                      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.3 7.4 24 12 24z" />
                      <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.4-.4-2.4s.2-1.7.4-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z" />
                      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z" />
                    </svg>
                    {busy ? "Redirecting…" : "Continue with Google"}
                  </button>
                  <a href="/login/" className="login-cta-alt" data-cursor="Email">
                    Or continue with email →
                  </a>
                  <p className="login-cta-consent">
                    By continuing, you agree to our{" "}
                    <button
                      className="consent-link"
                      onClick={() => setOpenDoc(legalDocs.terms)}
                      data-cursor="View"
                    >
                      Terms of Service
                    </button>{" "}
                    &amp;{" "}
                    <button
                      className="consent-link"
                      onClick={() => setOpenDoc(legalDocs.privacy)}
                      data-cursor="View"
                    >
                      Privacy Policy
                    </button>
                    .
                  </p>
                  {err && <p className="form-status err">{err}</p>}
                </>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      <LegalModal doc={openDoc} onClose={() => setOpenDoc(null)} />
    </section>
  );
}
