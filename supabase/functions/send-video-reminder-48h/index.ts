import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_FROM = "Frederico Carvalho <frederico.carvalho@digitalfc.pt>";
const VIDEO_WEBINAR_DATE = new Date("2026-03-05T10:00:00Z");
const TEMPLATE_KEY = "video_reminder_48h";

function buildHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">O webinar é já na próxima quinta-feira às 10h00.</p>

  <div style="border-top:1px solid #eee;border-bottom:1px solid #eee;padding:20px 0;margin:0 0 24px;">
    <p style="color:#333;font-size:18px;font-weight:700;margin:0 0 4px;">Vídeo com IA para marketing</p>
    <p style="color:#555;font-size:15px;margin:0 0 12px;">Sistema simples de delegação, sem caos.</p>
    <p style="color:#333;font-size:15px;margin:0;">📅 Quinta-feira, 5 de Março · 10h00 Portugal</p>
  </div>

  <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 12px;">O que vais aprender em 45–60 minutos:</p>
  <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 4px;">→ Como transformar um briefing em vídeo curto publicável</p>
  <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 4px;">→ Onde a IA poupa tempo e onde o controlo humano é obrigatório</p>
  <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 24px;">→ Um mini-sistema de delegação: briefing + checklist + critérios de qualidade</p>

  <div style="text-align:center;margin:0 0 24px;">
    <a href="https://imagenscomia.com/live-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Guardar link de acesso →</a>
  </div>

  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 8px;">Ainda não tens o Premium Pass?</p>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 12px;">Tens até à hora do webinar para garantir o preço early bird:</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Gravação HD da sessão completa</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Sessão Q&A em grupo — 10 de Março às 14h30</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">✓ Guia de prompts para vídeo (PDF)</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Garantir Premium Pass por €15+IVA</a>
    </div>
  </div>

  <div style="border-top:1px solid #eee;padding-top:16px;margin-top:32px;">
    <p style="color:#333;font-size:16px;margin:0 0 4px;">Até quinta,</p>
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 4px;">Frederico Carvalho</p>
    <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
  </div>
</div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: validate cron secret
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== Deno.env.get("CRON_SECRET")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Time window check: 47h-49h before webinar
    const now = Date.now();
    const targetStart = VIDEO_WEBINAR_DATE.getTime() - 49 * 60 * 60 * 1000;
    const targetEnd = VIDEO_WEBINAR_DATE.getTime() - 47 * 60 * 60 * 1000;
    if (now < targetStart || now > targetEnd) {
      return new Response(JSON.stringify({ skipped: true, reason: "Outside 48h window" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    // Get video registrants who haven't paid and are contactable
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

    // Check which ones already received this email (idempotency)
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

    for (const reg of toSend) {
      try {
        const html = buildHtml(reg.first_name || "");
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [reg.email],
            subject: "Faltam 2 dias — o teu lugar está reservado 🎬",
            html,
          }),
        });
        const resendData = await resendRes.json();

        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          template_key: TEMPLATE_KEY,
          provider: "resend",
          channel: "email",
          status: resendRes.ok ? "sent" : "failed",
          provider_message_id: resendData.id || null,
          error: resendRes.ok ? null : JSON.stringify(resendData),
        });

        if (resendRes.ok) sent++;
        else errors++;
      } catch (err) {
        console.error(`Failed for ${reg.email}:`, err);
        errors++;
      }
    }

    console.log(`video_reminder_48h: sent=${sent}, errors=${errors}, skipped=${sentSet.size}`);
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
