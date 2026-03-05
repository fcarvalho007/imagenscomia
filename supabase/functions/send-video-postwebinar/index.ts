import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEMPLATE_KEY = "video_postwebinar";

async function getSubscriberHistory(email: string, sb: any) {
  try {
    const { data } = await sb
      .from("registrations")
      .select("plan_selected, paid_at")
      .eq("email", email.toLowerCase().trim())
      .eq("webinar", "imagens")
      .order("created_at", { ascending: false })
      .limit(1);
    return data?.[0] || null;
  } catch { return null; }
}

function determineVariant(history: any): string {
  if (!history) return "A";
  const plan = history.plan_selected;
  const paid = !!history.paid_at;
  if ((plan === "masterclass" || plan === "bundle") && paid) return "D";
  if (plan === "premium" && paid) return "C";
  return "B";
}

function buildHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">O webinar <strong>"Cria Vídeo Profissional com IA"</strong> já decorreu.</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">Em breve receberás um email com o workbook-resumo da sessão.</p>

  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 8px;">Queres acesso à gravação completa?</p>
    <p style="color:#d97706;font-size:15px;font-weight:700;margin:0 0 4px;">⏰ Só hoje: Premium Pass — €15+IVA</p>
    <p style="color:#555;font-size:14px;margin:0 0 12px;">Amanhã o preço sobe para €27+IVA.</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Gravação HD da sessão completa (70 min)</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Sessão Q&A em grupo</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">&nbsp;&nbsp;&nbsp;📅 Terça-feira, 10 de Março às 14h30</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">✓ Guia de prompts para vídeo (PDF)</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Obter acesso à gravação — €15+IVA (só hoje) →</a>
    </div>
  </div>

  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 8px;">Queres ir mais fundo?</p>
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 8px;">Masterclass Vídeo com IA — €97+IVA</p>
    <p style="color:#555;font-size:15px;margin:0 0 12px;">Sessão avançada ao vivo, 3 horas com demonstrações e casos reais.</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">📅 Quinta-feira, 12 de Março às 10h00</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Saber mais sobre a Masterclass →</a>
    </div>
  </div>

  <div style="border-top:1px solid #eee;padding-top:16px;margin-top:32px;">
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 4px;">Frederico Carvalho</p>
    <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
  </div>
</div>
</body></html>`;
}

function personaliseHtml(html: string, variant: string): string {
  let result = html;

  if (variant === "D") {
    const mcBlockRegex = /<div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">\s*<p[^>]*>Queres ir mais fundo\?<\/p>[\s\S]*?<\/div>\s*<\/div>/;
    result = result.replace(mcBlockRegex, `<div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0;">
      Já tens a Masterclass do nosso trabalho anterior — se quiseres explorar o tema Vídeo em profundidade, entra em contacto directamente: <a href="mailto:frederico@digitalfc.pt" style="color:#16a34a;font-weight:600;">frederico@digitalfc.pt</a>
    </p>
  </div>`);
  }

  if (variant === "C") {
    const premiumMarker = '<p style="color:#333;font-size:16px;font-weight:700;margin:0 0 8px;">Queres acesso à gravação completa?</p>';
    const extraLine = '<p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 12px;">Já conheces o valor do Premium Pass — este cobre o Q&amp;A e gravação específicos do tema Vídeo.</p>\n    ';
    result = result.replace(premiumMarker, extraLine + premiumMarker);
  }

  return result;
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("authorization") || "";
    const isCron = cronSecret === Deno.env.get("CRON_SECRET");
    const isServiceRole = authHeader.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "__none__");

    if (!isCron && !isServiceRole) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .eq("webinar", "video")
      .is("paid_at", null)
      .eq("do_not_contact", false);

    if (queryErr) throw queryErr;
    if (!registrants || registrants.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, errors: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const regIds = registrants.map((r) => r.id);
    const { data: alreadySent } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", TEMPLATE_KEY)
      .eq("status", "sent")
      .in("registration_id", regIds);

    const sentSet = new Set((alreadySent || []).map((m) => m.registration_id));
    const toSend = registrants.filter((r) => !sentSet.has(r.id));

    let sent = 0;
    let errors = 0;

    const { data: tpl } = await supabase
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", TEMPLATE_KEY)
      .maybeSingle();

    for (const reg of toSend) {
      await new Promise(r => setTimeout(r, 600));
      try {
        const history = await getSubscriberHistory(reg.email, supabase);
        const variant = determineVariant(history);

        const fallbackHtml = buildHtml(reg.first_name || "");
        const rawHtml = tpl?.html_body ?? fallbackHtml;
        let html = rawHtml.replace(/\{\{fname\}\}/g, reg.first_name || "");
        html = personaliseHtml(html, variant);

        const emailSubject = (tpl?.subject ?? "O webinar já decorreu — e o que vem a seguir").replace(/\{\{fname\}\}/g, reg.first_name || "");

        const result = await callSendEmail(supabaseUrl, serviceRoleKey, reg.email, emailSubject, html);
        const ok = result.success === true;

        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          template_key: TEMPLATE_KEY,
          provider: result.provider || "unknown",
          channel: "email",
          status: ok ? "sent" : "failed",
          provider_message_id: result.messageId || null,
          error: ok ? null : JSON.stringify(result.error || result),
        });

        await supabase.from("email_send_logs").insert({
          webinar: "video",
          email_key: "postwebinar",
          recipient_email: reg.email,
          fname: reg.first_name || "",
          status: ok ? "sent" : "failed",
          resend_id: result.messageId || null,
          error_message: ok ? null : JSON.stringify(result.error || result),
          metadata: JSON.stringify({
            variant,
            had_imagens_history: history !== null,
            imagens_plan: history?.plan_selected || null,
          }),
        });

        if (ok) sent++;
        else errors++;
      } catch (err) {
        console.error(`Failed for ${reg.email}:`, err);
        errors++;
      }
    }

    console.log(`video_postwebinar: sent=${sent}, errors=${errors}, skipped=${sentSet.size}`);
    return new Response(JSON.stringify({ success: true, sent, errors }), {
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
