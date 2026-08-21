"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { site } from "@/content/site";
import { legalDocs, LegalDoc } from "@/content/legal";
import LegalModal from "@/components/ui/LegalModal";

type Mode = "signin" | "signup";
type Status = { kind: "idle" | "loading" | "ok" | "err"; msg: string };

const DASHBOARD = "/dashboard.html";
const AGREED_KEY = "yas_legal_agreed";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });
  const [checking, setChecking] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [openDoc, setOpenDoc] = useState<LegalDoc | null>(null);

  // Remember agreement so returning users are not asked again.
  useEffect(() => {
    try {
      setAgreed(localStorage.getItem(AGREED_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const setAgree = (v: boolean) => {
    setAgreed(v);
    try {
      if (v) localStorage.setItem(AGREED_KEY, "1");
      else localStorage.removeItem(AGREED_KEY);
    } catch {
      /* ignore */
    }
    if (v && status.kind === "err") setStatus({ kind: "idle", msg: "" });
  };

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    let cancelled = false;
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (cancelled) return;
        if (data.session) window.location.href = DASHBOARD;
        else setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const fullName = String(fd.get("fullName") || "").trim();
    const supabase = getSupabase();

    if (!agreed) {
      setStatus({
        kind: "err",
        msg: "Please review and agree to the Privacy Policy and Terms of Service to continue.",
      });
      return;
    }

    setStatus({ kind: "loading", msg: mode === "signin" ? "Signing in…" : "Creating account…" });

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus({ kind: "err", msg: error.message });
        return;
      }
      setStatus({ kind: "ok", msg: "Welcome back! Redirecting…" });
      window.location.href = DASHBOARD;
      return;
    }

    // sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // Send the confirmation link back to THIS site's sign-in page
        // (uses the real origin in prod, so no more localhost links).
        emailRedirectTo: `${window.location.origin}/login/`,
      },
    });
    if (error) {
      setStatus({ kind: "err", msg: error.message });
      return;
    }
    if (data.session) {
      // Auto-confirm is on → we're logged in immediately.
      setStatus({ kind: "ok", msg: "Account created! Redirecting…" });
      window.location.href = DASHBOARD;
    } else {
      // Email confirmation required.
      setStatus({
        kind: "ok",
        msg: "Account created, check your email to confirm, then sign in.",
      });
      setTimeout(() => {
        setMode("signin");
        setStatus({ kind: "idle", msg: "" });
      }, 3200);
    }
  }

  async function google() {
    if (!agreed) {
      setStatus({
        kind: "err",
        msg: "Please review and agree to the Privacy Policy and Terms of Service to continue.",
      });
      return;
    }
    setStatus({ kind: "loading", msg: "Redirecting to Google…" });
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      // Google + Supabase send the user back here to finish signing in.
      options: { redirectTo: `${window.location.origin}/oauth/consent/` },
    });
    if (error) setStatus({ kind: "err", msg: error.message });
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <a href="/" className="auth-logo" data-cursor="Home">
          {site.shortName}
          <span>.</span>
        </a>

        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === "signin"}
            className={mode === "signin" ? "active" : ""}
            onClick={() => {
              setMode("signin");
              setStatus({ kind: "idle", msg: "" });
            }}
          >
            Sign in
          </button>
          <button
            role="tab"
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setStatus({ kind: "idle", msg: "" });
            }}
          >
            Create account
          </button>
        </div>

        <h1 className="auth-title">
          {mode === "signin" ? (
            <>
              Welcome <em>back.</em>
            </>
          ) : (
            <>
              Get <em>started.</em>
            </>
          )}
        </h1>
        <p className="auth-sub">
          {mode === "signin"
            ? "Sign in to track your orders and consultations."
            : "One account to track every service you order from YAS."}
        </p>

        {!checking && (
          <>
            <label className="consent">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span className="consent-box" aria-hidden />
              <span className="consent-text">
                I have read and agree to the{" "}
                <button
                  type="button"
                  className="consent-link"
                  onClick={() => setOpenDoc(legalDocs.privacy)}
                  data-cursor="View"
                >
                  Privacy Policy
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="consent-link"
                  onClick={() => setOpenDoc(legalDocs.terms)}
                  data-cursor="View"
                >
                  Terms of Service
                </button>
                .
              </span>
            </label>

            <button
              type="button"
              className="oauth-btn"
              onClick={google}
              disabled={status.kind === "loading" || !agreed}
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

            <div className="auth-divider">
              <span>or use your email</span>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="field">
                  <label htmlFor="fullName">Full name</label>
                  <input id="fullName" name="fullName" required placeholder="Your name" />
                </div>
              )}
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
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
                disabled={status.kind === "loading" || !agreed}
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

              <p
                className={`form-status ${
                  status.kind === "ok" ? "ok" : status.kind === "err" ? "err" : ""
                }`}
              >
                {status.msg}
              </p>
            </form>
          </>
        )}

        <p className="auth-foot">
          Your account is used solely to track your YAS Beyond Education orders and
          consultations.
        </p>
      </div>

      <LegalModal
        doc={openDoc}
        onClose={() => setOpenDoc(null)}
        onAgree={() => {
          setAgree(true);
          setOpenDoc(null);
        }}
      />
    </section>
  );
}
