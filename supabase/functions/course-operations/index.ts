import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { sendCourseEmail } from "./email.ts";
import { issueCourseInvoice } from "./invoice.ts";
import { sendCourseSMS } from "./sms.ts";
const env = (k: string) => Deno.env.get(k);
serve(async (req) => {
  const reply = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  if (req.method !== "POST") return reply(405, { error: "POST required" });
  const secret = env("COURSE_CRON_SECRET");
  if (
    !secret ||
    secret.length < 32 ||
    req.headers.get("x-course-cron-secret") !== secret
  )
    return reply(401, { error: "Unauthorized" });
  const db = createClient(
    env("SUPABASE_URL")!,
    env("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const channels = [
    ...(env("COURSE_AUTOMATIONS_ENABLED") === "true" ? ["email"] : []),
    ...(env("COURSE_AUTOMATIONS_ENABLED") === "true" && env("COURSE_SMS_ENABLED") === "true" ? ["sms"] : []),
    ...(env("COURSE_INVOICING_ENABLED") === "true" ? ["invoice"] : []),
  ];
  if (!channels.length) {
    await db.from("course_worker_health").upsert({ worker: "course-operations", last_run_at: new Date().toISOString(), result: "paused" });
    return reply(200, { state: "paused", processed: 0 });
  }
  let processed = 0;
  try {
    for (const kind of channels) {
      for (let n = 0; n < (kind === "email" ? 3 : 1); n++) {
        const { data, error } = await db.rpc("claim_course_job", {
          job_kind: kind,
        });
        if (error) throw new Error("claim_failed");
        if (!data) break;
        if (kind === "email") await sendCourseEmail(db, data, env);
        else if (kind === "sms") await sendCourseSMS(db, data, env);
        else await issueCourseInvoice(db, data, env);
        processed++;
      }
    }
    const { error } = await db
      .from("course_worker_health")
      .upsert({
        worker: "course-operations",
        last_run_at: new Date().toISOString(),
        result: "ok",
      });
    if (error) throw new Error("health_failed");
    return reply(200, { processed });
  } catch {
    await db
      .from("course_worker_health")
      .upsert({
        worker: "course-operations",
        last_run_at: new Date().toISOString(),
        result: "error",
      });
    return reply(503, { error: "Worker requires attention", processed });
  }
});
