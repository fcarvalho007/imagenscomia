begin;
-- Record an existing InvoiceXpress document after issuance; this does not issue a fiscal document.
create function public.record_course_invoice(request_uuid uuid,external_document_id text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not coalesce(public.has_role(auth.uid(),'admin'),false) or coalesce(auth.jwt()->>'aal','')<>'aal2' then raise exception 'Forbidden'; end if;
 if external_document_id is null or external_document_id !~ '^[A-Za-z0-9/_ .-]{1,100}$' then raise exception 'Invalid document reference';end if;
 if not exists(select 1 from course_payments where registration_id=request_uuid and state='paid') then raise exception 'Payment required';end if;
 update course_invoices set document_id=external_document_id,state='issued',updated_at=now() where registration_id=request_uuid;
 if not found then raise exception 'Invoice record missing';end if;
 insert into course_activity(registration_id,actor_id,action) values(request_uuid,auth.uid(),'invoice_reference_recorded');
end; $$;
revoke all on function public.record_course_invoice(uuid,text) from public,anon;
grant execute on function public.record_course_invoice(uuid,text) to authenticated;
commit;
