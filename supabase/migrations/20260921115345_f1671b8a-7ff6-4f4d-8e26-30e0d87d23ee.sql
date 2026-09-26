begin;
alter table course_editions add column if not exists modality text not null default 'lisboa' check(modality in ('lisboa','porto','online'));
alter table course_editions add column if not exists availability text not null default 'open' check(availability in ('draft','open','sold_out','closed'));
alter table course_editions add column if not exists wp_product_id bigint;
alter table course_editions add column if not exists wp_revision bigint not null default 0;
create unique index if not exists course_editions_wp_product_unique on course_editions(wp_product_id) where wp_product_id is not null;
update course_editions set modality=case when id like 'online%' then 'online' when id like 'porto%' then 'porto' else 'lisboa' end;
alter table course_registrations drop constraint if exists course_registrations_edition_check;
alter table course_events drop constraint if exists course_events_edition_check;
alter table course_events add constraint course_events_edition_fkey foreign key(edition) references course_editions(id);
alter table course_registrations add column if not exists wp_order_id bigint unique;
alter table course_registrations add column if not exists wp_revision bigint not null default 0;
alter table course_registrations add column if not exists commerce_source text not null default 'course' check(commerce_source in ('course','woocommerce'));

create or replace function sync_course_wp_edition(payload jsonb) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare e course_editions; ident text:=payload->>'id'; rev bigint:=(payload->>'revision')::bigint; mode text:=payload->>'modality'; s timestamptz:=(payload->>'starts_at')::timestamptz; en timestamptz:=(payload->>'ends_at')::timestamptz;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 if not(payload ?& array['id','revision','modality','starts_at','ends_at','label','early_net_cents','net_cents','capacity','availability','product_id']) or ident is null or rev is null or mode is null or en is null or ident !~ '^(lisboa|porto|online)-[a-z0-9-]{4,60}$' or mode not in ('lisboa','porto','online') or rev<1 or s is null or en<=s or length(payload->>'label') not between 2 and 140 or (payload->>'early_net_cents')::int<=0 or (payload->>'net_cents')::int<=0 or (payload->>'capacity')::int not between 1 and 10000 or payload->>'availability' not in ('draft','open','sold_out','closed') then raise exception 'Invalid edition';end if;
 perform pg_advisory_xact_lock(hashtext('wp-edition:'||ident));
 select * into e from course_editions where id=ident for update;
 if found and e.wp_revision>=rev then return jsonb_build_object('accepted',true,'revision',e.wp_revision);end if;
 insert into course_editions(id,label,starts_at,ends_at,early_until,early_net_cents,net_cents,capacity,modality,availability,wp_product_id,wp_revision,operations,sales_enabled)
 values(ident,payload->>'label',s,en,nullif(payload->>'early_until','')::timestamptz,(payload->>'early_net_cents')::int,(payload->>'net_cents')::int,(payload->>'capacity')::int,mode,payload->>'availability',(payload->>'product_id')::bigint,rev,coalesce(payload->'operations','{}'::jsonb),false)
 on conflict(id) do update set label=excluded.label,starts_at=excluded.starts_at,ends_at=excluded.ends_at,early_until=excluded.early_until,early_net_cents=excluded.early_net_cents,net_cents=excluded.net_cents,capacity=excluded.capacity,modality=excluded.modality,availability=excluded.availability,wp_product_id=excluded.wp_product_id,wp_revision=excluded.wp_revision,operations=course_editions.operations||excluded.operations,sales_enabled=false;
 -- Reschedule only unsent automatic reminders. Manual campaigns and delivery history remain intact.
 update course_jobs j set due_at=case j.template when 'practical_information' then greatest(now(),s-interval '2 days') when 'practical_sms' then greatest(now(),s-interval '1 day') when 'resources' then en+interval '1 day' when 'individual_after' then en+interval '7 days' when 'after_sms' then en+interval '14 days' else j.due_at end
 from course_registrations r where j.registration_id=r.id and r.edition=ident and j.state in ('queued','blocked') and j.campaign_id is null;
 update course_tasks t set due_at=case t.task_key when 'practical_information' then s-interval '2 days' when 'resources' then en+interval '1 day' when 'individual_after' then en+interval '7 days' when 'individual_before' then least(t.due_at,s-interval '1 day') else t.due_at end from course_registrations r where t.registration_id=r.id and r.edition=ident and t.state='pending';
 return jsonb_build_object('accepted',true,'revision',rev);
end;$$;
revoke all on function sync_course_wp_edition(jsonb) from public,anon,authenticated;
grant execute on function sync_course_wp_edition(jsonb) to service_role;

