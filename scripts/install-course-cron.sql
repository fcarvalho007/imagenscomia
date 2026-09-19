-- Run only after the Edge Function is deployed and the dedicated secret is stored
-- in Vault as course_cron_secret; course_operations_url stores the full HTTPS endpoint.
-- Does not enable sales or delivery flags. Do not store secret plaintext in Git.
create extension if not exists pg_cron;
create extension if not exists pg_net;
do $$
begin
 if not exists(select 1 from vault.decrypted_secrets where name='course_cron_secret' and length(decrypted_secret)>=32)
 or not exists(select 1 from vault.decrypted_secrets where name='course_operations_url' and decrypted_secret ~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/course-operations$') then
  raise exception 'Configure the two dedicated Vault entries first';
 end if;
 -- Idempotent: re-running converges the schedule instead of creating a second job.
 if exists(select 1 from cron.job where jobname='course-operations-every-5m') then
  perform cron.alter_job((select jobid from cron.job where jobname='course-operations-every-5m'),schedule := '*/5 * * * *');
 else
  perform cron.schedule('course-operations-every-5m','*/5 * * * *',$job$
   select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='course_operations_url'),
    headers := jsonb_build_object('Content-Type','application/json','x-course-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='course_cron_secret')),
    body := '{}'::jsonb, timeout_milliseconds := 120000
   );
  $job$);
 end if;
end $$;
