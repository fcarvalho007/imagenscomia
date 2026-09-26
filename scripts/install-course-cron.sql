-- Idempotent scheduling support for the course worker.
-- Applied once as a migration when the owner authorises activation.
-- No secret value lives in Git: the Edge Function course-cron-setup copies the
-- already-stored COURSE_CRON_SECRET into Vault using the service role.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Stores/refreshes the two Vault entries the scheduler needs. Service role only.
create or replace function public.course_cron_sync(p_secret text, p_url text)
returns void language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare existing uuid;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden'; end if;
 if p_secret is null or length(p_secret)<32 then raise exception 'Worker secret too short'; end if;
 if p_url is null or p_url !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/course-operations$' then raise exception 'Invalid worker endpoint'; end if;
 select id into existing from vault.secrets where name='course_cron_secret';
 if existing is null then perform vault.create_secret(p_secret,'course_cron_secret','Course worker cron header');
 else perform vault.update_secret(existing,p_secret); end if;
 select id into existing from vault.secrets where name='course_operations_url';
 if existing is null then perform vault.create_secret(p_url,'course_operations_url','Course worker endpoint');
 else perform vault.update_secret(existing,p_url); end if;
end $$;
revoke all on function public.course_cron_sync(text,text) from public, anon, authenticated;

-- Creates or converges the schedule. Never creates a second job. Service role only.
create or replace function public.course_cron_install()
returns text language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare existing bigint;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden'; end if;
 if not exists(select 1 from vault.decrypted_secrets where name='course_cron_secret' and length(decrypted_secret)>=32)
 or not exists(select 1 from vault.decrypted_secrets where name='course_operations_url') then
  raise exception 'Configure the worker secret and endpoint first';
 end if;
 select jobid into existing from cron.job where jobname='course-operations-every-5m';
 if existing is not null then
  perform cron.alter_job(existing, schedule := '*/5 * * * *', active := true);
  return 'updated';
 end if;
 perform cron.schedule('course-operations-every-5m','*/5 * * * *',$job$
  select net.http_post(
   url := (select decrypted_secret from vault.decrypted_secrets where name='course_operations_url'),
   headers := jsonb_build_object('Content-Type','application/json','x-course-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='course_cron_secret')),
   body := '{}'::jsonb, timeout_milliseconds := 120000
  );
 $job$);
 return 'created';
end $$;
revoke all on function public.course_cron_install() from public, anon, authenticated;

-- Reversible: stops the schedule without deleting configuration. Service role only.
create or replace function public.course_cron_uninstall()
returns text language plpgsql security definer set search_path to 'public','pg_temp' as $$
declare existing bigint;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden'; end if;
 select jobid into existing from cron.job where jobname='course-operations-every-5m';
 if existing is null then return 'absent'; end if;
 perform cron.unschedule(existing);
 return 'removed';
end $$;
revoke all on function public.course_cron_uninstall() from public, anon, authenticated;

grant execute on function public.course_cron_sync(text,text), public.course_cron_install(), public.course_cron_uninstall() to service_role;
