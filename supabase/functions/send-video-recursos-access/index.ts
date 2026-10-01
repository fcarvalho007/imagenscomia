import { authorizedDelivery } from "../_shared/delivery-auth.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE = "https://imagenscomia.lovable.app";
const WHATSAPP = "https://wa.me/351915015508";
const CALENDAR_MASTERCLASS = "https://calendar.app.google/qX6CxAwxafWHNEaYA";
const ZOOM_LINK = "https://us02web.zoom.us/j/83247090160?jst=3";

/* ──────────────────────────── shared HTML helpers ──────────────────────────── */

const wrapper = (body: string) => `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif"><div style="max-width:600px;margin:0 auto;background:#ffffff">${body}</div></body></html>`;

const header = (title: string) => `
<div style="background:linear-gradient(135deg,#1e1b4b,#312e81,#4338ca);padding:40px 32px;text-align:center">
  <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:700">${title}</h1>
</div>`;

const cta = (href: string, label: string, bg = "#4338ca") => `
<p style="margin:28px 0;text-align:center">
  <a href="${href}" style="display:inline-block;padding:14px 32px;background:${bg};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">${label}</a>
</p>`;

const footer = `
<div style="padding:24px 32px;border-top:1px solid #e2e8f0">
  <p style="font-size:13px;color:#64748b;margin:0 0 8px">Alguma dúvida? Responde a este email ou envia mensagem:</p>
  <p style="margin:0"><a href="${WHATSAPP}" style="color:#2563eb;font-size:13px">WhatsApp +351 915 015 508</a></p>
  <p style="margin:20px 0 0;font-size:14px;color:#1e293b">Com os melhores cumprimentos,<br/><strong>Frederico Carvalho</strong></p>
</div>`;

const resourceItem = (emoji: string, title: string, desc: string) =>
  `<tr><td style="padding:6px 0;vertical-align:top;width:28px;font-size:16px">${emoji}</td><td style="padding:6px 0"><strong style="color:#1e293b;font-size:14px">${title}</strong><br/><span style="color:#64748b;font-size:13px">${desc}</span></td></tr>`;

/* ──────────────────────────── TEMPLATE: PREMIUM ──────────────────────────── */

function premiumHtml(fname: string): string {
  return wrapper(`
    ${header("Os teus recursos estão prontos 🎬")}
    <div style="padding:32px;color:#1e293b;line-height:1.7">
      <p style="font-size:15px">Olá <strong>${fname}</strong>,</p>
      <p style="font-size:15px">Obrigado por adquirires o <strong>Premium Pass</strong> do webinar <em>Cria Vídeo Profissional com IA</em>. Todos os teus recursos estão prontos para consulta.</p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin:24px 0">
        <p style="margin:0 0 12px;font-weight:700;font-size:15px;color:#1e3a8a">📦 O teu Premium Pass inclui:</p>
        <table style="width:100%;border-collapse:collapse">
          ${resourceItem("🎬", "Sessão prática completa", "70 minutos, sem cortes — revê ao teu ritmo")}
          ${resourceItem("📘", "Workbook PDF", "Estrutura da sessão, exercícios e checklist")}
          ${resourceItem("💎", "Guia de GEMs (Google Gemini)", "Passo-a-passo para criar os teus próprios GEMs de vídeo")}
          ${resourceItem("⚡", "Ficheiro GEM pronto a usar", "Importa directamente para o Gemini e começa já")}
          ${resourceItem("🎧", "Áudio da sessão", "Ouve em qualquer lugar — ideal para rever no carro ou a correr")}
        </table>
      </div>

      ${cta(`${SITE}/recursos-video`, "Aceder aos Recursos →")}
      <p style="font-size:13px;color:#64748b;text-align:center;margin:-16px 0 24px">Para aceder, insere o email com que te registaste.</p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px 24px;margin:32px 0">
        <p style="margin:0 0 4px;font-weight:700;font-size:15px;color:#0369a1">💬 Sessão Q&A ao vivo</p>
        <p style="margin:0 0 12px;font-size:14px;color:#0284c7">Esclarece todas as tuas dúvidas em directo</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1e293b">
          <tr><td style="padding:3px 0">📅 Terça-feira, 10 de Março de 2026</td></tr>
          <tr><td style="padding:3px 0">🕝 14h30 — 15h30</td></tr>
          <tr><td style="padding:3px 0">💻 Online, ao vivo (Zoom)</td></tr>
        </table>
        ${cta("https://us02web.zoom.us/j/88370994509?jst=3", "Entrar na Sessão Q&A (Zoom) →", "#0284c7")}
        <p style="font-size:13px;color:#64748b;text-align:center;margin:4px 0 12px">Para entrar, usa o email com que te registaste.</p>
        ${cta("https://calendar.app.google/mmuW5XuzRzRLm2qVA", "Guardar Q&A no Calendário →", "#0369a1")}
      </div>

      <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px 24px;margin:32px 0">
        <p style="margin:0 0 4px;font-weight:700;font-size:15px;color:#6b21a8">🎓 Queres ir mais longe?</p>
        <p style="margin:0 0 12px;font-size:14px;color:#7c3aed">Masterclass — Produção de Vídeo com IA</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1e293b">
          <tr><td style="padding:3px 0">📅 Quinta-feira, 12 de Março de 2026</td></tr>
          <tr><td style="padding:3px 0">🕙 10h00 — 13h00 (3 horas)</td></tr>
          <tr><td style="padding:3px 0">💻 Online, ao vivo (link na véspera)</td></tr>
          <tr><td style="padding:3px 0">🎥 Gravação incluída</td></tr>
        </table>
        <p style="font-size:13px;color:#64748b;margin:12px 0 0">De briefing a clip publicável — workflow completo, ferramentas avançadas, casos práticos e Q&A ao vivo.</p>
        ${cta(`${SITE}/upgrade-video`, "Reservar lugar na Masterclass →", "#16a34a")}
        <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0">€47 + IVA · Grupo limitado · Vagas a esgotar</p>
      </div>
    </div>
    ${footer}
  `);
}

