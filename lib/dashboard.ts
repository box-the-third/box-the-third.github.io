import { getSupabase } from "@/lib/supabase";
import { readPending } from "@/lib/cart";

// Shapes returned from Supabase for the dashboard.
export interface Profile {
  id: string;
  full_name: string | null;
}

export interface PackageInfo {
  service_name: string | null;
  tier_label: string | null;
  price_bdt: number | null;
  cta_label: string | null;
}

export interface Selection {
  id: string;
  status: string;
  created_at: string;
  package_id: string | null;
  packages: PackageInfo | null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("id, full_name")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function getSelections(userId: string): Promise<Selection[]> {
  const { data, error } = await getSupabase()
    .from("selections")
    .select("id, status, created_at, package_id, packages(service_name, tier_label, price_bdt, cta_label)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as unknown as Selection[]) || [];
}

export async function removeSelection(id: string): Promise<void> {
  await getSupabase().from("selections").delete().eq("id", id);
}

/** Move any pre-login "pending" adds into Supabase, skipping duplicates. */
export async function resolvePending(userId: string): Promise<void> {
  const pending = readPending();
  if (!pending.length) return;
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("selections")
    .select("package_id")
    .eq("user_id", userId);
  const have = new Set((existing || []).map((r) => r.package_id));
  const rows = [...new Set(pending)]
    .filter((pid) => !have.has(pid))
    .map((pid) => ({ user_id: userId, package_id: pid }));
  if (rows.length) await supabase.from("selections").insert(rows);
  try {
    localStorage.removeItem("yas_pending_cart");
  } catch {
    /* ignore */
  }
}

/** Mark the user's open cart items as "contacted" and store their note. */
export async function markRequestSent(userId: string, notes: string): Promise<void> {
  await getSupabase()
    .from("selections")
    .update({ status: "contacted", notes: notes || null })
    .eq("user_id", userId)
    .eq("status", "submitted");
}
