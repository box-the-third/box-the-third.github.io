"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { site } from "@/content/site";
import Magnetic from "@/components/ui/Magnetic";

type Mode = "signin" | "signup";
type Status = { kind: "idle" | "loading" | "ok" | "err"; msg: string };

const DASHBOARD = "/dashboard.html";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });
  const [checking, setChecking] = useState(true);

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

            <Magnetic>
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
            </Magnetic>

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
    </section>
  );
}