/* ──────────────────────────── TEMPLATE: MASTERCLASS ──────────────────────── */

function masterclassHtml(fname: string): string {
  return wrapper(`
    ${header("O teu lugar está confirmado 🎓")}
    <div style="padding:32px;color:#1e293b;line-height:1.7">
      <p style="font-size:15px">Olá <strong>${fname}</strong>,</p>
      <p style="font-size:15px">O teu lugar na <strong>Masterclass — Produção de Vídeo com IA</strong> está confirmado. Aqui ficam os detalhes e próximos passos.</p>

      <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px 24px;margin:24px 0">
        <p style="margin:0 0 12px;font-weight:700;font-size:15px;color:#6b21a8">📋 Detalhes da sessão</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1e293b">
          <tr><td style="padding:4px 0">📅 <strong>Quinta-feira, 12 de Março de 2026</strong></td></tr>
          <tr><td style="padding:4px 0">🕙 <strong>10h00 — 13h00</strong> (3 horas)</td></tr>
          <tr><td style="padding:4px 0">💻 Online, ao vivo</td></tr>
          <tr><td style="padding:4px 0">🎥 Gravação incluída — acesso após a sessão</td></tr>
        </table>
        ${cta(ZOOM_LINK, "Entrar na Sessão (Zoom) →", "#7c3aed")}
        <p style="font-size:13px;color:#64748b;text-align:center;margin:0">Para entrar, usa o email com que te registaste.</p>
      </div>

      <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:24px 0">
        <p style="margin:0 0 12px;font-weight:700;font-size:14px;color:#334155">O que vamos abordar:</p>
        <table style="width:100%;border-collapse:collapse">
          ${resourceItem("🎯", "Workflow completo", "Do briefing ao clip publicável — método passo-a-passo")}
          ${resourceItem("🛠️", "Ferramentas e técnicas avançadas", "As mesmas que uso em projectos reais de produção")}
          ${resourceItem("📂", "Casos práticos ao vivo", "Exemplos reais com feedback imediato")}
          ${resourceItem("💬", "Q&A dedicado", "Esclarece todas as tuas dúvidas em directo")}
        </table>
      </div>

      ${cta(CALENDAR_MASTERCLASS, "Guardar no Calendário →", "#7c3aed")}

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin:32px 0">
        <p style="margin:0 0 4px;font-weight:700;font-size:15px;color:#166534">🎬 Complementa com o Premium Pass</p>
        <p style="margin:0 0 12px;font-size:14px;color:#15803d">Acesso à gravação completa do webinar + materiais de apoio</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1e293b">
          ${resourceItem("🎬", "Sessão prática completa", "70 min, sem cortes")}
          ${resourceItem("📘", "Workbook PDF + Guia GEMs", "Exercícios, checklist e tutoriais")}
          ${resourceItem("⚡", "Ficheiro GEM pronto a usar", "Importa para o Gemini")}
          ${resourceItem("🎧", "Áudio da sessão", "Revê em qualquer lugar")}
        </table>
        ${cta(`${SITE}/upgrade-video`, "Obter o Premium Pass →", "#16a34a")}
        <p style="font-size:12px;color:#94a3b8;text-align:center;margin:0">€27 + IVA</p>
      </div>
    </div>
    ${footer}
  `);
}

