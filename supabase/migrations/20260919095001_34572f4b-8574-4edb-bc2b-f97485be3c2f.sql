alter table public.course_email_templates add column if not exists format text not null default 'text';
alter table public.course_email_templates add constraint course_email_templates_format_check check (format in ('text','html'));
alter table public.course_campaigns add column if not exists format text not null default 'text';
alter table public.course_campaigns add constraint course_campaigns_format_check check (format in ('text','html'));

drop function if exists public.save_course_email_template(text,text,text,text,timestamptz);
create function public.save_course_email_template(edition_id text,template_key text,email_subject text,email_body text,expected_updated_at timestamptz,body_format text default 'text') returns timestamptz language plpgsql security definer set search_path=public,pg_temp as $$
declare saved timestamptz; previous timestamptz;
begin
 perform public.course_admin_required();
 if body_format is null or body_format not in ('text','html') then raise exception 'Invalid format';end if;
 if email_body is null or length(email_body)>20000 then raise exception 'Invalid body';end if;
 perform pg_advisory_xact_lock(hashtext(edition_id||':'||template_key));
 select updated_at into previous from course_email_templates where edition=edition_id and template=template_key for update;
 if previous is distinct from expected_updated_at then raise exception 'Template changed; reload';end if;
 insert into course_email_templates(edition,template,subject,body,format) values(edition_id,template_key,btrim(email_subject),btrim(email_body),body_format)
 on conflict(edition,template) do update set subject=excluded.subject,body=excluded.body,format=excluded.format,updated_at=clock_timestamp() returning updated_at into saved;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'template_saved_'||template_key,edition_id);
 return saved;
end;$$;
revoke all on function public.save_course_email_template(text,text,text,text,timestamptz,text) from public,anon;
grant execute on function public.save_course_email_template(text,text,text,text,timestamptz,text) to authenticated;

drop function if exists public.queue_course_campaign(uuid,text,text,text,text,uuid[],timestamptz);
create function public.queue_course_campaign(campaign_uuid uuid,edition_id text,channel text,subject text,body text,recipients uuid[],scheduled_at timestamptz,body_format text default 'text') returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer; old course_campaigns; ids uuid[]; e course_editions;
begin
 perform public.course_admin_required();
 if campaign_uuid is null or channel is null or channel not in ('email','sms') or body is null or length(btrim(body)) not between 1 and 20000 or subject is null or length(subject)>160 or subject ~ '[\r\n]' or (channel='email' and length(btrim(subject))<2) then raise exception 'Invalid content';end if;
 if body_format is null or body_format not in ('text','html') or (channel='sms' and body_format<>'text') then raise exception 'Invalid format';end if;
 if channel='sms' and (length(body)>160 or body ~ '[^ -~]' or body ~ '[\[\]{}^~|\\]') then raise exception 'SMS must fit one basic GSM segment';end if;
 select array_agg(distinct x order by x) into ids from unnest(recipients) x;
 n:=coalesce(cardinality(ids),0);
 if n<1 or n>200 then raise exception 'Choose 1 to 200 recipients';end if;
 perform pg_advisory_xact_lock(hashtext(campaign_uuid::text));
 select * into old from course_campaigns where id=campaign_uuid;
 if found then
  if old.edition<>edition_id or old.channel<>channel or old.subject<>subject or old.body<>body or old.recipient_ids<>ids or old.due_at is distinct from scheduled_at or old.format<>body_format then raise exception 'Idempotency conflict';end if;
  return cardinality(old.recipient_ids);
 end if;
 select * into e from course_editions where id=edition_id;
 if not found or scheduled_at is null or scheduled_at<now()-interval '5 minutes' or scheduled_at>now()+interval '1 year' or scheduled_at between e.starts_at and e.ends_at then raise exception 'Choose a date outside the event';end if;
 if channel='sms' and extract(hour from scheduled_at at time zone 'Europe/Lisbon') not between 8 and 19 then raise exception 'SMS hours 08:00 to 20:00 Lisbon';end if;
 if (select count(*) from course_registrations r join course_payments p on p.registration_id=r.id where r.id=any(ids) and r.edition=edition_id and r.status='confirmed' and p.state='paid' and not r.do_not_contact and (channel='email' or (r.sms_consent and regexp_replace(r.phone,'[^0-9]','','g') ~ '^(351)?9[1236][0-9]{7}$')))<>n then raise exception 'Recipients changed or ineligible';end if;
 insert into course_campaigns(id,edition,channel,subject,body,due_at,actor_id,recipient_ids,format) values(campaign_uuid,edition_id,channel,subject,body,scheduled_at,auth.uid(),ids,body_format);
 insert into course_jobs(registration_id,kind,template,due_at,campaign_id) select x,channel,'manual_'||campaign_uuid::text,scheduled_at,campaign_uuid from unnest(ids) x;
 insert into course_activity(actor_id,action,edition) values(auth.uid(),'campaign_queued',edition_id);
 return n;
