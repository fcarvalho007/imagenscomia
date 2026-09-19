begin;
create table public.course_sms_templates (
 edition text not null references public.course_editions(id),
 template text not null check(template in ('practical_sms','after_sms')),
 body text not null check(length(btrim(body)) between 10 and 160 and body !~ '[^ -~]' and body !~ '[\[\]{}^~|\\]'),
 updated_at timestamptz not null default clock_timestamp(),
 primary key(edition,template)
);
alter table public.course_sms_templates enable row level security;
revoke all on public.course_sms_templates from public,anon,authenticated;
grant select on public.course_sms_templates to authenticated;
grant all on public.course_sms_templates to service_role;
create policy course_sms_templates_admin on public.course_sms_templates for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create function public.save_course_sms_template(edition_id text,template_key text,sms_body text,expected_updated_at timestamptz) returns timestamptz language plpgsql security definer set search_path=public,pg_temp as $$
declare saved timestamptz; previous timestamptz;
begin
 perform public.course_admin_required();
 perform pg_advisory_xact_lock(hashtext('sms:'||edition_id||':'||template_key));
 select updated_at into previous from course_sms_templates where edition=edition_id and template=template_key for update;
 if previous is distinct from expected_updated_at then raise exception 'Template changed; reload';end if;
 insert into course_sms_templates(edition,template,body) values(edition_id,template_key,btrim(sms_body))
 on conflict(edition,template) do update set body=excluded.body,updated_at=clock_timestamp() returning updated_at into saved;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'sms_template_saved_'||template_key,edition_id);
 return saved;
end;$$;
revoke all on function public.save_course_sms_template(text,text,text,timestamptz) from public,anon;
grant execute on function public.save_course_sms_template(text,text,text,timestamptz) to authenticated;
commit;