/* ──────────────────────────── TEMPLATE: BUNDLE ──────────────────────────── */

function bundleHtml(fname: string): string {
  return wrapper(`
    ${header("Está tudo pronto ✅")}
    <div style="padding:32px;color:#1e293b;line-height:1.7">
      <p style="font-size:15px">Olá <strong>${fname}</strong>,</p>
      <p style="font-size:15px">Obrigado pelo teu <strong>acesso completo</strong> ao webinar <em>Cria Vídeo Profissional com IA</em>. Tens tudo incluído — recursos e Masterclass.</p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin:24px 0">
        <p style="margin:0 0 12px;font-weight:700;font-size:15px;color:#1e3a8a">📦 O teu acesso completo inclui:</p>
        <table style="width:100%;border-collapse:collapse">
          ${resourceItem("🎬", "Sessão prática completa", "70 min, sem cortes")}
          ${resourceItem("📘", "Workbook PDF", "Estrutura, exercícios e checklist")}
          ${resourceItem("💎", "Guia de GEMs (Google Gemini)", "Cria os teus próprios GEMs de vídeo")}
          ${resourceItem("⚡", "Ficheiro GEM pronto a usar", "Importa directamente para o Gemini")}
          ${resourceItem("🎧", "Áudio da sessão", "Ouve em qualquer lugar")}
          ${resourceItem("🎓", "Masterclass — 12 de Março", "3 horas ao vivo + gravação incluída")}
        </table>
      </div>

      ${cta(`${SITE}/recursos-video`, "Aceder aos Recursos →")}
      <p style="font-size:13px;color:#64748b;text-align:center;margin:-16px 0 24px">Para aceder, insere o email com que te registaste.</p>

      <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px 24px;margin:24px 0">
        <p style="margin:0 0 12px;font-weight:700;font-size:15px;color:#6b21a8">🎓 Masterclass — Produção de Vídeo com IA</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1e293b">
          <tr><td style="padding:4px 0">📅 <strong>Quinta-feira, 12 de Março de 2026</strong></td></tr>
          <tr><td style="padding:4px 0">🕙 <strong>10h00 — 13h00</strong> (3 horas)</td></tr>
          <tr><td style="padding:4px 0">💻 Online, ao vivo</td></tr>
          <tr><td style="padding:4px 0">🎥 Gravação incluída — acesso após a sessão</td></tr>
        </table>
        ${cta(ZOOM_LINK, "Entrar na Sessão (Zoom) →", "#7c3aed")}
        <p style="font-size:13px;color:#64748b;text-align:center;margin:4px 0 12px">Para entrar, usa o email com que te registaste.</p>
        <p style="font-size:13px;color:#64748b;margin:0">Workflow completo, ferramentas avançadas, casos práticos e Q&A ao vivo.</p>
        ${cta(CALENDAR_MASTERCLASS, "Guardar no Calendário →", "#6b21a8")}
      </div>
    </div>
    ${footer}
  `);
}

/* ──────────────────────────── TEMPLATE DEFINITIONS ──────────────────────── */

interface TemplateDef {
  key: string;
  name: string;
  subject: string;
  plans: string[];
  buildHtml: (fname: string) => string;
}

const TEMPLATES: TemplateDef[] = [
  {
    key: "video_recursos_premium",
    name: "Recursos — Premium Pass",
    subject: "{{fname}}, os teus recursos do webinar Vídeo com IA estão prontos 🎬",
    plans: ["video-premium", "premium", "gravacao"],
    buildHtml: premiumHtml,
  },
  {
    key: "video_recursos_masterclass",
    name: "Recursos — Masterclass",
    subject: "{{fname}}, confirmação e próximos passos — Masterclass Vídeo com IA 🎓",
    plans: ["video-masterclass", "masterclass"],
    buildHtml: masterclassHtml,
  },
  {
    key: "video_recursos_bundle",
    name: "Recursos — Bundle",
    subject: "{{fname}}, está tudo pronto — acesso completo Vídeo com IA ✅",
    plans: ["video-bundle", "bundle"],
    buildHtml: bundleHtml,
  },
];

