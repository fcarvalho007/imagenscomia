-- Isolated course sales. No legacy triggers, email deliveries or fiscal documents.
begin;
grant all on public.course_registrations,public.course_events,public.course_activity to service_role;
alter table public.course_registrations add column paid_at timestamptz;
alter table public.course_registrations add column terms_version text not null default 'curso-ia-v1';
create table public.course_editions (
 id text primary key, label text not null, starts_at timestamptz not null, ends_at timestamptz not null,
 early_until timestamptz, early_net_cents integer not null, net_cents integer not null,
 vat_percent integer not null default 23, capacity integer not null default 16, sales_enabled boolean not null default false,
 check (early_net_cents>0 and net_cents>0 and capacity>0)
);
insert into public.course_editions(id,label,starts_at,ends_at,early_until,early_net_cents,net_cents) values
('lisboa-2026','Lisboa · presencial','2026-10-29 09:00:00+00','2026-10-30 17:30:00+00','2026-10-19 23:00:00+00',49700,59700),
('porto-2026','Porto · presencial','2026-11-19 09:00:00+00','2026-11-20 17:30:00+00','2026-11-10 00:00:00+00',49700,59700),
('online-2026','Online · em direto','2026-12-02 09:30:00+00','2026-12-11 13:00:00+00',null,39700,39700);
alter table public.course_registrations add foreign key (edition) references public.course_editions(id);
create table public.course_payments (
 id uuid primary key default gen_random_uuid(), registration_id uuid not null unique references public.course_registrations(id),
 amount_cents integer not null check(amount_cents>0), net_cents integer not null, vat_percent integer not null,
 state text not null default 'creating' check(state in ('creating','ready','paid','refunded','review','expired','cancelled')),
 provider_transaction text unique, paid_transaction text unique, payment_url text,
 created_at timestamptz not null default now(), paid_at timestamptz
);
create table public.course_invoices (
 registration_id uuid primary key references public.course_registrations(id),
 state text not null default 'awaiting_data' check(state in ('awaiting_data','ready','issued','review')),
 billing jsonb not null default '{}'::jsonb, document_id text unique,
 updated_at timestamptz not null default now()
);
create table public.course_tasks (
 id uuid primary key default gen_random_uuid(), registration_id uuid not null references public.course_registrations(id),
 stage text not null check(stage in ('pre_event','post_event')), task_key text not null,
 due_at timestamptz not null, state text not null default 'pending' check(state in ('pending','done','cancelled')),
 unique(registration_id,task_key)
);
-- These are operational tasks, NOT an active message queue. No sends occur here.
alter table public.course_editions enable row level security;
alter table public.course_payments enable row level security;
alter table public.course_invoices enable row level security;
alter table public.course_tasks enable row level security;
revoke all on public.course_editions,public.course_payments,public.course_invoices,public.course_tasks from anon,authenticated;
grant select on public.course_editions,public.course_payments,public.course_invoices,public.course_tasks to authenticated;
grant all on public.course_editions,public.course_payments,public.course_invoices,public.course_tasks to service_role;
create policy course_editions_read on public.course_editions for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create policy course_payments_read on public.course_payments for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create policy course_invoices_read on public.course_invoices for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create policy course_tasks_read on public.course_tasks for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');

