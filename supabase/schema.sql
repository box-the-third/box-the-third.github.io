-- ════════════════════════════════════════════════════════════════
--  YAS Beyond Education — Supabase schema
--  Run this once in: Supabase Dashboard → SQL Editor → New query
-- ════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- 1. PROFILES — extends auth.users with public info
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  full_name   text,
  phone       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();


-- ──────────────────────────────────────────────
-- 2. PACKAGES — public service/pricing catalog
--    (mirrors the Services & Pricing section on the site)
-- ──────────────────────────────────────────────
create table if not exists public.packages (
  id           text primary key,        -- e.g. 'cv_writing_basic'
  service_key  text not null,           -- e.g. 'cv_writing'
  service_name text not null,           -- e.g. 'CV Writing'
  tier_key     text not null,           -- e.g. 'basic'
  tier_label   text not null,           -- e.g. 'Basic — 1 Page'
  price_bdt    numeric not null,
  cta_label    text,
  sort_order   int default 0
);

alter table public.packages enable row level security;

create policy "Packages are viewable by everyone"
  on public.packages for select
  using (true);

insert into public.packages (id, service_key, service_name, tier_key, tier_label, price_bdt, cta_label, sort_order) values
  ('cv_writing_basic',              'cv_writing',           'CV Writing',                  'basic',         'Basic — 1 Page',                          150,   'Get My CV Done',         1),
  ('cv_writing_standard',           'cv_writing',           'CV Writing',                  'standard',      'Standard — 2 Pages + Cover Letter',       350,   'Get My CV Done',         2),
  ('cv_writing_premium',            'cv_writing',           'CV Writing',                  'premium',       'Premium — Full Package + LinkedIn',       750,   'Get My CV Done',         3),

  ('sop_writing_draft',             'sop_writing',          'University App & SOP',        'draft',         'Draft — 1 revision',                      1500,  'Start My SOP',           4),
  ('sop_writing_standard',          'sop_writing',          'University App & SOP',        'standard',      'Standard — 3 revisions',                  2500,  'Start My SOP',           5),
  ('sop_writing_premium',           'sop_writing',          'University App & SOP',        'premium',       'Premium — Unlimited revisions',           4500,  'Start My SOP',           6),

  ('ielts_training_starter',        'ielts_training',       'IELTS Training',              'starter',       'Starter — 4 sessions',                    2000,  'Book a FREE Session today', 7),
  ('ielts_training_serious',        'ielts_training',       'IELTS Training',              'serious',       'Serious — 10 sessions',                   4000,  'Book a FREE Session today', 8),
  ('ielts_training_premium',        'ielts_training',       'IELTS Training',              'premium',       'Premium — 20 sessions + mock tests',      7000,  'Book a FREE Session today', 9),

  ('digital_literacy_starter',      'digital_literacy',     'Digital Literacy',            'starter',       'Starter — 1 module',                      500,   'Train Your Team',        10),
  ('digital_literacy_standard',     'digital_literacy',     'Digital Literacy',            'standard',      'Standard — 3 modules',                    1250,  'Train Your Team',        11),
  ('digital_literacy_comprehensive','digital_literacy',     'Digital Literacy',            'comprehensive', 'Comprehensive — Full curriculum',         2500,  'Train Your Team',        12),

  ('portfolio_website_basic',       'portfolio_website',    'Portfolio Website',           'basic',         'Basic — 3 pages',                         5000,  'Build My Site',          13),
  ('portfolio_website_standard',    'portfolio_website',    'Portfolio Website',           'standard',      'Standard — 5 pages + blog',               10000, 'Build My Site',          14),
  ('portfolio_website_premium',     'portfolio_website',    'Portfolio Website',           'premium',       'Premium — Full site + SEO + maintenance', 15000, 'Build My Site',          15),

  ('content_strategy_strategy',     'content_strategy',     'Content Strategy & Creation', 'strategy',      'Strategy — Roadmap only',                 3600,  'Grow My Brand',          16),
  ('content_strategy_production',   'content_strategy',     'Content Strategy & Creation', 'production',    'Production — 4 pieces/month',             7200,  'Grow My Brand',          17),
  ('content_strategy_full_campaign','content_strategy',     'Content Strategy & Creation', 'full_campaign', 'Full Campaign — Strategy + Production',   15000, 'Grow My Brand',          18),

  ('digital_cards_basic',           'digital_cards',        'Digital Business Cards',      'basic',         'Basic — QR Card',                         500,   'Get My Card',            19),
  ('digital_cards_standard',        'digital_cards',        'Digital Business Cards',      'standard',      'Standard — NFC + Microsite',              1200,  'Get My Card',            20),
  ('digital_cards_premium',         'digital_cards',        'Digital Business Cards',      'premium',       'Premium — Full Profile + Analytics',      2500,  'Get My Card',            21),

  ('partnership_outreach_startup',    'partnership_outreach', 'Partnership Outreach',      'startup',       'Startup — 50 leads',                      5000,  'Generate Leads Today',   22),
  ('partnership_outreach_growth',     'partnership_outreach', 'Partnership Outreach',      'growth',        'Growth — 150 leads',                      12000, 'Generate Leads Today',   23),
  ('partnership_outreach_enterprise', 'partnership_outreach', 'Partnership Outreach',      'enterprise',    'Enterprise — 500+ leads',                 30000, 'Generate Leads Today',   24)
on conflict (id) do update set
  service_key  = excluded.service_key,
  service_name = excluded.service_name,
  tier_key     = excluded.tier_key,
  tier_label   = excluded.tier_label,
  price_bdt    = excluded.price_bdt,
  cta_label    = excluded.cta_label,
  sort_order   = excluded.sort_order;


-- ──────────────────────────────────────────────
-- 3. SELECTIONS — a signed-in user's requests/orders
--    Shown on their dashboard with a status badge
-- ──────────────────────────────────────────────
create table if not exists public.selections (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  package_id  text references public.packages(id),
  status      text not null default 'submitted'
              check (status in ('submitted','contacted','payment_pending','paid','in_progress','completed','cancelled')),
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.selections enable row level security;

create policy "Users can view own selections"
  on public.selections for select
  using (auth.uid() = user_id);

create policy "Users can insert own selections"
  on public.selections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own selections"
  on public.selections for update
  using (auth.uid() = user_id);

drop trigger if exists selections_touch on public.selections;
create trigger selections_touch
  before update on public.selections
  for each row execute procedure public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════
--  Done. Next steps:
--  1. Project Settings → API → copy "Project URL" and "anon public" key
--     into /assets/js/db.js (SUPABASE_URL / SUPABASE_ANON_KEY)
--  2. Authentication → Providers → make sure "Email" is enabled
--  3. Authentication → URL Configuration → add your site URL
--     (https://box-the-third.github.io) to Redirect URLs
-- ════════════════════════════════════════════════════════════════
