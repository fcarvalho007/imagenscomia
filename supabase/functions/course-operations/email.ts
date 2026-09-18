import { renderCourseEmail, safeLink } from "../_shared/course/emails.ts";
export type DB = any;
export async function sendCourseEmail(
  db: DB,
  ctx: any,
  env: (k: string) => string | undefined,
  send: typeof fetch = fetch,
) {
  const { job, registration: r, edition: e } = ctx;
  const finish = async (outcome: string, reason?: string, id?: string) => {
    const { error } = await db.rpc("finish_course_job", {
      job_id: job.id,
      job_lease: job.lease,
      outcome,
      reason: reason || null,
      external_id: id || null,
    });
    if (error) throw new Error("job_persist_failed");
  };
  const key = env("RESEND_API_KEY"),
    from = env("COURSE_EMAIL_FROM"),
    reply = env("COURSE_EMAIL_REPLY_TO");
  if (!key || !from || !reply) {
    await finish("blocked", "email_configuration_missing");
    return;
  }
  if (
    job.first_attempt_at &&
    Date.now() - Date.parse(job.first_attempt_at) > 23 * 3600000
  ) {
    await finish("review", "idempotency_window_elapsed");
    return;
  }
  let payload = job.payload;
  try {
    if (!payload) {
      const portal = new URL(safeLink(env("COURSE_PUBLIC_URL")));
      portal.hash = `fcia-billing=${r.request_id}`;
      const operations = { ...e.operations };
      if (job.template === "resources" && !operations.resources_url) {
        const { data: materials, error: materialsError } = await db
          .from("course_resources")
          .select("kind")
          .eq("edition", r.edition)
          .eq("enabled", true)
          .lte("available_at", new Date().toISOString());
        if (
          materialsError ||
          !materials?.length ||
          (r.edition === "online-2026" &&
            !materials.some((x: any) => x.kind === "recording")) ||
          !r.resource_token
        )
          throw new Error("resources_not_ready");
        const resources = new URL(
          "/curso-ia/recursos",
          safeLink(env("COURSE_APP_URL") || "https://imagenscomia.com"),
        );
        resources.hash = r.resource_token;
        operations.resources_url = resources.href;
        if (r.edition === "online-2026")
          operations.recordings_url = resources.href;
      }
      const mail = renderCourseEmail(job.template, {
        ...operations,
        name: r.name,
        edition: r.edition,
        label: e.label,
        portal_url: portal.href,
      });
      payload = { from, reply_to: reply, to: [r.email], ...mail };
    }
  } catch {
    await finish("blocked", "edition_content_missing");
    return;
  }
  const { data: ready, error } = await db.rpc("prepare_course_job", {
    job_id: job.id,
    job_lease: job.lease,
    frozen_payload: payload,
  });
  if (error || !ready) throw new Error("job_not_prepared");
  // Frozen body + same key on all retries. Never fall back to a second provider after ambiguity.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `course/${job.id}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      await finish(
        res.status === 429 || res.status >= 500 ? "queued" : "review",
        `resend_${res.status}`,
      );
      return;
    }
    const body = await res.json();
    if (typeof body.id !== "string") {
      await finish("review", "resend_missing_id");
      return;
    }
    await finish("sent", undefined, body.id);
  } catch {
    await finish("queued", "resend_uncertain_retry_same_key");
  } finally {
    clearTimeout(timer);
  }
}
