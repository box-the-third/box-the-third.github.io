-- ════════════════════════════════════════════════════════════════
--  Agent Studio schema. Run once in Supabase → SQL Editor.
--  All tables are RLS-locked: users only see/modify their own rows.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.studio_items (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,
  title      text not null default '',
  status     text not null default 'draft',
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists studio_items_user_kind on public.studio_items (user_id, kind, created_at desc);

create table if not exists public.studio_feedback (
  id         uuid primary key,
  user_id    uuid references auth.users(id) on delete set null,
  agent      text not null,
  rating     int check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_usage (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  agent      text,
  created_at timestamptz not null default now()
);
create index if not exists studio_usage_user_time on public.studio_usage (user_id, created_at desc);

alter table public.studio_items    enable row level security;
alter table public.studio_feedback enable row level security;
alter table public.studio_usage    enable row level security;

create policy "own items select" on public.studio_items for select using (auth.uid() = user_id);
create policy "own items insert" on public.studio_items for insert with check (auth.uid() = user_id);
create policy "own items update" on public.studio_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own items delete" on public.studio_items for delete using (auth.uid() = user_id);

create policy "own feedback insert" on public.studio_feedback for insert with check (auth.uid() = user_id);
create policy "own feedback select" on public.studio_feedback for select using (auth.uid() = user_id);

create policy "own usage select" on public.studio_usage for select using (auth.uid() = user_id);
create policy "own usage insert" on public.studio_usage for insert with check (auth.uid() = user_id);

-- GDPR/CCPA: export + erase. Deleting the auth user cascades to every table above.
create or replace function public.studio_export_my_data() returns jsonb
language sql security invoker as $$
  select jsonb_build_object(
    'items',    coalesce((select jsonb_agg(i) from public.studio_items i where i.user_id = auth.uid()), '[]'),
    'feedback', coalesce((select jsonb_agg(f) from public.studio_feedback f where f.user_id = auth.uid()), '[]')
  );
$$;

create or replace function public.studio_delete_my_data() returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.studio_items    where user_id = auth.uid();
  delete from public.studio_feedback where user_id = auth.uid();
  delete from public.studio_usage    where user_id = auth.uid();
end; $$;
revoke all on function public.studio_delete_my_data() from public, anon;
grant execute on function public.studio_delete_my_data() to authenticated;

-- ──────────────────────────────────────────────
-- Paywall: bank details live HERE, not in git. Only signed-in users can read.
-- Insert your real details once in the SQL editor (never commit them):
--   insert into public.studio_bank (holder, bank, iban) values ('...', '...', 'SA..');
-- ──────────────────────────────────────────────
create table if not exists public.studio_bank (
  id     int primary key default 1 check (id = 1),
  holder text not null, bank text not null, iban text not null, note text
);
alter table public.studio_bank enable row level security;
create policy "signed-in read bank" on public.studio_bank for select to authenticated using (true);

-- Owner can verify payments submitted by customers. Replace the email if it changes.
create policy "owner reads payments" on public.studio_items for select to authenticated
  using (kind = 'payment' and (auth.jwt() ->> 'email') = 'nahiyanibnershad@gmail.com');
create policy "owner verifies payments" on public.studio_items for update to authenticated
  using (kind = 'payment' and (auth.jwt() ->> 'email') = 'nahiyanibnershad@gmail.com')
  with check (kind = 'payment');
-- Customers must not be able to mark their own payment "paid":
create or replace function public.studio_guard_payment() returns trigger language plpgsql as $$
begin
  if new.kind = 'payment' and (auth.jwt() ->> 'email') <> 'nahiyanibnershad@gmail.com' then
    if tg_op = 'INSERT' and new.status <> 'pending' then new.status := 'pending'; end if;
    if tg_op = 'UPDATE' and new.status is distinct from old.status then new.status := old.status; end if;
  end if;
  return new;
end; $$;
drop trigger if exists studio_payment_guard on public.studio_items;
create trigger studio_payment_guard before insert or update on public.studio_items
  for each row execute function public.studio_guard_payment();
