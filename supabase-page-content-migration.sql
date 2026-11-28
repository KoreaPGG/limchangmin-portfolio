create table if not exists public.site_content (
  page_key text primary key check (page_key in ('about', 'press', 'exhibition')),
  content jsonb not null check (jsonb_typeof(content) = 'object')
);

alter table public.site_content enable row level security;
revoke all on public.site_content from public, anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;

drop policy if exists "Site content is public" on public.site_content;
create policy "Site content is public" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "Admins can add site content" on public.site_content;
create policy "Admins can add site content" on public.site_content
  for insert to authenticated with check (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  );

drop policy if exists "Admins can edit site content" on public.site_content;
create policy "Admins can edit site content" on public.site_content
  for update to authenticated using (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.portfolio_admins where user_id = (select auth.uid()))
  );
