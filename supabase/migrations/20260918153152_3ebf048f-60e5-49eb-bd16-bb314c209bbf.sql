begin;
-- Align the URL field check with the source migration text.
create or replace function public.configure_course_edition(edition_id text,settings jsonb,enabled boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare k text; v text; clean jsonb:='{}';
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden'; end if;
 if enabled is null or settings is null or jsonb_typeof(settings)<>'object' then raise exception 'Invalid settings';end if;
 foreach k in array array['schedule','venue','before_url','after_url','join_url','resources_url','recordings_url'] loop
  v:=btrim(coalesce(settings->>k,''));
  if length(v)>1000 or (k like '%_url' and v<>'' and v !~ '^https://[^[:space:]]+$') then raise exception 'Invalid field: %',k;end if;
  clean:=clean||jsonb_build_object(k,v);
 end loop;
 if enabled and clean->>'schedule'='' then raise exception 'Complete the edition schedule';end if;
 update course_editions set operations=clean,automation_enabled=enabled where id=edition_id;
 if not found then raise exception 'Edition not found';end if;
 update course_jobs j set state='queued',error_code=null from course_registrations r where j.registration_id=r.id and r.edition=edition_id and j.state='blocked' and j.attempts=0;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'edition_configuration_updated',edition_id);
end; $$;

alter table public.course_registrations add column resource_token uuid not null default gen_random_uuid() unique;
create table public.course_resources (
 id uuid primary key default gen_random_uuid(), edition text not null references public.course_editions(id),
 title text not null check(length(title) between 2 and 160), kind text not null check(kind in ('template','checklist','guide','video','recording')),
 url text not null check(url ~ '^https://[^[:space:]]+$'), description text not null default '' check(length(description)<=500),
 available_at timestamptz not null default now(), enabled boolean not null default false
);
alter table public.course_resources enable row level security;
revoke all on public.course_resources from public,anon,authenticated;
grant select on public.course_resources to authenticated;
grant all on public.course_resources to service_role;
create policy course_resources_admin on public.course_resources for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create function public.save_course_resource(resource_id uuid,edition_id text,resource_title text,resource_kind text,resource_url text,resource_description text,available timestamptz,active boolean) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare saved uuid;
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden';end if;
 if resource_kind='recording' and edition_id<>'online-2026' then raise exception 'Recordings only for online edition';end if;
 if resource_id is null then
  insert into course_resources(edition,title,kind,url,description,available_at,enabled) values(edition_id,btrim(resource_title),resource_kind,resource_url,coalesce(resource_description,''),available,active) returning id into saved;
 else
  update course_resources set title=btrim(resource_title),kind=resource_kind,url=resource_url,description=coalesce(resource_description,''),available_at=available,enabled=active where id=resource_id and edition=edition_id returning id into saved;
  if not found then raise exception 'Not found';end if;
 end if;
 update course_jobs j set state='queued',error_code=null from course_registrations r where j.registration_id=r.id and r.edition=edition_id and j.template='resources' and j.state='blocked' and j.attempts=0;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'resource_saved',edition_id);return saved;
end; $$;
revoke all on function public.save_course_resource(uuid,text,text,text,text,text,timestamptz,boolean) from public,anon;
grant execute on function public.save_course_resource(uuid,text,text,text,text,text,timestamptz,boolean) to authenticated;
create function public.read_course_resources(access_token uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r course_registrations; e course_editions;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 select r0.* into r from course_registrations r0 join course_payments p on p.registration_id=r0.id where r0.resource_token=access_token and r0.status='confirmed' and p.state='paid';
 if not found then raise exception 'Access unavailable';end if;
 select * into e from course_editions where id=r.edition;
 return jsonb_build_object('edition',e.label,'recordings_until',e.ends_at+interval '1 year','resources',(select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'title',x.title,'kind',x.kind,'url',x.url,'description',x.description) order by x.available_at,x.title),'[]') from course_resources x where x.edition=r.edition and x.enabled and x.available_at<=now() and (x.kind<>'recording' or (r.edition='online-2026' and now()<=e.ends_at+interval '1 year'))));
end; $$;
revoke all on function public.read_course_resources(uuid) from public,anon,authenticated;
grant execute on function public.read_course_resources(uuid) to service_role;
commit;