"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  /** True until we know for sure whether someone is signed in. */
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

/** Read the current auth state anywhere in the tree. */
export const useAuth = () => useContext(AuthContext);

/**
 * Single source of truth for auth across the app.
 *
 * We subscribe with `onAuthStateChange` instead of awaiting `getSession()`.
 * The listener fires an INITIAL_SESSION event right away with whatever is in
 * storage and then quietly handles token refreshes in the background — it
 * never blocks on the auth lock the way `getSession()` can (which was leaving
 * the dashboard stuck with a null user). We only ever call setState inside the
 * callback, so there is no lock re-entrancy/deadlock.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    // Safety: never leave the UI in a permanent "loading" state.
    const t = setTimeout(() => setLoading(false), 5000);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const signOut = async () => {
    try {
      await getSupabase().auth.signOut();
    } catch {
      /* ignore — we redirect regardless */
    }
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
