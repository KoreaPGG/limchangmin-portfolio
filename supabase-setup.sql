-- Run once in the Supabase SQL editor for a new project.
create table public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from public, anon, authenticated;
grant select on public.portfolio_admins to authenticated;
create policy "Admins can see their own membership" on public.portfolio_admins
  for select to authenticated using (user_id = (select auth.uid()));

create table public.works (
  id text primary key,
  year integer not null check (year between 1 and 9999),
  title text not null check (length(trim(title)) between 1 and 300),
  image text not null,
  video text,
  preview_scale double precision check (preview_scale > 0),
  deleted boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.works enable row level security;
revoke all on public.works from public, anon, authenticated;
grant select on public.works to anon, authenticated;
grant insert, update on public.works to authenticated;
create policy "Works are public" on public.works
  for select to anon, authenticated using (true);
create policy "Admins can add works" on public.works
  for insert to authenticated with check (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  );
create policy "Admins can edit works" on public.works
  for update to authenticated using (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  );

create table public.site_content (
  page_key text primary key check (page_key in ('about', 'press', 'exhibition')),
  content jsonb not null check (jsonb_typeof(content) = 'object')
);
alter table public.site_content enable row level security;
revoke all on public.site_content from public, anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
create policy "Site content is public" on public.site_content
  for select to anon, authenticated using (true);
create policy "Admins can add site content" on public.site_content
  for insert to authenticated with check (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  );
create policy "Admins can edit site content" on public.site_content
  for update to authenticated using (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  );

insert into storage.buckets (id, name, public)
values ('work-media', 'work-media', true);
create policy "Admins can upload work media" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'work-media'
    and exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  );
