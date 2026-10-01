-- Corrective migration: does not enable sales, send messages or issue documents.
begin;
alter table public.course_editions add column invoicing_enabled boolean not null default false;
alter table public.course_editions add column sms_enabled boolean not null default false;
alter table public.course_registrations add column sms_consent boolean not null default false;
alter table public.course_registrations add column before_session text not null default 'pending' check(before_session in ('pending','booked','completed'));
alter table public.course_registrations add column after_session text not null default 'pending' check(after_session in ('pending','booked','completed'));
alter table public.course_jobs drop constraint course_jobs_kind_check;
alter table public.course_jobs add constraint course_jobs_kind_check check(kind in ('email','sms','invoice'));
create or replace function public.queue_course_operations() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare e course_editions;
begin
 if new.status='confirmed' and old.status is distinct from 'confirmed' then
  select * into e from course_editions where id=new.edition;
  insert into course_jobs(registration_id,kind,template,due_at) values
  (new.id,'email','confirmation',now()),
  (new.id,'email','individual_before',least(now()+interval '1 hour',e.starts_at-interval '1 minute')),
  (new.id,'email','practical_information',greatest(now(),e.starts_at-interval '2 days')),
  (new.id,'email','resources',e.ends_at+interval '1 day'),
  (new.id,'email','individual_after',e.ends_at+interval '7 days'),
  (new.id,'invoice','invoice_receipt',now()) on conflict do nothing;
  if new.sms_consent and new.phone<>'' then
   insert into course_jobs(registration_id,kind,template,due_at) values
    (new.id,'sms','practical_sms',greatest(now(),e.starts_at-interval '1 day')),
    (new.id,'sms','after_sms',e.ends_at+interval '14 days') on conflict do nothing;
  end if;
 elsif new.status='cancelled' then
  update course_jobs set state='cancelled',error_code='registration_cancelled' where registration_id=new.id and state in ('queued','blocked');
 end if;
 return new;
end; $$;

-- Eligibility is checked both at claim and immediately before external delivery.
create function public.course_job_eligible(j public.course_jobs) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from course_registrations r join course_payments p on p.registration_id=r.id join course_editions e on e.id=r.edition
 where r.id=j.registration_id and r.status='confirmed' and p.state='paid'
 and (case j.kind when 'invoice' then e.invoicing_enabled when 'sms' then e.sms_enabled and e.automation_enabled and r.sms_consent and r.phone<>'' and extract(hour from now() at time zone 'Europe/Lisbon') between 8 and 19 else e.automation_enabled end)
 and (j.kind='invoice' or now()<e.starts_at or now()>e.ends_at)
 and (j.template not in ('confirmation','individual_before','practical_information','practical_sms') or now()<e.starts_at)
 and (j.template not in ('individual_after','after_sms') or now()<e.ends_at+interval '30 days')
 and (j.template<>'individual_before' or r.before_session='pending')
 and (j.template not in ('individual_after','after_sms') or r.after_session='pending'));
