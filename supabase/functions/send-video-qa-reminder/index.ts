import { authorizedDelivery } from "../_shared/delivery-auth.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-crm-admin-email, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EMAIL_TEMPLATE_KEY = "video_qa_reminder";
const SMS_TEMPLATE_KEY = "sms_reminder_qa_post";
const SMS_TEXT = "Lembrete: a sessao Q&A comeca as 14:30. Entra aqui: https://us02web.zoom.us/j/88370994509?jst=3 — Frederico";

function buildFallbackHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">A sessão Q&A começa hoje às <strong>14:30</strong> (hora de Portugal).</p>
  <div style="text-align:center;margin:0 0 24px;">
    <a href="https://us02web.zoom.us/j/88370994509?jst=3" style="display:inline-block;background:#1e40af;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Entrar na sessão Q&A →</a>
  </div>
  <p style="color:#555;font-size:14px;margin:0 0 24px;">Até já,<br><strong>Frederico Carvalho</strong></p>
</div>
</body></html>`;
}

async function callSendEmail(supabaseUrl: string, serviceRoleKey: string, to: string, subject: string, html: string) {
  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ to, subject, html }),
  });
  return await res.json();
}

async function callSendSms(supabaseUrl: string, serviceRoleKey: string, to: string, text: string, registrationId: string) {
  const res = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
      "x-crm-admin-email": ALLOWED_ADMIN,
    },
    body: JSON.stringify({ to, text, provider: "egoi", registrationId }),
  });
  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authDb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!await authorizedDelivery(req, authDb, key => Deno.env.get(key))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get paid registrants (premium + bundle only)
    const { data: allRegs, error: allErr } = await supabase
      .from("registrations")
      .select("id, email, first_name, whatsapp, paid_at, premium_granted_at, plan_selected")
      .eq("webinar", "video")
      .eq("do_not_contact", false)
      .in("plan_selected", ["video-premium", "premium", "video-bundle", "bundle"]);

    if (allErr) throw allErr;

    const eligible = (allRegs || []).filter(
      (r: any) => r.paid_at || r.premium_granted_at
    );

    if (eligible.length === 0) {
      return new Response(JSON.stringify({ success: true, emailsSent: 0, smsSent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check already sent emails
    const regIds = eligible.map((r: any) => r.id);
    const { data: alreadySentEmail } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", EMAIL_TEMPLATE_KEY)
      .eq("status", "sent")
      .in("registration_id", regIds);

    const emailSentSet = new Set((alreadySentEmail || []).map((m: any) => m.registration_id));

    // Check already sent SMS
    const { data: alreadySentSms } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", SMS_TEMPLATE_KEY)
      .eq("status", "sent")
      .in("registration_id", regIds);

    const smsSentSet = new Set((alreadySentSms || []).map((m: any) => m.registration_id));

    // Get email template
    const { data: tpl } = await supabase
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", EMAIL_TEMPLATE_KEY)
      .maybeSingle();

    let emailsSent = 0;
    let emailErrors = 0;
    let smsSent = 0;
    let smsErrors = 0;

    for (const reg of eligible) {
      // Send email if not already sent
      if (!emailSentSet.has(reg.id)) {
        await new Promise((r) => setTimeout(r, 600));
        try {
          const fallbackHtml = buildFallbackHtml(reg.first_name || "");
          const rawHtml = tpl?.html_body ?? fallbackHtml;
          const html = rawHtml
            .replace(/\{\{nome\}\}/g, reg.first_name || "")
            .replace(/\{\{fname\}\}/g, reg.first_name || "");
          const emailSubject = (tpl?.subject ?? "{{nome}}, a sessão Q&A começa às 14:30 — hoje!")
            .replace(/\{\{nome\}\}/g, reg.first_name || "")
            .replace(/\{\{fname\}\}/g, reg.first_name || "");

          const result = await callSendEmail(supabaseUrl, serviceRoleKey, reg.email, emailSubject, html);
          const ok = result.success === true;

          await supabase.from("message_logs").insert({
            registration_id: reg.id,
            template_key: EMAIL_TEMPLATE_KEY,
            provider: result.provider || "unknown",
            channel: "email",
            status: ok ? "sent" : "failed",
            provider_message_id: result.messageId || null,
            error: ok ? null : JSON.stringify(result.error || result),
          });

          await supabase.from("email_send_logs").insert({
            webinar: "video",
            email_key: "qa_reminder",
            recipient_email: reg.email,
            fname: reg.first_name || "",
            status: ok ? "sent" : "failed",
            resend_id: result.messageId || null,
            error_message: ok ? null : JSON.stringify(result.error || result),
          });

          if (ok) emailsSent++;
          else emailErrors++;
        } catch (err) {
          console.error(`Email failed for ${reg.email}:`, err);
          emailErrors++;
        }
      }

      // Send SMS if not already sent and has phone
      if (!smsSentSet.has(reg.id) && reg.whatsapp) {
        await new Promise((r) => setTimeout(r, 600));
        try {
          const smsResult = await callSendSms(supabaseUrl, serviceRoleKey, reg.whatsapp, SMS_TEXT, reg.id);
          const ok = smsResult.success === true;

          await supabase.from("message_logs").insert({
            registration_id: reg.id,
            template_key: SMS_TEMPLATE_KEY,
            provider: "egoi",
            channel: "sms",
            status: ok ? "sent" : "failed",
            provider_message_id: smsResult.messageId || null,
            error: ok ? null : JSON.stringify(smsResult.error || smsResult),
          });

          if (ok) smsSent++;
          else smsErrors++;
        } catch (err) {
          console.error(`SMS failed for ${reg.email}:`, err);
          smsErrors++;
        }
      }
    }

    console.log(`qa_reminder: emails=${emailsSent}/${emailErrors}, sms=${smsSent}/${smsErrors}, total=${eligible.length}`);

    return new Response(JSON.stringify({
      success: true,
      emailsSent,
      emailErrors,
      smsSent,
      smsErrors,
      totalEligible: eligible.length,
      emailSkipped: emailSentSet.size,
      smsSkipped: smsSentSet.size,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
