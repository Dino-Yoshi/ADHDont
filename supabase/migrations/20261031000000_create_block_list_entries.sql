alter table public.profiles
  add column block_list_seeded boolean not null default false;

create table public.block_list_entries (
  user_id uuid not null references public.profiles (id) on delete cascade,
  domain text not null,
  primary key (user_id, domain)
);

alter table public.block_list_entries enable row level security;

create policy "Users can read their own block list"
  on public.block_list_entries for select
  using (user_id = auth.uid());

create policy "Users can add to their own block list"
  on public.block_list_entries for insert
  with check (user_id = auth.uid());

create policy "Users can remove from their own block list"
  on public.block_list_entries for delete
  using (user_id = auth.uid());

revoke update on table public.profiles from anon, authenticated;
grant update (block_list_seeded) on table public.profiles to authenticated;

create policy "Users can update their own block-list seed status"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