$$;
revoke all on function public.course_job_eligible(public.course_jobs) from public,anon,authenticated;
grant execute on function public.course_job_eligible(public.course_jobs) to service_role;
create or replace function public.claim_course_job(job_kind text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare j course_jobs; r course_registrations; e course_editions; p course_payments;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 -- A crashed worker may already have performed the external action. Do not blindly resend.
 update course_jobs set state='review',error_code='lease_expired_verify_provider' where state='processing' and locked_at<now()-interval '5 minutes';
 update course_jobs jq set state='cancelled',error_code='pre_event_window_closed' from course_registrations rq,course_editions eq where jq.registration_id=rq.id and rq.edition=eq.id and jq.state in ('queued','blocked') and jq.template in ('confirmation','individual_before','practical_information','practical_sms') and now()>=eq.starts_at;
 update course_jobs jq set state='cancelled',error_code='followup_window_closed' from course_registrations rq,course_editions eq where jq.registration_id=rq.id and rq.edition=eq.id and jq.state in ('queued','blocked') and jq.template in ('individual_after','after_sms') and now()>=eq.ends_at+interval '30 days';
 select j0.* into j from course_jobs j0 join course_registrations r0 on r0.id=j0.registration_id join course_editions e0 on e0.id=r0.edition join course_payments p0 on p0.registration_id=r0.id
 where j0.kind=job_kind and j0.state='queued' and j0.due_at<=now() and r0.status='confirmed' and p0.state='paid' and public.course_job_eligible(j0)
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

create or replace function public.prepare_course_job(job_id uuid,job_lease uuid,frozen_payload jsonb) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare j course_jobs;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 select * into j from course_jobs where id=job_id and lease=job_lease and state='processing' for update;
 if not found then return false;end if;
 if not public.course_job_eligible(j) then
  update course_jobs set state='cancelled',error_code='no_longer_eligible' where id=j.id;return false;
 end if;
 if j.payload is not null and j.payload<>frozen_payload then raise exception 'Payload changed';end if;
 update course_jobs set payload=frozen_payload,attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()) where id=j.id;
 return true;
