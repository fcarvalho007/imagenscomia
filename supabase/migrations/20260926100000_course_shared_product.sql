begin;
-- A product identifies a modality; the edition field identifies the event.
-- Keep the exact edition/product check in sync_course_woo_order and unique wp_order_id.
drop index if exists public.course_editions_wp_product_unique;
create index if not exists course_editions_wp_product_lookup on public.course_editions(wp_product_id) where wp_product_id is not null;
do $$
begin
 if (select count(*) from public.course_editions where id in ('lisboa-2026','porto-2026','online-2026')) <> 3 then raise exception 'Expected three existing course editions'; end if;
 if exists(select 1 from public.course_editions where id in ('lisboa-2026','porto-2026') and wp_product_id is not null and wp_product_id<>98080)
 or exists(select 1 from public.course_editions where id='online-2026' and wp_product_id is not null and wp_product_id<>98082) then raise exception 'Existing mapping requires review'; end if;
end $$;
update public.course_editions set wp_product_id=case when id='online-2026' then 98082 else 98080 end
where id in ('lisboa-2026','porto-2026','online-2026');
-- No orders, payments, jobs, credentials, RLS or grants are changed.
commit;
