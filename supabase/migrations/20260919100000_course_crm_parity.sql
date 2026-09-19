-- Course administration only. Does not enable suppliers, payments or message delivery.
begin;
alter table public.course_registrations add column do_not_contact boolean not null default false;
create function public.course_admin_required() returns void language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden';end if;
end;$$;
revoke all on function public.course_admin_required() from public,anon;
grant execute on function public.course_admin_required() to authenticated;
create function public.set_course_contact_pause(request_uuid uuid,paused boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform public.course_admin_required();
 if paused is null then raise exception 'Invalid pause';end if;
 update course_registrations set do_not_contact=paused where id=request_uuid;
 if not found then raise exception 'Registration not found';end if;
 insert into course_activity(registration_id,actor_id,action) values(request_uuid,auth.uid(),case when paused then 'contact_paused' else 'contact_resumed' end);
end;$$;
revoke all on function public.set_course_contact_pause(uuid,boolean) from public,anon;
grant execute on function public.set_course_contact_pause(uuid,boolean) to authenticated;
-- Reuse the original state-transition rules, adding a lock and stale-write protection.
create function public.update_course_request_checked(request_uuid uuid,new_status text,new_notes text,followup timestamptz,expected_status text,expected_notes text,expected_followup timestamptz) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare r course_registrations;
begin
 perform public.course_admin_required();
 select * into r from course_registrations where id=request_uuid for update;
 if not found then raise exception 'Registration not found';end if;
 if r.status is distinct from expected_status or r.notes is distinct from expected_notes or r.next_followup_at is distinct from expected_followup then raise exception 'Changed by another operator; reload';end if;
 perform public.update_course_request(request_uuid,new_status,new_notes,followup);
end;$$;
revoke all on function public.update_course_request_checked(uuid,text,text,timestamptz,text,text,timestamptz) from public,anon;
grant execute on function public.update_course_request_checked(uuid,text,text,timestamptz,text,text,timestamptz) to authenticated;

create table public.course_costs (
 id uuid primary key default gen_random_uuid(), edition text not null references course_editions(id),
 platform text not null check(length(platform) between 1 and 120), description text not null default '' check(length(description)<=500),
 amount numeric(12,2) not null check(amount>0), cost_date date not null, category text not null check(category in ('paid_media','plataforma','producao','outro')),
 updated_at timestamptz not null default now()
);
alter table public.course_costs enable row level security;
revoke all on public.course_costs from public,anon,authenticated;
grant select on public.course_costs to authenticated;
grant all on public.course_costs to service_role;
create policy course_costs_admin on public.course_costs for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create function public.save_course_cost(cost_id uuid,edition_id text,cost_platform text,cost_description text,cost_amount numeric,cost_day date,cost_category text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare saved uuid;
begin
 perform public.course_admin_required();
 if cost_id is null then
 insert into course_costs(edition,platform,description,amount,cost_date,category) values(edition_id,btrim(cost_platform),btrim(cost_description),cost_amount,cost_day,cost_category) returning id into saved;
 else
 update course_costs set platform=btrim(cost_platform),description=btrim(cost_description),amount=cost_amount,cost_date=cost_day,category=cost_category,updated_at=now() where id=cost_id and edition=edition_id returning id into saved;
 if not found then raise exception 'Cost not found in edition';end if;
 end if;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'cost_saved',edition_id);
 return saved;
end;$$;
create function public.delete_course_cost(cost_id uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare ed text;
begin
 perform public.course_admin_required();
 delete from course_costs where id=cost_id returning edition into ed;
 if not found then raise exception 'Cost not found';end if;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'cost_deleted',ed);
end;$$;
revoke all on function public.save_course_cost(uuid,text,text,text,numeric,date,text),public.delete_course_cost(uuid) from public,anon;
grant execute on function public.save_course_cost(uuid,text,text,text,numeric,date,text),public.delete_course_cost(uuid) to authenticated;

create table public.course_campaigns (
 id uuid primary key, edition text not null references course_editions(id), channel text not null check(channel in ('email','sms')),
 subject text not null default '', body text not null, due_at timestamptz not null, created_at timestamptz not null default now(), actor_id uuid not null,
 recipient_ids uuid[] not null
);
alter table public.course_campaigns enable row level security;
revoke all on public.course_campaigns from public,anon,authenticated;
grant select on public.course_campaigns to authenticated;
grant all on public.course_campaigns to service_role;
create policy course_campaigns_admin on public.course_campaigns for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
alter table public.course_jobs add column campaign_id uuid references course_campaigns(id);
create function public.queue_course_campaign(campaign_uuid uuid,edition_id text,channel text,subject text,body text,recipients uuid[],scheduled_at timestamptz) returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer; old course_campaigns; ids uuid[]; e course_editions;
begin
 perform public.course_admin_required();
 if campaign_uuid is null or channel is null or channel not in ('email','sms') or body is null or length(btrim(body)) not between 1 and 10000 or subject is null or length(subject)>160 or subject ~ '[\r\n]' or (channel='email' and length(btrim(subject))<2) then raise exception 'Invalid content';end if;
 if channel='sms' and (length(body)>160 or body ~ '[^ -~]' or body ~ '[\[\]{}^~|\\]') then raise exception 'SMS must fit one basic GSM segment';end if;
 select array_agg(distinct x order by x) into ids from unnest(recipients) x;
 n:=coalesce(cardinality(ids),0);
 if n<1 or n>200 then raise exception 'Choose 1 to 200 recipients';end if;
 -- Serialize retries before checking the saved immutable campaign.
 perform pg_advisory_xact_lock(hashtext(campaign_uuid::text));
 select * into old from course_campaigns where id=campaign_uuid;
 if found then
  if old.edition<>edition_id or old.channel<>channel or old.subject<>subject or old.body<>body or old.recipient_ids<>ids or old.due_at is distinct from scheduled_at then raise exception 'Idempotency conflict';end if;
  return cardinality(old.recipient_ids);
 end if;
 select * into e from course_editions where id=edition_id;
 if not found or scheduled_at is null or scheduled_at<now()-interval '5 minutes' or scheduled_at>now()+interval '1 year' or scheduled_at between e.starts_at and e.ends_at then raise exception 'Choose a date outside the event';end if;
 if channel='sms' and extract(hour from scheduled_at at time zone 'Europe/Lisbon') not between 8 and 19 then raise exception 'SMS hours 08:00 to 20:00 Lisbon';end if;
 -- No browser-provided email addresses. All recipients resolved and checked here.
 if (select count(*) from course_registrations r join course_payments p on p.registration_id=r.id where r.id=any(ids) and r.edition=edition_id and r.status='confirmed' and p.state='paid' and not r.do_not_contact and (channel='email' or (r.sms_consent and regexp_replace(r.phone,'[^0-9]','','g') ~ '^(351)?9[1236][0-9]{7}$')))<>n then raise exception 'Recipients changed or ineligible';end if;
 insert into course_campaigns(id,edition,channel,subject,body,due_at,actor_id,recipient_ids) values(campaign_uuid,edition_id,channel,subject,body,scheduled_at,auth.uid(),ids);
 insert into course_jobs(registration_id,kind,template,due_at,campaign_id) select x,channel,'manual_'||campaign_uuid::text,scheduled_at,campaign_uuid from unnest(ids) x;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'campaign_queued',edition_id);
 return n;