end; $$;
revoke all on function public.prepare_course_job(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.prepare_course_job(uuid,uuid,jsonb) to service_role;


-- Existing unattempted late registrations receive practical information before the event.
update course_jobs j set due_at=greatest(j.created_at,e.starts_at-interval '2 days') from course_registrations r,course_editions e
 where j.registration_id=r.id and r.edition=e.id and j.template='practical_information' and j.state in ('queued','blocked') and j.attempts=0 and now()<e.starts_at;
create function public.set_course_session(request_uuid uuid,phase text,session_state text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden';end if;
 if phase is null or phase not in ('before','after') or session_state is null or session_state not in ('pending','booked','completed') then raise exception 'Invalid state';end if;
 update course_registrations set before_session=case when phase='before' then session_state else before_session end,after_session=case when phase='after' then session_state else after_session end where id=request_uuid and status='confirmed';
 if not found then raise exception 'Confirmed registration required';end if;
 if session_state<>'pending' then
 update course_jobs set state='cancelled',error_code='session_already_booked' where registration_id=request_uuid and state in ('queued','blocked') and ((phase='before' and template='individual_before') or (phase='after' and template in ('individual_after','after_sms')));
 end if;
 insert into course_activity(registration_id,actor_id,action) values(request_uuid,auth.uid(),'session_'||phase||'_'||session_state);
end;$$;
revoke all on function public.set_course_session(uuid,text,text) from public,anon;
grant execute on function public.set_course_session(uuid,text,text) to authenticated;
create function public.configure_course_channels(edition_id text,sms boolean,invoicing boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden';end if;
 if sms is null or invoicing is null then raise exception 'Invalid settings';end if;
 update course_editions set sms_enabled=sms,invoicing_enabled=invoicing where id=edition_id;
 if not found then raise exception 'Edition not found';end if;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'edition_channels_updated',edition_id);
end;$$;
revoke all on function public.configure_course_channels(text,boolean,boolean) from public,anon;
grant execute on function public.configure_course_channels(text,boolean,boolean) to authenticated;
create or replace function public.ingest_course_request(payload jsonb) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare inserted_id uuid;
begin
 if coalesce(auth.role(),'') <> 'service_role' then raise exception 'Forbidden'; end if;
 insert into course_registrations(request_id,edition,name,email,phone,sms_consent,marketing_consent,privacy_version,analytics_session,attribution)
 values ((payload->>'request_id')::uuid,payload->>'edition',payload->>'name',lower(payload->>'email'),coalesce(payload->>'phone',''),coalesce((payload->>'sms_consent')::boolean,false),coalesce((payload->>'marketing_consent')::boolean,false),payload->>'privacy_version',(payload->>'session_id')::uuid,coalesce(payload->'attribution','{}'::jsonb))
 on conflict do nothing returning id into inserted_id;
 if inserted_id is not null then
  insert into course_activity(registration_id,action,status) values(inserted_id,'request_received','new');
  if payload->>'session_id' is not null then
   insert into course_events(id,session_id,name,edition) values((payload->>'request_id')::uuid,(payload->>'session_id')::uuid,'registration_submitted',payload->>'edition') on conflict do nothing;
  end if;
 end if;
end; $$;
create function public.configure_course_operation(edition_id text,settings jsonb,enabled boolean,sms boolean,invoicing boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform public.configure_course_edition(edition_id,settings,enabled);
 perform public.configure_course_channels(edition_id,sms,invoicing);
end;$$;
revoke all on function public.configure_course_operation(text,jsonb,boolean,boolean,boolean) from public,anon;
grant execute on function public.configure_course_operation(text,jsonb,boolean,boolean,boolean) to authenticated;

create function public.course_period_metrics(edition_id text default null,since timestamptz default null) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden';end if;
 return jsonb_build_object(
 'sessions',(select count(distinct session_id) from course_events where name='page_view' and (since is null or created_at>=since)),
 'quiz_completed',(select count(distinct session_id) from course_events where name='quiz_completed' and (since is null or created_at>=since)),
 'pricing_sessions',(select count(distinct session_id) from course_events where name='pricing_viewed' and (since is null or created_at>=since)),
 'registration_sessions',(select count(distinct session_id) from course_events where name='registration_started' and (edition_id is null or edition=edition_id) and (since is null or created_at>=since)),
 'requests',(select count(*) from course_registrations where (edition_id is null or edition=edition_id) and (since is null or created_at>=since)),
 'confirmed',(select count(*) from course_registrations where status='confirmed' and (edition_id is null or edition=edition_id) and (since is null or paid_at>=since)),
 'revenue_cents',(select coalesce(sum(p.amount_cents),0) from course_payments p join course_registrations r on r.id=p.registration_id where p.state='paid' and (edition_id is null or r.edition=edition_id) and (since is null or p.paid_at>=since)),
 'followups_due',(select count(*) from course_registrations where next_followup_at<=now() and status<>'cancelled' and (edition_id is null or edition=edition_id)),
 'tasks_due',(select count(*) from course_tasks t join course_registrations r on r.id=t.registration_id where t.state='pending' and t.due_at<=now() and (edition_id is null or r.edition=edition_id)));
end;$$;
revoke all on function public.course_period_metrics(text,timestamptz) from public,anon;
grant execute on function public.course_period_metrics(text,timestamptz) to authenticated;
create or replace function public.record_course_invoice(request_uuid uuid,external_document_id text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden'; end if;
 if external_document_id is null or external_document_id !~ '^[A-Za-z0-9/_ .-]{1,100}$' then raise exception 'Invalid document reference';end if;
 if not exists(select 1 from course_payments where registration_id=request_uuid and state='paid') then raise exception 'Payment required';end if;
 perform 1 from course_invoices where registration_id=request_uuid for update;
 if exists(select 1 from course_jobs where registration_id=request_uuid and kind='invoice' and (state in ('processing','review') or (attempts>0 and state<>'sent'))) then raise exception 'Invoice operation requires reconciliation';end if;
 if exists(select 1 from course_invoices where registration_id=request_uuid and document_id is not null and document_id<>external_document_id) then raise exception 'Existing invoice cannot be overwritten';end if;
 update course_invoices set document_id=external_document_id,state='issued',updated_at=now() where registration_id=request_uuid;
 if not found then raise exception 'Invoice record missing';end if;
 update course_jobs set state='cancelled',error_code='invoice_recorded_manually' where registration_id=request_uuid and kind='invoice' and state in ('queued','blocked') and attempts=0;
 insert into course_activity(registration_id,actor_id,action) values(request_uuid,auth.uid(),'invoice_reference_recorded');
end; $$;
commit;