create function public.course_quote(edition_id text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare e course_editions; net integer;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden'; end if;
 select * into e from course_editions where id=edition_id;
 if not found or not e.sales_enabled or now()>=e.starts_at then raise exception 'Edition unavailable'; end if;
 net:=case when e.early_until is not null and now()<e.early_until then e.early_net_cents else e.net_cents end;
 return jsonb_build_object('net_cents',net,'vat_percent',e.vat_percent,'amount_cents',round(net*(100+e.vat_percent)/100.0)::integer,'currency','EUR');
end; $$;
revoke all on function public.course_quote(text) from public,anon,authenticated;
grant execute on function public.course_quote(text) to service_role;

create function public.claim_course_payment(payload jsonb,expected_amount integer) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r course_registrations; p course_payments; q jsonb; capacity_limit integer; held integer;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden'; end if;
 -- Serialise capacity checks and claims per edition. Keep uncertain orders reserved for reconciliation.
 select capacity into capacity_limit from course_editions where id=payload->>'edition' for update;
 if not found then raise exception 'Unavailable'; end if;
 q:=course_quote(payload->>'edition');
 if expected_amount is null or expected_amount<>(q->>'amount_cents')::integer then return jsonb_build_object('state','price_changed','quote',q); end if;
 perform ingest_course_request(payload);
 select * into r from course_registrations where request_id=(payload->>'request_id')::uuid;
 -- A new browser cannot recover another person's payment link by entering their email.
 if not found or r.email<>payload->>'email' or r.edition<>payload->>'edition' then return jsonb_build_object('state','contact_support'); end if;
 select * into p from course_payments where registration_id=r.id;
 if found then return jsonb_build_object('state',p.state,'payment_url',case when p.state='ready' then p.payment_url else null end,'amount_cents',p.amount_cents); end if;
 select count(*) into held from course_payments p2 join course_registrations r2 on r2.id=p2.registration_id where r2.edition=r.edition and p2.state not in ('refunded','expired','cancelled');
 if held>=capacity_limit then return jsonb_build_object('state','full'); end if;
 insert into course_payments(registration_id,amount_cents,net_cents,vat_percent) values(r.id,(q->>'amount_cents')::integer,(q->>'net_cents')::integer,(q->>'vat_percent')::integer) returning * into p;
 update course_registrations set status='awaiting_payment',updated_at=now() where id=r.id;
 return jsonb_build_object('state','claimed','id',p.id,'amount_cents',p.amount_cents);
end; $$;
revoke all on function public.claim_course_payment(jsonb,integer) from public,anon,authenticated;
grant execute on function public.claim_course_payment(jsonb,integer) to service_role;

create function public.confirm_course_payment(payment_uuid uuid,transaction_id text,paid_cents integer,payment_currency text,payment_state text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare p course_payments; r course_registrations; e course_editions;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden'; end if;
 select * into p from course_payments where id=payment_uuid for update;
 if not found then raise exception 'Payment not found'; end if;
 if p.amount_cents<>paid_cents or payment_currency<>'EUR' or length(transaction_id)<1 then raise exception 'Payment mismatch'; end if;
 if payment_state in ('Expired','Cancel') then
  if p.state in ('paid','refunded') then return;end if;
  update course_payments set state=case when payment_state='Expired' then 'expired' else 'cancelled' end where id=p.id;
  update course_registrations set status='cancelled',updated_at=now() where id=p.registration_id;
  insert into course_activity(registration_id,action,status) values(p.registration_id,'payment_closed','cancelled');return;
 end if;
 if payment_state='Refund' then
  if p.state in ('expired','cancelled') then raise exception 'Closed order requires reconciliation';end if;
 if p.state='refunded' then return; end if;
  if p.state<>'paid' then raise exception 'Refund without payment'; end if;
  update course_payments set state='refunded' where id=p.id;
  update course_registrations set status='cancelled',updated_at=now() where id=p.registration_id;
  update course_invoices set state='review',updated_at=now() where registration_id=p.registration_id;
  update course_tasks set state='cancelled' where registration_id=p.registration_id and state='pending';
  insert into course_activity(registration_id,action,status) values(p.registration_id,'payment_refunded','cancelled');return;
 end if;
 if payment_state<>'Paid' then raise exception 'Unsupported payment status'; end if;
 if p.state='paid' then
  if p.paid_transaction<>transaction_id then raise exception 'Duplicate charge requires review'; end if;return;
 end if;
 if p.state in ('expired','cancelled') then raise exception 'Closed order requires reconciliation';end if;
 if p.state='refunded' then return; end if; -- a delayed Paid webhook must not resurrect a refund
 update course_payments set state='paid',paid_transaction=transaction_id,paid_at=now() where id=p.id;
 update course_registrations set status='confirmed',paid_at=now(),updated_at=now() where id=p.registration_id returning * into r;
 insert into course_invoices(registration_id) values(r.id) on conflict do nothing;
 select * into e from course_editions where id=r.edition;
 insert into course_tasks(registration_id,stage,task_key,due_at) values
 (r.id,'pre_event','individual_before',least(now()+interval '1 day',e.starts_at-interval '1 day')),
 (r.id,'pre_event','practical_information',e.starts_at-interval '2 days'),
 (r.id,'post_event','resources',e.ends_at+interval '1 day'),
 (r.id,'post_event','individual_after',e.ends_at+interval '7 days') on conflict do nothing;
 insert into course_activity(registration_id,action,status) values(r.id,'payment_confirmed','confirmed');
end; $$;
revoke all on function public.confirm_course_payment(uuid,text,integer,text,text) from public,anon,authenticated;
grant execute on function public.confirm_course_payment(uuid,text,integer,text,text) to service_role;

-- Staff can follow up but cannot manufacture a payment confirmation.
create or replace function public.update_course_request(request_uuid uuid,new_status text,new_notes text,followup timestamptz) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare old_status text;
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden'; end if;
 if new_status not in ('new','contacted','awaiting_payment','confirmed','cancelled') or new_status is null or length(coalesce(new_notes,''))>4000 then raise exception 'Invalid update'; end if;
 select status into old_status from course_registrations where id=request_uuid for update;
 if not found then raise exception 'Not found'; end if;
 if (old_status='confirmed' or new_status='confirmed') and old_status<>new_status then raise exception 'Use payment reconciliation for confirmed registrations'; end if;
 update course_registrations set status=new_status,notes=coalesce(new_notes,''),next_followup_at=followup,updated_at=now() where id=request_uuid;
 insert into course_activity(registration_id,actor_id,action,previous_status,status) values(request_uuid,auth.uid(),'manual_update',old_status,new_status);
end; $$;

create or replace function public.course_metrics() returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin return public.course_edition_metrics(null); end; $$;
create function public.course_edition_metrics(edition_id text default null) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden'; end if;
 return jsonb_build_object(
 'sessions',(select count(distinct session_id) from course_events where name='page_view'),
 'quiz_completed',(select count(distinct session_id) from course_events where name='quiz_completed'),
 'pricing_sessions',(select count(distinct session_id) from course_events where name='pricing_viewed'),
 'registration_sessions',(select count(distinct session_id) from course_events where name='registration_started' and (edition_id is null or edition=edition_id)),
 'requests',(select count(*) from course_registrations where edition_id is null or edition=edition_id),
 'confirmed',(select count(*) from course_registrations where status='confirmed' and (edition_id is null or edition=edition_id)),
 'revenue_cents',(select coalesce(sum(p.amount_cents),0) from course_payments p join course_registrations r on r.id=p.registration_id where p.state='paid' and (edition_id is null or r.edition=edition_id)),
 'followups_due',(select count(*) from course_registrations where next_followup_at<=now() and status<>'cancelled' and (edition_id is null or edition=edition_id)),
 'tasks_due',(select count(*) from course_tasks t join course_registrations r on r.id=t.registration_id where t.state='pending' and t.due_at<=now() and (edition_id is null or r.edition=edition_id)));
end; $$;
revoke all on function public.course_edition_metrics(text) from public,anon;
grant execute on function public.course_edition_metrics(text) to authenticated;
create function public.finish_course_task(task_uuid uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r uuid;
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden'; end if;
 update course_tasks set state='done' where id=task_uuid and state='pending' returning registration_id into r;
 if r is not null then insert into course_activity(registration_id,actor_id,action) values(r,auth.uid(),'task_completed');end if;
end; $$;
revoke all on function public.finish_course_task(uuid) from public,anon;
grant execute on function public.finish_course_task(uuid) to authenticated;
commit;