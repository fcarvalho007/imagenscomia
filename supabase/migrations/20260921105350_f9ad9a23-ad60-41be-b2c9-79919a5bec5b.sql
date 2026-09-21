drop policy if exists allow_authenticated_select_scheduled_sends on public.scheduled_sends;
drop policy if exists allow_authenticated_insert_scheduled_sends on public.scheduled_sends;
drop policy if exists allow_authenticated_update_scheduled_sends on public.scheduled_sends;
drop policy if exists allow_authenticated_delete_scheduled_sends on public.scheduled_sends;

alter table public.scheduled_sends enable row level security;

create policy "legacy_admin_select_scheduled_sends" on public.scheduled_sends
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role) and (auth.jwt() ->> 'aal') = 'aal2');

create policy "legacy_admin_insert_scheduled_sends" on public.scheduled_sends
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'::app_role) and (auth.jwt() ->> 'aal') = 'aal2');

create policy "legacy_admin_update_scheduled_sends" on public.scheduled_sends
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role) and (auth.jwt() ->> 'aal') = 'aal2')
  with check (public.has_role(auth.uid(), 'admin'::app_role) and (auth.jwt() ->> 'aal') = 'aal2');

create policy "legacy_admin_delete_scheduled_sends" on public.scheduled_sends
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role) and (auth.jwt() ->> 'aal') = 'aal2');

revoke all on public.scheduled_sends from anon;
grant select, insert, update, delete on public.scheduled_sends to authenticated;
grant all on public.scheduled_sends to service_role;