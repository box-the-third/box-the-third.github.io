// ════════════════════════════════════════════════════════════════
//  YAS Beyond Education — Supabase client & auth helper
//  Loaded on every page via: <script src="assets/js/db.js"></script>
// ════════════════════════════════════════════════════════════════

// 1) Fill these in from: Supabase Dashboard → Project Settings → API
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ──────────────────────────────────────────────
// Auth helpers (used by the nav, modal, and dashboard)
// ──────────────────────────────────────────────
const YASAuth = {
  async getSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
  },

  async signUp(email, password, fullName) {
    return supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || '' } }
    });
  },

  async signIn(email, password) {
    return supabaseClient.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  },

  // Remembers where the user was heading (e.g. a specific package)
  // so login can redirect them straight back into the flow.
  setPendingIntent(intent) {
    sessionStorage.setItem('yas_pending_intent', JSON.stringify(intent));
  },
  getPendingIntent() {
    const raw = sessionStorage.getItem('yas_pending_intent');
    return raw ? JSON.parse(raw) : null;
  },
  clearPendingIntent() {
    sessionStorage.removeItem('yas_pending_intent');
  },

  onAuthChange(callback) {
    supabaseClient.auth.onAuthStateChange((_event, session) => callback(session));
  }
};

// ──────────────────────────────────────────────
// Data helpers
// ──────────────────────────────────────────────
const YASData = {
  async getPackages() {
    const { data, error } = await supabaseClient
      .from('packages')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) { console.error(error); return []; }
    return data;
  },

  // Records a buyer's choice the moment they click a pricing CTA.
  // If logged out, the click is queued via pending intent and saved
  // automatically right after they sign in — no re-clicking needed.
  async saveSelection(userId, packageId, notes) {
    return supabaseClient
      .from('selections')
      .insert({ user_id: userId, package_id: packageId, notes: notes || null });
  },

  async getMySelections(userId) {
    const { data, error } = await supabaseClient
      .from('selections')
      .select('*, packages(service_name, tier_label, price_bdt, cta_label)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },

  async getMyProfile(userId) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) { console.error(error); return null; }
    return data;
  },

  async updateMyProfile(userId, fields) {
    return supabaseClient.from('profiles').update(fields).eq('id', userId);
  }
};

// ──────────────────────────────────────────────
// Resume a pending package selection right after sign-in/sign-up,
// so the buyer's journey never loses its place mid-click.
// ──────────────────────────────────────────────
async function resolvePendingIntentIfAny(session) {
  if (!session) return;
  const intent = YASAuth.getPendingIntent();
  if (!intent) return;
  if (intent.type === 'package_selection') {
    await YASData.saveSelection(session.user.id, intent.packageId);
  }
  YASAuth.clearPendingIntent();
  if (intent.redirectTo) {
    window.location.href = intent.redirectTo;
  }
}
