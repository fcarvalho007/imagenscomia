import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Prices include 23% VAT — single price tier (post-5 March 2026)
const PRICES: Record<string, { value: number; baseLabel: string }> = {
  premium:     { value: 33.21,  baseLabel: "€27 + IVA" },
  masterclass: { value: 82.41,  baseLabel: "€67 + IVA" },
  bundle:      { value: 131.61, baseLabel: "€107 + IVA" },
  "video-premium":     { value: 33.21,  baseLabel: "€27 + IVA" },
  "video-masterclass": { value: 82.41,  baseLabel: "€67 + IVA" },
  "video-bundle":      { value: 131.61, baseLabel: "€107 + IVA" },
};

const PLAN_LABELS: Record<string, string> = {
  premium: "Premium Pass",
  masterclass: "Masterclass IA Imagem para Vídeo",
  bundle: "Bundle Premium + Masterclass",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate CRM secret
  const CRM_ADMIN_SECRET = Deno.env.get("CRM_ADMIN_SECRET");
  const incomingSecret = req.headers.get("x-crm-secret");
  if (!CRM_ADMIN_SECRET || incomingSecret !== CRM_ADMIN_SECRET) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!EUPAGO_API_KEY) throw new Error("EUPAGO_API_KEY not configured");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const { registrationId, plan, priceVariant } = await req.json();
    if (!registrationId || !plan) {
      return new Response(
        JSON.stringify({ error: "registrationId e plan são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const priceInfo = PRICES[plan];
    if (!priceInfo) {
      return new Response(
        JSON.stringify({ error: `Plano inválido: ${plan}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch registration
    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .select("id, email, name, first_name, order_id")
      .eq("id", registrationId)
      .single();

    if (regErr || !reg) {
      return new Response(
        JSON.stringify({ error: "Inscrição não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Guard-rail: already paid
    if (reg.paid_at) {
      return new Response(
        JSON.stringify({ status: "already_paid", message: "Este inscrito já efectuou o pagamento." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const origin = Deno.env.get("PUBLIC_SITE_URL") || "https://imagenscomia.com";
    const firstName = reg.first_name || (reg.name || "").split(" ")[0] || "Olá";
    const orderId = reg.order_id || reg.id.replace(/-/g, "").slice(0, 12);
    const planLabel = PLAN_LABELS[plan] || plan;

    // Create EuPago pay-by-link
    const eupagoResponse = await fetch(
      "https://clientes.eupago.pt/api/v1.02/paybylink/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey ${EUPAGO_API_KEY}`,
        },
        body: JSON.stringify({
          payment: {
            amount: { value: priceInfo.value, currency: "EUR" },
            identifier: `ORD-${(reg.first_name || reg.name || "").replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 25)}-${plan === "masterclass" ? "MC" : plan === "bundle" ? "PK" : "SP"}`,
            successUrl: `${origin}/confirmacao?plan=${plan}&email=${encodeURIComponent(reg.email)}`,
            failUrl: `${origin}/?payment=failed`,
            backUrl: `${origin}/upgrade`,
            lang: "PT",
            methods: ["CC", "MBWAY", "MB"],
            callbackUrl: `${supabaseUrl}/functions/v1/eupago-webhook`,
          },
          customer: { notify: false, email: reg.email },
        }),
      }
    );

    const eupagoData = await eupagoResponse.json();
    console.log("EuPago send-payment-link response:", JSON.stringify(eupagoData));

    if (!eupagoResponse.ok || eupagoData.transactionStatus !== "Success") {
      return new Response(
        JSON.stringify({ error: "Erro ao criar link de pagamento", details: eupagoData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawPaymentLink = eupagoData.url || eupagoData.redirectUrl || eupagoData.paymentLink || eupagoData.payment_url;
    const transactionID = eupagoData.transactionID || eupagoData.transaction_id || eupagoData.id;

    // Stable URL always exposed to the client (resolve-payment handles EuPago redirect internally)
    const paymentPageUrl = `${origin}/pagar?o=${orderId}`;

    // Persist to registrations — keep raw EuPago link for internal resolution by resolve-payment
    await supabase
      .from("registrations")
      .update({
        eupago_ref: transactionID,
        eupago_transaction_id: transactionID || null,
        last_payment_link: rawPaymentLink || null,
        payment_link_created_at: new Date().toISOString(),
        last_payment_link_sent_at: new Date().toISOString(),
        plan_selected: plan,
      })
      .eq("id", registrationId);

    // Log to message_logs — record the stable URL shown to the client
    await supabase.from("message_logs").insert({
      registration_id: registrationId,
      channel: "email",
      provider: "resend",
      template_key: "manual_payment_link_sent",
      status: "queued",
      payment_url: paymentPageUrl,
    });

    // Fetch the log id for updating status later
    const displayValue = priceInfo.value.toFixed(2).replace(".", ",");
    const basePrice = priceInfo.baseLabel;

    // Send email via Resend
    const emailHtml = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#0F172A;padding:32px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Imagens com IA</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">frederico.carvalho@digitalfc.pt</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;font-size:16px;color:#1e293b;">Olá ${firstName},</p>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
            Segue o teu link personalizado para concluíres a inscrição no <strong style="color:#1e293b;">${planLabel}</strong>.
          </p>
          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td align="center">
              <a href="${paymentPageUrl}" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;">
                 Concluir inscrição →
               </a>
            </td></tr>
          </table>
          <!-- Price box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Resumo</p>
              <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1e293b;">${planLabel}</p>
              <p style="margin:0;font-size:14px;color:#64748b;">${basePrice} · Total: ${displayValue}€</p>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Métodos de pagamento disponíveis: MB WAY · Multibanco · Cartão de crédito</p>
          <p style="margin:0;font-size:13px;color:#94a3b8;">Se tiveres alguma dúvida, responde a este email ou fala connosco pelo WhatsApp.</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">Frederico Carvalho · Imagens com IA</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>",
        to: [reg.email],
        subject: `O teu link de pagamento — ${planLabel}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();
    console.log("Resend response:", JSON.stringify(resendData));

    // Update message_log status
    const emailSent = resendRes.ok && resendData.id;
    await supabase
      .from("message_logs")
      .update({
        status: emailSent ? "sent" : "failed",
        provider_message_id: resendData.id || null,
        error: emailSent ? null : JSON.stringify(resendData),
      })
      .eq("registration_id", registrationId)
      .eq("template_key", "manual_payment_link_sent")
      .order("created_at", { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({
        paymentPageUrl,
        emailSent: !!emailSent,
        email: reg.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("send-payment-link error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
