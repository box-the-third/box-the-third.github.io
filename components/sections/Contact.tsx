"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { Reveal, RevealText } from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";

type Status = { type: "idle" | "ok" | "err" | "loading"; msg: string };

export default function Contact() {
  const [status, setStatus] = useState<Status>({ type: "idle", msg: "" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus({ type: "loading", msg: "Sending…" });
    try {
      const res = await fetch(site.formspreeEndpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus({ type: "ok", msg: "Thanks — I’ll get back to you within 24 hours." });
        form.reset();
      } else {
        setStatus({ type: "err", msg: "Something went wrong. Please email me directly." });
      }
    } catch {
      setStatus({ type: "err", msg: "Network error. Please email me directly." });
    }
  }

  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          Contact
        </div>
        <h2 className="sec-title">
          <RevealText text="Ready to" as="span" />{" "}
          <em>
            <RevealText text="get started?" as="span" delay={0.08} />
          </em>
        </h2>

        <div className="contact-grid">
          <Reveal>
            <p className="contact-lead">
              Have a project, a brand to grow, or an application to nail? Tell me what
              you’re working on — the first consultation is always free.
            </p>
            <div className="contact-list">
              <div className="contact-row">
                <span className="k">Email</span>
                <a href={`mailto:${site.email}`} data-cursor="Copy">
                  {site.email}
                </a>
              </div>
              <div className="contact-row">
                <span className="k">Phone</span>
                <a href={`tel:${site.phone}`}>{site.phone}</a>
              </div>
              <div className="contact-row">
                <span className="k">Location</span>
                <span>{site.location}</span>
              </div>
              {site.socials.map((s) => (
                <div className="contact-row" key={s.href}>
                  <span className="k">{s.label}</span>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.handle} ↗
                  </a>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="name">Your name</label>
                <input id="name" name="name" required placeholder="Jane Doe" />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@email.com"
                />
              </div>
              <div className="field">
                <label htmlFor="subject">What do you need?</label>
                <input
                  id="subject"
                  name="subject"
                  placeholder="UGC campaign, website, CV, SOP…"
                />
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Tell me a bit about your project…"
                />
              </div>
              <Magnetic>
                <button
                  type="submit"
                  className="btn solid"
                  disabled={status.type === "loading"}
                  data-cursor="Send"
                >
                  <span>
                    {status.type === "loading" ? "Sending…" : "Send message →"}
                  </span>
                </button>
              </Magnetic>
              <p
                className={`form-status ${
                  status.type === "ok" ? "ok" : status.type === "err" ? "err" : ""
                }`}
              >
                {status.msg}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
