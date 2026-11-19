"use client";

import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════════
//  Fist-bump discount: after someone picks a service, Temu Bhodbhar
//  runs over for a fist bump that unlocks 5% off. It's a one-off per
//  device, saved here until the request is sent, then marked used.
// ═══════════════════════════════════════════════════════════════

export const BUMP = { pct: 5, code: "BUMP5" } as const;

const KEY = "yas_bump_v1";
type Bump = { at: number; used?: number };

export function readBump(): Bump | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}
const write = (b: Bump) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(b));
  } catch {}
  window.dispatchEvent(new Event("perk:changed"));
};

/** True while the 5% is unlocked and not yet used on a request. */
export const bumpActive = () => {
  const b = readBump();
  return Boolean(b && !b.used);
};

export const unlockBump = () => write({ at: Date.now() });
export const markBumpUsed = () => {
  const b = readBump();
  if (b && !b.used) write({ ...b, used: Date.now() });
};

/** Ask Temu Bhodbhar to run over for the fist bump (only if it hasn't happened on this device). */
export function requestFistBump(service?: string) {
  if (readBump()) return;
  window.dispatchEvent(new CustomEvent("pip:fistbump", { detail: { service } }));
}

/** React hook: is the discount live right now? Re-renders when it changes. */
export function useBumpActive() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(bumpActive());
    sync();
    window.addEventListener("perk:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("perk:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}
