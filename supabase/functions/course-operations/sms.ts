import { mobilePhone, renderCourseSMS } from "../_shared/course/sms.ts";
import { smsBasicAuth } from "../_shared/course/sms-auth.ts";
// Reuse the existing SMSOnline provider. No fallback/retry after an ambiguous delivery.
export async function sendCourseSMS(db: any, ctx: any, env: (k: string) => string | undefined, send: typeof fetch = fetch) {
  const { job, registration: r } = ctx;
  const finish = async (outcome: string, reason?: string, external_id?: string) => {
    const { error } = await db.rpc("finish_course_job", { job_id: job.id, job_lease: job.lease, outcome, reason: reason || null, external_id: external_id || null });
    if (error) throw new Error("job_persist_failed");
  };
  const credentials = env("SMSONLINE_API_KEY"), from = env("COURSE_SMS_FROM");
  const basic = credentials ? smsBasicAuth(credentials) : null;
  if (!basic || !from || !/^[A-Za-z0-9]{1,11}$/.test(from)) return finish("blocked", "sms_configuration_missing");
  if (!r.sms_consent) return finish("blocked", "sms_consent_missing");
  if (job.attempts > 0) return finish("review", "sms_verify_provider_before_retry");
  let payload;
  try {
    let text;
    if(job.campaign_id) {
      const {data:campaign,error}=await db.from("course_campaigns").select("body,edition,channel").eq("id",job.campaign_id).single();
      if(error || !campaign || campaign.edition!==r.edition || campaign.channel!=="sms") throw new Error("campaign_missing");
      text=campaign.body;
    } else {
      const {data:template,error}=await db.from("course_sms_templates").select("body").eq("edition",r.edition).eq("template",job.template).maybeSingle();
      if(error)throw new Error("sms_template_unavailable");
      text = template?.body || renderCourseSMS(job.template, r.edition);
    }
    // ASCII only, maximum one segment. Never silently spend on concatenated SMS.
    if (text.length > 160 || /[^\x20-\x7e]|[\[\]{}^~|\\]/.test(text)) throw new Error("segment_limit");
    payload = { to: [mobilePhone(r.phone)], text, from, coding: "gsm-pt" };
  } catch { return finish("blocked", "sms_content_or_phone_invalid"); }
  const { data: ready, error } = await db.rpc("prepare_course_job", { job_id: job.id, job_lease: job.lease, frozen_payload: payload });
  if (error || !ready) throw new Error("job_not_prepared");
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await send("https://login.smsonline.pt/Api/rest/message", {
      method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Basic ${basic}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return await finish("review", `sms_http_${res.status}`);
    const data = await res.json();
    const id = data?.id || data?.messageId;
    if (!id || !["string", "number"].includes(typeof id)) return await finish("review", "sms_response_requires_verification");
    await finish("sent", undefined, String(id));
  } catch { await finish("review", "sms_delivery_uncertain"); }
  finally { clearTimeout(timer); }
}
