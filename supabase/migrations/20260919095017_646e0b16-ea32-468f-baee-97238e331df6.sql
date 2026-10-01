create or replace function public.course_cron_installed() returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if coalesce(auth.role(),'')<>'service_role' then perform public.course_admin_required(); end if;
 if to_regclass('cron.job') is null then return false;end if;
 return exists(select 1 from cron.job where jobname='course-operations-every-5m' and active);
end;$$;