create or replace function sync_course_woo_order(payload jsonb) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r course_registrations; p course_payments; e course_editions; oid bigint:=(payload->>'order_id')::bigint; rev bigint:=(payload->>'revision')::bigint; st text:=payload->>'state'; total integer:=(payload->>'amount_cents')::integer; net integer:=(payload->>'net_cents')::integer; rid uuid; target text; previous text;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden';end if;
 if not(payload ?& array['site','order_id','revision','state','amount_cents','net_cents','currency','name','email','request_id','edition','product_id','paid']) or oid is null or rev is null or st is null or total is null or net is null or payload->>'site' is null or payload->>'name' is null or payload->>'email' is null or payload->>'site'<>'https://fredericocarvalho.pt' or oid<1 or rev<1 or st not in ('pending','on-hold','processing','completed','cancelled','failed','refunded','partial_refund') or total<=0 or net<0 or net>total or payload->>'currency'<>'EUR' or length(payload->>'name') not between 2 and 120 or length(payload->>'email')>254 or payload->>'email' !~ '^[^ @]+@[^ @]+\.[^ @]+$' then raise exception 'Invalid order';end if;
 select * into e from course_editions where id=payload->>'edition';
 if not found or e.wp_product_id is distinct from (payload->>'product_id')::bigint then raise exception 'Edition mismatch';end if;
 perform pg_advisory_xact_lock(hashtext('wp-order:'||oid));
 select * into r from course_registrations where wp_order_id=oid for update;
 if found and rev<=r.wp_revision then return jsonb_build_object('accepted',true,'duplicate',true);end if;
 if found and (r.edition<>e.id or r.email<>lower(payload->>'email')) then raise exception 'Identity changed: review required';end if;
 if not found then
  if exists(select 1 from course_registrations where edition=e.id and email=lower(payload->>'email')) then raise exception 'Duplicate participant: review required';end if;
  insert into course_registrations(request_id,edition,name,email,phone,privacy_version,terms_version,analytics_session,attribution,sms_consent,marketing_consent,wp_order_id,commerce_source)
  values((payload->>'request_id')::uuid,e.id,payload->>'name',lower(payload->>'email'),coalesce(payload->>'phone',''),'wordpress-checkout',coalesce(payload->>'terms_version','wordpress-checkout'),nullif(payload->>'session_id','')::uuid,coalesce(payload->'attribution','{}'::jsonb),coalesce((payload->>'sms_consent')::boolean,false),coalesce((payload->>'marketing_consent')::boolean,false),oid,'woocommerce') returning * into r;
  insert into course_activity(registration_id,action,status) values(r.id,'woocommerce_order_received','new');
  if r.analytics_session is not null then insert into course_events(id,session_id,name,edition) values(r.request_id,r.analytics_session,'registration_submitted',r.edition) on conflict do nothing;end if;
 end if;
 previous:=r.status;
 target:=case when st in ('processing','completed') and (payload->>'paid')::boolean is true then 'confirmed' when st in ('refunded','cancelled','failed') then 'cancelled' when st='partial_refund' then 'contacted' else 'awaiting_payment' end;
 select * into p from course_payments where registration_id=r.id for update;
 if found and p.state='refunded' and st<>'refunded' then raise exception 'Refunded order requires review';end if;
 insert into course_payments(registration_id,amount_cents,net_cents,vat_percent,state,provider_transaction,paid_transaction,paid_at)
 values(r.id,total,net,case when net>0 then round((total-net)*100.0/net)::int else 0 end,case when target='confirmed' then 'paid' when st='refunded' then 'refunded' when st='partial_refund' then 'review' when target='cancelled' then 'cancelled' else 'ready' end,'woocommerce:'||oid,case when target='confirmed' then 'woocommerce:'||oid else null end,case when target='confirmed' then coalesce(nullif(payload->>'paid_at','')::timestamptz,now()) else null end)
 on conflict(registration_id) do update set amount_cents=excluded.amount_cents,net_cents=excluded.net_cents,vat_percent=excluded.vat_percent,state=excluded.state,paid_transaction=coalesce(excluded.paid_transaction,course_payments.paid_transaction),paid_at=coalesce(excluded.paid_at,course_payments.paid_at);
 update course_registrations set status=target,paid_at=case when target='confirmed' then coalesce(nullif(payload->>'paid_at','')::timestamptz,now()) else paid_at end,wp_revision=rev,updated_at=now() where id=r.id;
 -- WooCommerce owns the purchase confirmation and invoicing, CRM owns course reminders.
 update course_jobs set state='cancelled',error_code='managed_by_woocommerce' where registration_id=r.id and (kind='invoice' or template='confirmation') and state in ('queued','blocked');
 if st='partial_refund' then update course_jobs set state='blocked',error_code='partial_refund_review' where registration_id=r.id and state='queued';end if;
 if target='confirmed' then
  insert into course_tasks(registration_id,stage,task_key,due_at) values(r.id,'pre_event','individual_before',least(now()+interval '1 day',e.starts_at-interval '1 day')),(r.id,'pre_event','practical_information',e.starts_at-interval '2 days'),(r.id,'post_event','resources',e.ends_at+interval '1 day'),(r.id,'post_event','individual_after',e.ends_at+interval '7 days') on conflict do nothing;
 elsif target='cancelled' then update course_tasks set state='cancelled' where registration_id=r.id and state='pending';end if;
 if previous<>target or st='partial_refund' then insert into course_activity(registration_id,action,previous_status,status) values(r.id,'woocommerce_'||st,previous,target);end if;
 return jsonb_build_object('accepted',true,'state',target);
end;$$;
revoke all on function sync_course_woo_order(jsonb) from public,anon,authenticated;
grant execute on function sync_course_woo_order(jsonb) to service_role;
commit;