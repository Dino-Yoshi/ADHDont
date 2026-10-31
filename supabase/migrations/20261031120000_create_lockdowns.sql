-- Lets the exclusion constraint below compare user ids in a GiST index.
create extension if not exists btree_gist with schema extensions;

create table public.lockdowns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  domains text[] not null,
  started_at timestamptz not null,
  ends_at timestamptz not null,
  stopped_at timestamptz,
  -- A user has one lockdown at a time, even when two starts race.
  constraint lockdowns_one_at_a_time exclude using gist (
    user_id with =,
    tstzrange(started_at, ends_at) with &&
  ) where (stopped_at is null)
);

alter table public.lockdowns enable row level security;

create policy "Users can read their own lockdowns"
  on public.lockdowns for select
  using (user_id = auth.uid());

-- The portal holds the anon key, so these rules stop a user minting coins by calling the
-- database directly: no back-dated lockdowns, and a stopped lockdown stays stopped.
create policy "Users can start their own lockdowns now"
  on public.lockdowns for insert
  with check (
    user_id = auth.uid()
    and started_at between now() - interval '1 minute' and now() + interval '1 minute'
  );

revoke update on table public.lockdowns from anon, authenticated;
grant update (stopped_at) on table public.lockdowns to authenticated;

create policy "Users can stop their own lockdowns"
  on public.lockdowns for update
  using (user_id = auth.uid() and stopped_at is null)
  with check (user_id = auth.uid() and stopped_at is not null);
