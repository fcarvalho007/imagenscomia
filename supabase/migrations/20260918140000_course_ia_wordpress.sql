-- New course only. Does not modify webinar data, payments or messaging automations.
begin;
create table public.course_registrations (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique,
 course_id text not null default 'curso-ia-negocio' check(course_id = 'curso-ia-negocio'),
 edition text not null check(edition in ('lisboa-2026','porto-2026','online-2026')),
 name text not null check(length(name) between 2 and 120),
 email text not null check(length(email) <= 254 and email = lower(email)),
 phone text not null default '' check(length(phone) <= 30),
 status text not null default 'new' check(status in ('new','contacted','awaiting_payment','confirmed','cancelled')),
 marketing_consent boolean not null default false,
 privacy_version text not null,
 analytics_session uuid,
 attribution jsonb not null default '{}'::jsonb,
 notes text not null default '' check(length(notes) <= 4000),
 next_followup_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(edition,email)
);
create table public.course_events (
 id uuid primary key,
 course_id text not null default 'curso-ia-negocio' check(course_id = 'curso-ia-negocio'),
 session_id uuid not null,
 name text not null check(name in ('page_view','quiz_started','quiz_completed','pricing_viewed','edition_selected','registration_started','registration_submitted')),
 edition text check(edition in ('lisboa-2026','porto-2026','online-2026')),
 created_at timestamptz not null default now()
);
create index course_events_created_idx on public.course_events(created_at);
create index course_events_session_idx on public.course_events(session_id,name);
create table public.course_activity (
 id bigint generated always as identity primary key,
 registration_id uuid not null references public.course_registrations(id) on delete cascade,
 actor_id uuid,
 action text not null,
 previous_status text,
 status text,
 created_at timestamptz not null default now()
);
alter table public.course_registrations enable row level security;
alter table public.course_events enable row level security;
alter table public.course_activity enable row level security;
revoke all on public.course_registrations, public.course_events, public.course_activity from anon, authenticated;
grant select on public.course_registrations, public.course_events, public.course_activity to authenticated;
create policy course_admin_read on public.course_registrations for select to authenticated using (public.has_role(auth.uid(),'admin') and (auth.jwt()->>'aal')='aal2');
create policy course_events_admin_read on public.course_events for select to authenticated using (public.has_role(auth.uid(),'admin') and (auth.jwt()->>'aal')='aal2');
create policy course_activity_admin_read on public.course_activity for select to authenticated using (public.has_role(auth.uid(),'admin') and (auth.jwt()->>'aal')='aal2');
-- Only the signed server-to-server bridge can create requests and anonymous metrics.
create function public.ingest_course_request(payload jsonb) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare inserted_id uuid;
begin
 if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Forbidden'; end if;
 insert into course_registrations(request_id,edition,name,email,phone,marketing_consent,privacy_version,analytics_session,attribution)
 values ((payload->>'request_id')::uuid,payload->>'edition',payload->>'name',lower(payload->>'email'),coalesce(payload->>'phone',''),coalesce((payload->>'marketing_consent')::boolean,false),payload->>'privacy_version',(payload->>'session_id')::uuid,coalesce(payload->'attribution','{}'::jsonb))
 on conflict do nothing returning id into inserted_id;
 if inserted_id is not null then
  insert into course_activity(registration_id,action,status) values(inserted_id,'request_received','new');
  if payload->>'session_id' is not null then
   insert into course_events(id,session_id,name,edition) values((payload->>'request_id')::uuid,(payload->>'session_id')::uuid,'registration_submitted',payload->>'edition') on conflict do nothing;
  end if;
 end if;
end; $$;
revoke all on function public.ingest_course_request(jsonb) from public,anon,authenticated;
grant execute on function public.ingest_course_request(jsonb) to service_role;
create function public.update_course_request(request_uuid uuid,new_status text,new_notes text,followup timestamptz) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare old_status text;
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden'; end if;
 if new_status not in ('new','contacted','awaiting_payment','confirmed','cancelled') or new_status is null or length(coalesce(new_notes,''))>4000 then raise exception 'Invalid update'; end if;
 select status into old_status from course_registrations where id=request_uuid for update;
 if not found then raise exception 'Not found'; end if;
 update course_registrations set status=new_status,notes=coalesce(new_notes,''),next_followup_at=followup,updated_at=now() where id=request_uuid;
 insert into course_activity(registration_id,actor_id,action,previous_status,status) values(request_uuid,auth.uid(),'manual_update',old_status,new_status);
end; $$;
revoke all on function public.update_course_request(uuid,text,text,timestamptz) from public,anon;
grant execute on function public.update_course_request(uuid,text,text,timestamptz) to authenticated;
create function public.course_metrics() returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden'; end if;
 return jsonb_build_object(
  'sessions',(select count(distinct session_id) from course_events where name='page_view'),
  'quiz_completed',(select count(distinct session_id) from course_events where name='quiz_completed'),
  'pricing_sessions',(select count(distinct session_id) from course_events where name='pricing_viewed'),
  'registration_sessions',(select count(distinct session_id) from course_events where name='registration_started'),
  'requests',(select count(*) from course_registrations),
  'confirmed',(select count(*) from course_registrations where status='confirmed'),
  'followups_due',(select count(*) from course_registrations where next_followup_at<=now() and status not in ('confirmed','cancelled'))
 );
end; $$;
revoke all on function public.course_metrics() from public,anon;
grant execute on function public.course_metrics() to authenticated;
commit;
