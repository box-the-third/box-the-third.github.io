"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { site } from "@/content/site";

const DASHBOARD = "/dashboard.html";

/**
 * OAuth return page. Google (via Supabase) redirects here after consent.
 * The Supabase client automatically exchanges the code in the URL for a
 * session; once that lands we forward the user to their dashboard.
 */
export default function OAuthConsent() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    let done = false;
    const go = () => {
      if (!done) {
        done = true;
        window.location.href = DASHBOARD;
      }
    };

    // Surface any error the provider sent back in the URL.
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const providerError =
      q.get("error_description") ||
      h.get("error_description") ||
      q.get("error") ||
      h.get("error");
    if (providerError) {
      setError(providerError.replace(/\+/g, " "));
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) go();
    });

    // Fallback if nothing resolves within a few seconds.
    const t = setTimeout(() => {
      if (done) return;
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) go();
        else setError("We could not complete your sign in. Please try again.");
      });
    }, 7000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  return (
    <section className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <a href="/" className="auth-logo" data-cursor="Home">
          {site.shortName}
          <span>.</span>
        </a>

        <h1 className="auth-title" style={{ marginTop: 22 }}>
          {error ? (
            <>
              Sign in <em>failed.</em>
            </>
          ) : (
            <>
              Signing you <em>in…</em>
            </>
          )}
        </h1>
        <p className="auth-sub">
          {error ? error : "Finishing your Google sign in, one moment."}
        </p>

        {error ? (
          <a href="/login/" className="btn solid" data-cursor="Back">
            <span>Back to sign in →</span>
          </a>
        ) : (
          <div className="oauth-spinner" aria-hidden />
        )}
      </div>
    </section>
  );
}
