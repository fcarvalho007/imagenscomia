create or replace function public.queue_course_operations() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare e course_editions; woo boolean;
begin
 if new.status='confirmed' and old.status is distinct from 'confirmed' then
  select * into e from course_editions where id=new.edition;
  woo := new.commerce_source='woocommerce';
  if woo then
   insert into course_jobs(registration_id,kind,template,due_at) values (new.id,'email','thank_you',now()) on conflict do nothing;
  else
   insert into course_jobs(registration_id,kind,template,due_at) values (new.id,'email','confirmation',now()),(new.id,'invoice','invoice_receipt',now()) on conflict do nothing;
  end if;
  insert into course_jobs(registration_id,kind,template,due_at) values
  (new.id,'email','individual_before',least(now()+interval '1 hour',e.starts_at-interval '1 minute')),
  (new.id,'email','practical_information',greatest(now(),e.starts_at-interval '2 days')),
  (new.id,'email','resources',e.ends_at+interval '1 day'),
  (new.id,'email','individual_after',e.ends_at+interval '7 days') on conflict do nothing;
  if new.sms_consent and new.phone<>'' then
   if woo then insert into course_jobs(registration_id,kind,template,due_at) values (new.id,'sms','thank_you_sms',now()) on conflict do nothing; end if;
   insert into course_jobs(registration_id,kind,template,due_at) values
    (new.id,'sms','practical_sms',greatest(now(),e.starts_at-interval '1 day')),
    (new.id,'sms','after_sms',e.ends_at+interval '14 days') on conflict do nothing;
  end if;
 elsif new.status='cancelled' then
  update course_jobs set state='cancelled',error_code='registration_cancelled' where registration_id=new.id and state in ('queued','blocked');
 end if;
 return new;
end; $$;

create or replace function public.course_job_eligible_base(j public.course_jobs) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from course_registrations r join course_payments p on p.registration_id=r.id join course_editions e on e.id=r.edition
 where r.id=j.registration_id and r.status='confirmed' and p.state='paid'
 and (case j.kind when 'invoice' then e.invoicing_enabled when 'sms' then e.sms_enabled and e.automation_enabled and r.sms_consent and r.phone<>'' and extract(hour from now() at time zone 'Europe/Lisbon') between 8 and 19 else e.automation_enabled end)
 and (j.kind='invoice' or now()<e.starts_at or now()>e.ends_at)
 and (j.template not in ('confirmation','thank_you','thank_you_sms','individual_before','practical_information','practical_sms') or now()<e.starts_at)
 and (j.template not in ('individual_after','after_sms') or now()<e.ends_at+interval '30 days')
 and (j.template<>'individual_before' or r.before_session='pending')
 and (j.template not in ('individual_after','after_sms') or r.after_session='pending'));
$$;
revoke all on function public.course_job_eligible_base(public.course_jobs) from public,anon,authenticated;
grant execute on function public.course_job_eligible_base(public.course_jobs) to service_role;

alter table public.course_email_templates drop constraint if exists course_email_templates_template_check;
alter table public.course_email_templates add constraint course_email_templates_template_check check(template in ('confirmation','thank_you','individual_before','practical_information','resources','individual_after'));
alter table public.course_sms_templates drop constraint if exists course_sms_templates_template_check;
alter table public.course_sms_templates add constraint course_sms_templates_template_check check(template in ('thank_you_sms','practical_sms','after_sms'));