/* ──────────────────────────── SERVE ──────────────────────────── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    if (req.method !== "POST" || !(await authorizedDelivery(req, supabase, (key) => Deno.env.get(key)))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default true

    // ── 1. Upsert templates ──
    for (const tpl of TEMPLATES) {
      const sampleHtml = tpl.buildHtml("{{fname}}");
      const { error } = await supabase.from("email_templates").upsert(
        {
          template_key: tpl.key,
          name: tpl.name,
          subject: tpl.subject,
          html_body: sampleHtml,
          channel: "email",
          variables: ["fname"],
          is_active: true,
          updated_at: new Date().toISOString(),
          updated_by: "send-video-recursos-access",
        },
        { onConflict: "template_key" }
      );
      if (error) console.warn(`Upsert ${tpl.key}:`, error.message);
      else console.log(`✅ Template upserted: ${tpl.key}`);
    }

    if (dryRun) {
      return new Response(
        JSON.stringify({ success: true, message: "Templates upserted. dry_run=true — no emails sent.", templates: TEMPLATES.map((t) => t.key) }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Send emails per segment ──
    const results: { key: string; sent: number; skipped: number; failed: number; errors: string[] }[] = [];

    for (const tpl of TEMPLATES) {
      const stat = { key: tpl.key, sent: 0, skipped: 0, failed: 0, errors: [] as string[] };

      const { data: registrants, error: qErr } = await supabase
        .from("registrations")
        .select("id, email, first_name, name, plan_selected, paid_at, premium_granted_at")
        .eq("webinar", "video")
        .in("plan_selected", tpl.plans)
        .or("paid_at.not.is.null,premium_granted_at.not.is.null");

      if (qErr) {
        stat.errors.push(`Query error: ${qErr.message}`);
        results.push(stat);
        continue;
      }

      if (!registrants || registrants.length === 0) {
        results.push(stat);
        continue;
      }

      for (const reg of registrants) {
        // Idempotency check
        const { data: alreadySent } = await supabase
          .from("email_send_logs")
          .select("id")
          .eq("email_key", tpl.key)
          .eq("recipient_email", reg.email)
          .eq("status", "sent")
          .limit(1);

        if (alreadySent && alreadySent.length > 0) {
          stat.skipped++;
          console.log(`⏭️ ${tpl.key} already sent to ${reg.email}`);
          continue;
        }

        const fname = reg.first_name || (reg.name || "").split(" ")[0] || "";
        const personalSubject = tpl.subject.replace(/\{\{fname\}\}/g, fname);
        const personalHtml = tpl.buildHtml(fname);

        // Send via centralised send-email
        try {
          const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ to: reg.email, subject: personalSubject, html: personalHtml }),
          });
          const sendData = await sendRes.json();

          // Log in message_logs
          await supabase.from("message_logs").insert({
            registration_id: reg.id,
            channel: "email",
            provider: sendData.provider || "unknown",
            template_key: tpl.key,
            status: sendData.success ? "sent" : "failed",
            provider_message_id: sendData.messageId || null,
            error: sendData.success ? null : JSON.stringify(sendData.error || sendData),
          });

          // Log in email_send_logs
          await supabase.from("email_send_logs").insert({
            webinar: "video",
            email_key: tpl.key,
            recipient_email: reg.email,
            fname,
            status: sendData.success ? "sent" : "failed",
            resend_id: sendData.messageId || null,
            error_message: sendData.success ? null : JSON.stringify(sendData.error || sendData),
            metadata: { provider: sendData.provider, plan: reg.plan_selected },
          });

          if (sendData.success) {
            stat.sent++;
            console.log(`📧 ${tpl.key} → ${reg.email} via ${sendData.provider} ✅`);
          } else {
            stat.failed++;
            stat.errors.push(`${reg.email}: ${sendData.error}`);
            console.warn(`❌ ${tpl.key} → ${reg.email}: ${sendData.error}`);
          }
        } catch (err) {
          stat.failed++;
          const msg = err instanceof Error ? err.message : String(err);
          stat.errors.push(`${reg.email}: ${msg}`);
          console.error(`❌ ${tpl.key} → ${reg.email} exception:`, err);
        }

        // Throttle 600ms
        await new Promise((r) => setTimeout(r, 600));
      }

      results.push(stat);
    }

    return new Response(
      JSON.stringify({ success: true, dry_run: false, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("send-video-recursos-access error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
