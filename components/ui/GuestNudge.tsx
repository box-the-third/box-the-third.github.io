"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { isGuest } from "@/lib/guest";

// Member-only actions. A guest can read and browse everything else.
const MEMBER_ONLY = [
  'a[href^="/studio"]',
  'a[href^="/dashboard"]',
  ".nav-cart",
  ".svc-add",
  "#offer .btn",
  '#contact button[type="submit"]',
].join(",");

/**
 * In guest mode, reaching for a member feature does not do it: Temu Bhodbhar
 * steps in and asks them to sign in to enjoy the services.
 */
export default function GuestNudge() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || user) return;
    const onClick = (e: MouseEvent) => {
      if (!isGuest()) return;
      const hit = (e.target as HTMLElement | null)?.closest?.(MEMBER_ONLY);
      if (!hit) return;
      e.preventDefault();
      e.stopPropagation();
      window.dispatchEvent(new Event("guide:signin"));
    };
    // capture phase: runs before the page's own handlers
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [user, loading]);

  return null;
}
