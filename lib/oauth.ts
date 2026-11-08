import { getSupabase } from "@/lib/supabase";

/** Start Google sign-in; resolves with an error message if it could not start. */
export async function signInWithGoogle(): Promise<string | null> {
  const { error } = await getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/oauth/consent/` },
  });
  return error ? error.message : null;
}
