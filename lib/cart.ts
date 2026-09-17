import { getSupabase } from "@/lib/supabase";

// Package ids a guest tried to add before signing in. Resolved on the
// dashboard right after they log in.
const PENDING_KEY = "yas_pending_cart";

export function readPending(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
  } catch {
    return [];
  }
}

function writePending(ids: string[]) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function addPending(id: string) {
  const ids = readPending();
  if (!ids.includes(id)) {
    ids.push(id);
    writePending(ids);
  }
}

export type AddStatus = "added" | "exists" | "needs-auth" | "error";
export interface AddResult {
  status: AddStatus;
  message: string;
}

/** Add a package (tier) to the cart = a row in Supabase `selections`. */
export async function addToCart(packageId: string): Promise<AddResult> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    addPending(packageId);
    window.dispatchEvent(new Event("cart:changed"));
    return { status: "needs-auth", message: "Create an account to save your cart." };
  }

  const { data: existing } = await supabase
    .from("selections")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("package_id", packageId)
    .limit(1);
  if (existing && existing.length) {
    return { status: "exists", message: "Already in your cart." };
  }

  const { error } = await supabase
    .from("selections")
    .insert({ user_id: session.user.id, package_id: packageId });
  if (error) return { status: "error", message: error.message };

  window.dispatchEvent(new Event("cart:changed"));
  return { status: "added", message: "Added to your cart." };
}

/** Cart size for the nav badge (selections when signed in, else pending). */
export async function cartCount(): Promise<number> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return readPending().length;
  const { count } = await supabase
    .from("selections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id);
  return count || 0;
}