end;$$;
revoke all on function public.queue_course_campaign(uuid,text,text,text,text,uuid[],timestamptz) from public,anon;
grant execute on function public.queue_course_campaign(uuid,text,text,text,text,uuid[],timestamptz) to authenticated;

-- Retain all existing eligibility rules, including the protected payment check.
alter function public.course_job_eligible(public.course_jobs) rename to course_job_eligible_base;
create function public.course_job_eligible(j public.course_jobs) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select public.course_job_eligible_base(j) and (j.kind='invoice' or exists(select 1 from course_registrations r where r.id=j.registration_id and not r.do_not_contact));
$$;
revoke all on function public.course_job_eligible(public.course_jobs) from public,anon,authenticated;
grant execute on function public.course_job_eligible(public.course_jobs) to service_role;
create function public.manage_course_job(job_uuid uuid,action text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare j course_jobs;
begin
 perform public.course_admin_required();
 select * into j from course_jobs where id=job_uuid for update;
 if not found or j.attempts<>0 or j.state not in ('queued','blocked') then raise exception 'Only unattempted operations can be changed';end if;
 if action='cancel' then update course_jobs set state='cancelled',error_code='cancelled_by_admin' where id=j.id;
 elsif action='retry' and j.state='blocked' then update course_jobs set state='queued',error_code=null where id=j.id;
 else raise exception 'Invalid action';end if;
 insert into course_activity(registration_id,actor_id,action) values(j.registration_id,auth.uid(),'job_'||action);
end;$$;
revoke all on function public.manage_course_job(uuid,text) from public,anon;
grant execute on function public.manage_course_job(uuid,text) to authenticated;
create function public.course_operation_counts(edition_id text default null) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 perform public.course_admin_required();
 return (select coalesce(jsonb_object_agg(state,n),'{}') from (select j.state,count(*) n from course_jobs j join course_registrations r on r.id=j.registration_id where edition_id is null or r.edition=edition_id group by j.state) q);
end;$$;
revoke all on function public.course_operation_counts(text) from public,anon;
grant execute on function public.course_operation_counts(text) to authenticated;
create function public.validate_course_resource_url() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if new.url !~ '^https://[^/@[:space:]]+([/?#][^[:space:]]*)?$' then raise exception 'Use an HTTPS URL without credentials';end if;
 return new;
end;$$;
create trigger course_resource_url_guard before insert or update on public.course_resources for each row execute function public.validate_course_resource_url();
create table public.course_email_templates (
 edition text not null references course_editions(id), template text not null check(template in ('confirmation','individual_before','practical_information','resources','individual_after')),
 subject text not null check(length(subject) between 2 and 160 and subject !~ '[\r\n]'), body text not null check(length(body) between 10 and 10000),
 updated_at timestamptz not null default now(), primary key(edition,template)
);
alter table public.course_email_templates enable row level security;
revoke all on public.course_email_templates from public,anon,authenticated;
grant select on public.course_email_templates to authenticated;
grant all on public.course_email_templates to service_role;
create policy course_templates_admin on public.course_email_templates for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create function public.save_course_email_template(edition_id text,template_key text,email_subject text,email_body text,expected_updated_at timestamptz) returns timestamptz language plpgsql security definer set search_path=public,pg_temp as $$
declare saved timestamptz; previous timestamptz;
begin
 perform public.course_admin_required();
 perform pg_advisory_xact_lock(hashtext(edition_id||':'||template_key));
 select updated_at into previous from course_email_templates where edition=edition_id and template=template_key for update;
 if previous is distinct from expected_updated_at then raise exception 'Template changed; reload';end if;
 insert into course_email_templates(edition,template,subject,body) values(edition_id,template_key,btrim(email_subject),btrim(email_body))
 on conflict(edition,template) do update set subject=excluded.subject,body=excluded.body,updated_at=clock_timestamp() returning updated_at into saved;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'template_saved_'||template_key,edition_id);
 return saved;
end;$$;
revoke all on function public.save_course_email_template(text,text,text,text,timestamptz) from public,anon;
grant execute on function public.save_course_email_template(text,text,text,text,timestamptz) to authenticated;
commit;
