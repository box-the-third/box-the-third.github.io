"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getProfile,
  getSelections,
  removeSelection,
  resolvePending,
  markRequestSent,
  Profile,
  Selection,
} from "@/lib/dashboard";
import { Reveal } from "@/components/ui/Reveal";

const WHATSAPP = "8801300984267";
const FORMSPREE = "https://formspree.io/f/mjkarwza";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();

  const [loadingCart, setLoadingCart] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cart, setCart] = useState<Selection[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [profession, setProfession] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | ""; msg: string }>({ kind: "", msg: "" });
  const [sent, setSent] = useState<null | "email" | "whatsapp">(null);
  const touched = useRef(false); // stop clobbering the user's edits on cart refresh

  const firstName = profile?.full_name ? profile.full_name.split(" ")[0] : "";

  const cartLines = useCallback(
    (list: Selection[]) =>
      list.length
        ? list
            .map((s) => `- ${s.packages?.service_name || "Service"} (${s.packages?.tier_label || ""})`)
            .join("\n")
        : "- (add a service from the site first)",
    []
  );

  const buildTemplate = useCallback(
    (list: Selection[], name: string) =>
      [
        "Hi Nahiyan,",
        "",
        "I'd like to move forward with:",
        cartLines(list),
        "",
        "What I'm applying for: [the role, program or goal you're targeting]",
        "Why I need this: [a sentence on why this matters to you]",
        "My timeline: [when you need it done]",
        "",
        "Looking forward to hearing from you.",
        "",
        name,
      ]
        .join("\n")
        .trim(),
    [cartLines]
  );

  // Gate: once auth has resolved, bounce anonymous visitors to sign in.
  useEffect(() => {
    if (!loading && !user) window.location.href = "/login/";
  }, [loading, user]);

  // Load the profile + cart once we know who the user is.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const [prof, list] = await Promise.all([
          getProfile(user.id).catch(() => null),
          (async () => {
            try {
              await resolvePending(user.id);
            } catch {
              /* best-effort */
            }
            return getSelections(user.id).catch(() => []);
          })(),
        ]);
        if (!alive) return;
        setProfile(prof);
        setCart(list);
        if (!touched.current) setMessage(buildTemplate(list, prof?.full_name || ""));
      } catch (e) {
        console.error("[dashboard] load failed", e);
        if (alive) setLoadError("We couldn't load your dashboard. Please refresh and try again.");
      } finally {
        if (alive) setLoadingCart(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, buildTemplate]);

  async function reloadCart() {
    if (!user) return;
    const list = await getSelections(user.id);
    setCart(list);
    window.dispatchEvent(new Event("cart:changed"));
    if (!touched.current) setMessage(buildTemplate(list, profile?.full_name || ""));
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    await removeSelection(id);
    await reloadCart();
    setRemovingId(null);
  }

  function fullMessage() {
    return (profession.trim() ? `Applying for: ${profession.trim()}\n\n` : "") + message.trim();
  }

  async function sendRequest() {
    if (!user) return;
    if (!message.trim()) {
      setStatus({ kind: "err", msg: "Please write a short message first." });
      return;
    }
    setSending(true);
    setStatus({ kind: "", msg: "Sending your request…" });

    const fd = new FormData();
    fd.append("name", profile?.full_name || "");
    fd.append("email", user.email || "");
    fd.append("_replyto", user.email || "");
    fd.append("_subject", `New service request from ${profile?.full_name || user.email}`);
    fd.append("cart", cartLines(cart));
    fd.append("message", fullMessage());

    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      if (!res.ok) throw new Error("send failed");
      await markRequestSent(user.id, fullMessage());
      setStatus({ kind: "", msg: "" });
      setSent("email");
      await reloadCart();
    } catch {
      setStatus({
        kind: "err",
        msg: "Could not send via email. Please try the WhatsApp button instead.",
      });
    } finally {
      setSending(false);
    }
  }

  function sendWhatsApp() {
    if (!user) return;
    if (!message.trim()) {
      setStatus({ kind: "err", msg: "Please write a short message first." });
      return;
    }
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(fullMessage())}`,
      "_blank",
      "noopener"
    );
    markRequestSent(user.id, fullMessage());
    setSent("whatsapp");
    reloadCart();
  }

  function backToDashboard() {
    setSent(null);
    setStatus({ kind: "", msg: "" });
    touched.current = false;
    setMessage(buildTemplate(cart, profile?.full_name || ""));
  }

  // Auth still resolving, or the redirect for anonymous users is in flight.
  if (loading || !user) {
    return (
      <section className="section" id="dashboard">
        <div className="container">
          <div className="dash-loading">Loading your dashboard…</div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" id="dashboard">
      <div className="container">
        {loadError && (
          <div className="dash-error" role="alert">
            {loadError}
          </div>
        )}
        <Reveal>
          <div className="dash-top">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dash-logo" src="/assets/yasnav.png" alt="YAS Beyond Education" />
              <div className="eyebrow" style={{ marginTop: 20, marginBottom: 16 }}>
                Client Dashboard
              </div>
              <h1 className="sec-title">
                Welcome back{firstName ? <>, <em>{firstName}.</em></> : <em>.</em>}
              </h1>
              <p className="sec-sub" style={{ marginTop: 18 }}>
                Review the plans in your cart and send Nahiyan your request. He replies
                personally over email or WhatsApp, usually within 24 hours.
              </p>
            </div>
            <button className="btn dash-signout" onClick={signOut} data-cursor="Out">
              <span>Sign out</span>
            </button>
          </div>
        </Reveal>

        <div className="dash-grid">
          <Reveal delay={0.05}>
            <div className="dash-card">
              <div className="dash-card-label">
                <span className="svc-step-n">01</span> Account
              </div>
              <div className="dash-profile">
                <div className="dash-profile-row">
                  <span className="dash-profile-k">Name</span>
                  <span className="dash-profile-v">{profile?.full_name || "Not set"}</span>
                </div>
                <div className="dash-profile-row">
                  <span className="dash-profile-k">Email</span>
                  <span className="dash-profile-v">{user.email}</span>
                </div>
                <div className="dash-profile-row">
                  <span className="dash-profile-k">Member since</span>
                  <span className="dash-profile-v">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="dash-card">
              <div className="dash-card-label">
                <span className="svc-step-n">02</span> Your cart
              </div>
              {loadingCart ? (
                <div className="dash-empty">Loading your cart…</div>
              ) : cart.length === 0 ? (
                <div className="dash-empty">
                  Your cart is empty. <a href="/#services">Browse services</a> to add one.
                </div>
              ) : (
                <ul className="dash-cart">
                  {cart.map((s) => (
                    <li className="dash-cart-item" key={s.id}>
                      <span className="dash-cart-info">
                        <strong>{s.packages?.service_name || "Service"}</strong>
                        <span>{s.packages?.tier_label || ""}</span>
                      </span>
                      <span className="dash-cart-meta">
                        <span className="dash-cart-price">
                          ৳{Number(s.packages?.price_bdt || 0).toLocaleString()}
                        </span>
                        <span className={`dash-badge ${s.status}`}>
                          {s.status.replace(/_/g, " ")}
                        </span>
                        <button
                          className="dash-remove"
                          onClick={() => handleRemove(s.id)}
                          disabled={removingId === s.id}
                          aria-label="Remove from cart"
                          title="Remove from cart"
                        >
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="dash-request">
            {sent ? (
              <div className="dash-card dash-thankyou">
                <div className="dash-thankyou-mark" aria-hidden>
                  ✓
                </div>
                <h3>Thank you{firstName ? `, ${firstName}` : ""}.</h3>
                <p>
                  {sent === "whatsapp"
                    ? "Your request is ready in WhatsApp — hit send there and Nahiyan will get back to you."
                    : "Your request is on its way."}{" "}
                  Nahiyan reviews every request personally and replies over email or WhatsApp,
                  usually within 24 hours.
                </p>
                <button className="btn solid" onClick={backToDashboard} data-cursor="Back">
                  <span>← Back to your dashboard</span>
                </button>
              </div>
            ) : (
              <div className="dash-card dash-request-card">
                <div className="dash-card-label">
                  <span className="svc-step-n">03</span> Send your request
                </div>
                <p className="dash-hint">
                  Tell Nahiyan what you need and why. He reviews every request personally and
                  replies over email or WhatsApp.
                </p>

                <div className="field">
                  <label htmlFor="req-profession">What are you applying for? (optional)</label>
                  <input
                    id="req-profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Software Engineer role, Master's in the UK"
                  />
                </div>
                <div className="field">
                  <label htmlFor="req-message">Your message</label>
                  <textarea
                    id="req-message"
                    value={message}
                    onChange={(e) => {
                      touched.current = true;
                      setMessage(e.target.value);
                    }}
                    placeholder="Add a service to your cart, then tell Nahiyan a bit about your goal."
                    style={{ minHeight: 200 }}
                  />
                </div>

                <div className="dash-req-actions">
                  <button
                    className="btn solid"
                    onClick={sendRequest}
                    disabled={sending}
                    data-cursor="Send"
                  >
                    <span>{sending ? "Sending…" : "Send request →"}</span>
                  </button>
                  <button className="btn dash-wa" onClick={sendWhatsApp} data-cursor="WhatsApp">
                    <span>Send on WhatsApp</span>
                  </button>
                  <button
                    className="dash-reset"
                    onClick={() => {
                      touched.current = false;
                      setMessage(buildTemplate(cart, profile?.full_name || ""));
                    }}
                  >
                    Reset template
                  </button>
                </div>
                {status.msg && <p className={`form-status ${status.kind}`}>{status.msg}</p>}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
