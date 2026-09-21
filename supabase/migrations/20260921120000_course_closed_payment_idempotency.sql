-- A repeated terminal callback must not duplicate activity or change the terminal outcome.
create or replace function public.confirm_course_payment(payment_uuid uuid,transaction_id text,paid_cents integer,payment_currency text,payment_state text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare p course_payments; r course_registrations; e course_editions;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden'; end if;
 select * into p from course_payments where id=payment_uuid for update;
 if not found then raise exception 'Payment not found'; end if;
 if p.amount_cents<>paid_cents or payment_currency<>'EUR' or length(transaction_id)<1 then raise exception 'Payment mismatch'; end if;
 if payment_state in ('Expired','Cancel') then
  if p.state in ('paid','refunded','expired','cancelled') then return;end if;
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
