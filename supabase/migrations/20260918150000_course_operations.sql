begin;
alter table public.course_activity alter column registration_id drop not null;
alter table public.course_activity add column edition text references public.course_editions(id);
-- Per-edition delivery settings; configuration does not activate sends.
alter table public.course_editions add column operations jsonb not null default '{}'::jsonb;
alter table public.course_editions add column automation_enabled boolean not null default false;
update public.course_editions set operations=jsonb_build_object('schedule',case id when 'online-2026' then '2, 4, 9 e 11 de dezembro de 2026 · 09h30–13h00 (Lisboa)' when 'lisboa-2026' then '29 e 30 de outubro de 2026 · 09h00–17h30' else '19 e 20 de novembro de 2026 · 09h00–17h30' end,'venue',case id when 'lisboa-2026' then 'Hotel Gat Rossio, Lisboa' else '' end,'before_url','','after_url','','join_url','','resources_url','','recordings_url','');
create table public.course_jobs (
 id uuid primary key default gen_random_uuid(), registration_id uuid not null references public.course_registrations(id),
 kind text not null check(kind in ('email','invoice')), template text not null,
 due_at timestamptz not null, state text not null default 'queued' check(state in ('queued','processing','sent','blocked','review','cancelled')),
 attempts integer not null default 0, first_attempt_at timestamptz, locked_at timestamptz, lease uuid,
 payload jsonb, provider_id text, error_code text, completed_at timestamptz, created_at timestamptz not null default now(),
 unique(registration_id,kind,template)
);
create index course_jobs_due on public.course_jobs(due_at) where state='queued';
create table public.course_worker_health (worker text primary key,last_run_at timestamptz not null, result text not null);
alter table public.course_jobs enable row level security;
alter table public.course_worker_health enable row level security;
revoke all on public.course_jobs,public.course_worker_health from public,anon,authenticated;
grant select on public.course_jobs,public.course_worker_health to authenticated;
grant all on public.course_jobs,public.course_worker_health to service_role;
create policy course_jobs_admin on public.course_jobs for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create policy course_health_admin on public.course_worker_health for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
alter table public.course_invoices add column finalized_at timestamptz;
alter table public.course_invoices add column emailed_at timestamptz;

-- Queue transactionally with the trusted payment transition, never from browser events.
create function public.queue_course_operations() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare e course_editions;
begin
 if new.status='confirmed' and old.status is distinct from 'confirmed' then
  select * into e from course_editions where id=new.edition;
  insert into course_jobs(registration_id,kind,template,due_at) values
  (new.id,'email','confirmation',now()),
  (new.id,'email','individual_before',now()+interval '1 hour'),
  (new.id,'email','practical_information',greatest(now()+interval '2 hours',e.starts_at-interval '2 days')),
  (new.id,'email','resources',e.ends_at+interval '1 day'),
  (new.id,'email','individual_after',e.ends_at+interval '7 days'),
  (new.id,'invoice','invoice_receipt',now()) on conflict do nothing;
 elsif new.status='cancelled' then
  update course_jobs set state='cancelled',error_code='registration_cancelled' where registration_id=new.id and state in ('queued','blocked');
 end if;
 return new;
end; $$;
create trigger course_queue_after_status after update of status on public.course_registrations for each row execute function public.queue_course_operations();

create function public.configure_course_edition(edition_id text,settings jsonb,enabled boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
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
 -- Unattempted missing-config jobs can safely resume; ambiguous sends cannot.
 update course_jobs j set state='queued',error_code=null from course_registrations r where j.registration_id=r.id and r.edition=edition_id and j.state='blocked' and j.attempts=0;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'edition_configuration_updated',edition_id);
end; $$;
revoke all on function public.configure_course_edition(text,jsonb,boolean) from public,anon;
grant execute on function public.configure_course_edition(text,jsonb,boolean) to authenticated;

