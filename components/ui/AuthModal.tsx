"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSupabase } from "@/lib/supabase";
import { legalDocs, LegalDoc } from "@/content/legal";
import LegalModal from "@/components/ui/LegalModal";

const DASHBOARD = "/dashboard/";
type Status = { kind: "idle" | "loading" | "ok" | "err"; msg: string };
type Mode = "signup" | "signin";
type View = "choices" | "email";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("signup");
  const [view, setView] = useState<View>("choices");
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });
  const [openDoc, setOpenDoc] = useState<LegalDoc | null>(null);

  // Reset to the first screen each time it opens; lock scroll + Escape close.
  useEffect(() => {
    if (!open) return;
    setMode("signup");
    setView("choices");
    setStatus({ kind: "idle", msg: "" });
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  async function google() {
    setStatus({ kind: "loading", msg: "Redirecting to Google…" });
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/oauth/consent/` },
    });
    if (error) setStatus({ kind: "err", msg: error.message });
  }

  async function submitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const fullName = String(fd.get("fullName") || "").trim();
    const supabase = getSupabase();
    setStatus({
      kind: "loading",
      msg: mode === "signin" ? "Signing in…" : "Creating account…",
    });

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setStatus({ kind: "err", msg: error.message });
      window.location.href = DASHBOARD;
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login/`,
      },
    });
    if (error) return setStatus({ kind: "err", msg: error.message });
    if (data.session) {
      window.location.href = DASHBOARD;
    } else {
      setStatus({
        kind: "ok",
        msg: "Account created, check your email to confirm, then sign in.",
      });
      setTimeout(() => {
        setMode("signin");
        setStatus({ kind: "idle", msg: "" });
      }, 2800);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="authm-overlay"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          >
            <motion.div
              className="authm-card"
              role="dialog"
              aria-modal="true"
              aria-label="Create a YAS Account"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="authm-close"
                onClick={onClose}
                aria-label="Close"
                data-cursor="Close"
              >
                ✕
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="authm-logo" src="/assets/yasnav.png" alt="YAS Beyond Education" />
              <h2 className="authm-title">
                {mode === "signup" ? "Create a YAS Account" : "Welcome back to YAS"}
              </h2>

              {view === "choices" ? (
                <div className="authm-choices">
                  <button
                    className="oauth-btn"
                    onClick={google}
                    disabled={status.kind === "loading"}
                    data-cursor="Google"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
                      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.3 7.4 24 12 24z" />
                      <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.4-.4-2.4s.2-1.7.4-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z" />
                      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z" />
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    className="oauth-btn"
                    onClick={() => {
                      setView("email");
                      setStatus({ kind: "idle", msg: "" });
                    }}
                    data-cursor="Email"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                      <rect x="3" y="5" width="18" height="14" rx="2.5" />
                      <path d="M4 7l8 5.5L20 7" />
                    </svg>
                    Continue with Email
                  </button>
                </div>
              ) : (
                <form className="authm-form" onSubmit={submitEmail}>
                  {mode === "signup" && (
                    <div className="field">
                      <label htmlFor="am-name">Full name</label>
                      <input id="am-name" name="fullName" required placeholder="Your name" />
                    </div>
                  )}
                  <div className="field">
                    <label htmlFor="am-email">Email</label>
                    <input
                      id="am-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="am-pass">Password</label>
                    <input
                      id="am-pass"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn solid"
                    style={{ width: "100%", justifyContent: "center" }}
                    disabled={status.kind === "loading"}
                    data-cursor={mode === "signin" ? "Sign in" : "Create"}
                  >
                    <span>
                      {status.kind === "loading"
                        ? "Please wait…"
                        : mode === "signin"
                          ? "Sign in →"
                          : "Create account →"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="authm-back"
                    onClick={() => {
                      setView("choices");
                      setStatus({ kind: "idle", msg: "" });
                    }}
                    data-cursor="Back"
                  >
                    ← Other options
                  </button>
                </form>
              )}

              {status.msg && (
                <p
                  className={`form-status ${
                    status.kind === "ok" ? "ok" : status.kind === "err" ? "err" : ""
                  }`}
                  style={{ textAlign: "center" }}
                >
                  {status.msg}
                </p>
              )}

              <div className="authm-switch">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setMode("signin");
                        setView("email");
                        setStatus({ kind: "idle", msg: "" });
                      }}
                      data-cursor="Log in"
                    >
                      Log in
                    </button>
                  </>
                ) : (
                  <>
                    Need an account?{" "}
                    <button
                      onClick={() => {
                        setMode("signup");
                        setView("choices");
                        setStatus({ kind: "idle", msg: "" });
                      }}
                      data-cursor="Create"
                    >
                      Create one
                    </button>
                  </>
                )}
              </div>

              <p className="authm-legal">
                By continuing you agree to our{" "}
                <button
                  className="consent-link"
                  onClick={() => setOpenDoc(legalDocs.privacy)}
                  data-cursor="View"
                >
                  Privacy Policy
                </button>{" "}
                and{" "}
                <button
                  className="consent-link"
                  onClick={() => setOpenDoc(legalDocs.terms)}
                  data-cursor="View"
                >
                  Terms of Service
                </button>
                .
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rendered as a sibling so its backdrop click never closes the auth modal */}
      <LegalModal doc={openDoc} onClose={() => setOpenDoc(null)} />
    </>
  );
}
