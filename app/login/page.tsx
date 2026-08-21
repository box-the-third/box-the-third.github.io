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