create function public.claim_course_job(job_kind text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare j course_jobs; r course_registrations; e course_editions; p course_payments;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 -- A crashed worker may already have performed the external action. Do not blindly resend.
 update course_jobs set state='review',error_code='lease_expired_verify_provider' where state='processing' and locked_at<now()-interval '5 minutes';
 update course_jobs jq set state='cancelled',error_code='pre_event_window_closed' from course_registrations rq,course_editions eq where jq.registration_id=rq.id and rq.edition=eq.id and jq.state in ('queued','blocked') and jq.template in ('confirmation','individual_before','practical_information') and now()>=eq.starts_at;
 select j0.* into j from course_jobs j0 join course_registrations r0 on r0.id=j0.registration_id join course_editions e0 on e0.id=r0.edition join course_payments p0 on p0.registration_id=r0.id
 where j0.kind=job_kind and j0.state='queued' and j0.due_at<=now() and r0.status='confirmed' and p0.state='paid' and e0.automation_enabled
 and (job_kind='invoice' or now()<e0.starts_at or now()>e0.ends_at)
 order by j0.due_at,j0.id for update of j0 skip locked limit 1;
 if not found then return null;end if;
 select * into r from course_registrations where id=j.registration_id;
 select * into e from course_editions where id=r.edition;
 select * into p from course_payments where registration_id=r.id;
 update course_jobs set state='processing',locked_at=now(),lease=gen_random_uuid() where id=j.id returning * into j;
 return jsonb_build_object('job',to_jsonb(j),'registration',to_jsonb(r),'edition',to_jsonb(e),'payment',to_jsonb(p),'invoice',(select to_jsonb(i) from course_invoices i where i.registration_id=r.id));
end; $$;
revoke all on function public.claim_course_job(text) from public,anon,authenticated;
grant execute on function public.claim_course_job(text) to service_role;

create function public.prepare_course_job(job_id uuid,job_lease uuid,frozen_payload jsonb) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare j course_jobs;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 select * into j from course_jobs where id=job_id and lease=job_lease and state='processing' for update;
 if not found then return false;end if;
 if not exists(select 1 from course_registrations r join course_payments p on p.registration_id=r.id join course_editions e on e.id=r.edition where r.id=j.registration_id and r.status='confirmed' and p.state='paid' and e.automation_enabled) then
  update course_jobs set state='cancelled',error_code='no_longer_eligible' where id=j.id;return false;
 end if;
 if j.payload is not null and j.payload<>frozen_payload then raise exception 'Payload changed';end if;
 update course_jobs set payload=frozen_payload,attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()) where id=j.id;
 return true;
end; $$;
revoke all on function public.prepare_course_job(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.prepare_course_job(uuid,uuid,jsonb) to service_role;

create function public.finish_course_job(job_id uuid,job_lease uuid,outcome text,external_id text default null,reason text default null) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare j course_jobs;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 if outcome not in ('sent','blocked','review','queued') then raise exception 'Invalid outcome';end if;
 select * into j from course_jobs where id=job_id and lease=job_lease and state='processing' for update;
 if not found then raise exception 'Stale lease';end if;
 if outcome='queued' and (j.kind<>'email' or j.attempts>=8 or j.first_attempt_at<now()-interval '23 hours') then outcome:='review';end if;
 update course_jobs set state=outcome,provider_id=coalesce(external_id,provider_id),error_code=left(reason,100),completed_at=case when outcome='sent' then now() else null end,due_at=case when outcome='queued' then now()+interval '5 minutes' else due_at end,locked_at=null where id=j.id;
 insert into course_activity(registration_id,action) values(j.registration_id,'job_'||j.template||'_'||outcome);
end; $$;
revoke all on function public.finish_course_job(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.finish_course_job(uuid,uuid,text,text,text) to service_role;

-- Secret request UUID is held by the participant's browser; this RPC is reachable only through signed WP requests.
create function public.save_course_billing(request_token uuid,details jsonb) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r course_registrations; i course_invoices;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 select r0.* into r from course_registrations r0 join course_editions e on e.id=r0.edition where r0.request_id=request_token and now()<e.ends_at+interval '30 days' for update of r0;
 if not found or r.status<>'confirmed' then raise exception 'Unavailable';end if;
 select * into i from course_invoices where registration_id=r.id for update;
 if not found or i.document_id is not null or i.state not in ('awaiting_data','ready') or exists(select 1 from course_jobs where registration_id=r.id and kind='invoice' and (state in ('processing','review','sent') or attempts>0)) then raise exception 'Invoice locked; contact support';end if;
 if length(coalesce(details->>'name',''))<2 or length(details->>'name')>180 or coalesce(details->>'tax_id','')!~ '^[0-9]{9}$' or length(coalesce(details->>'address',''))<5 or length(coalesce(details->>'city',''))<2 or coalesce(details->>'postal_code','')!~ '^[0-9]{4}-[0-9]{3}$' or coalesce(details->>'country','')<>'Portugal' then raise exception 'Invalid billing';end if;
 update course_invoices set billing=details,state='ready',updated_at=now() where registration_id=r.id;
 update course_jobs set state='queued',error_code=null where registration_id=r.id and kind='invoice' and state='blocked' and attempts=0;
 insert into course_activity(registration_id,action) values(r.id,'billing_received');
end; $$;
revoke all on function public.save_course_billing(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.save_course_billing(uuid,jsonb) to service_role;
commit;