end;$$;
revoke all on function public.queue_course_campaign(uuid,text,text,text,text,uuid[],timestamptz,text) from public,anon;
grant execute on function public.queue_course_campaign(uuid,text,text,text,text,uuid[],timestamptz,text) to authenticated;

create table public.course_test_sends (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique,
 actor_id uuid not null,
 channel text not null check (channel in ('email','sms')),
 target text not null,
 state text not null default 'processing' check (state in ('processing','sent','review','blocked')),
 provider_id text,
 error_code text,
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
revoke all on public.course_test_sends from public,anon,authenticated;
grant select on public.course_test_sends to authenticated;
grant all on public.course_test_sends to service_role;
alter table public.course_test_sends enable row level security;
create policy course_test_sends_admin on public.course_test_sends for select to authenticated using(public.has_role(auth.uid(),'admin') and auth.jwt()->>'aal'='aal2');
create index course_test_sends_actor_idx on public.course_test_sends(actor_id,channel,created_at desc);

create function public.claim_course_test_send(actor uuid,request_uuid uuid,test_channel text,target_hint text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare existing course_test_sends; recent integer; today integer; created course_test_sends;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 if actor is null or request_uuid is null or test_channel not in ('email','sms') or coalesce(target_hint,'')='' then raise exception 'Invalid request';end if;
 perform pg_advisory_xact_lock(hashtext('course_test:'||actor::text||':'||test_channel));
 select * into existing from course_test_sends where request_id=request_uuid;
 if found then return jsonb_build_object('state',case when existing.state='processing' then 'duplicate' else existing.state end,'id',existing.id,'reason',existing.error_code);end if;
 select count(*) into recent from course_test_sends where actor_id=actor and channel=test_channel and created_at>now()-interval '1 minute';
 select count(*) into today from course_test_sends where actor_id=actor and channel=test_channel and created_at>now()-interval '24 hours';
 if recent>0 or today>=20 then return jsonb_build_object('state','throttled','retry_after_seconds',case when recent>0 then 60 else 3600 end);end if;
 insert into course_test_sends(request_id,actor_id,channel,target) values(request_uuid,actor,test_channel,target_hint) returning * into created;
 insert into course_activity(actor_id,action) values(actor,'test_send_'||test_channel||'_claimed');
 return jsonb_build_object('state','claimed','id',created.id);
end;$$;
revoke all on function public.claim_course_test_send(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.claim_course_test_send(uuid,uuid,text,text) to service_role;

create function public.finish_course_test_send(test_uuid uuid,outcome text,external_id text default null,reason text default null) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare row course_test_sends;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 if outcome not in ('sent','review','blocked') then raise exception 'Invalid outcome';end if;
 update course_test_sends set state=outcome,provider_id=coalesce(external_id,provider_id),error_code=left(reason,100),completed_at=now() where id=test_uuid and state='processing' returning * into row;
 if not found then raise exception 'Stale test send';end if;
 insert into course_activity(actor_id,action) values(row.actor_id,'test_send_'||row.channel||'_'||outcome);
end;$$;
revoke all on function public.finish_course_test_send(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.finish_course_test_send(uuid,text,text,text) to service_role;

create function public.course_cron_installed() returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if to_regclass('cron.job') is null then return false;end if;
 return exists(select 1 from cron.job where jobname='course-operations-every-5m' and active);
end;$$;
revoke all on function public.course_cron_installed() from public,anon;
grant execute on function public.course_cron_installed() to authenticated,service_role;