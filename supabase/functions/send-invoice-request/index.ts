import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get("x-cron-secret");
    const validCron = cronSecret && cronSecret === Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("authorization") || "";
    const hasAuth = authHeader.startsWith("Bearer ") && authHeader.length > 20;
    if (!validCron && !hasAuth) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Accept optional body params
    let bodyWebinar = "all";
    let registrationIds: string[] | null = null;
    try {
      const body = await req.json();
      if (body.webinar) bodyWebinar = body.webinar;
      if (body.registration_ids && Array.isArray(body.registration_ids)) {
        registrationIds = body.registration_ids;
      }
    } catch { /* no body is fine */ }

    const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://imagenscomia.lovable.app";

    // Build query for paid registrations with edit_token
    let query = supabase
      .from("registrations")
      .select("id, email, first_name, edit_token, webinar")
      .not("paid_at", "is", null)
      .not("edit_token", "is", null);

    if (registrationIds && registrationIds.length > 0) {
      // Specific IDs requested
      query = query.in("id", registrationIds);
    } else if (bodyWebinar !== "all") {
      query = query.eq("webinar", bodyWebinar);
    }

    const { data: paidRegs, error: qErr } = await query;
    if (qErr) throw qErr;
    if (!paidRegs || paidRegs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No paid registrations found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out those who already have invoice_details
    const regIds = paidRegs.map((r: any) => r.id);
    const { data: existingInvoices } = await supabase
      .from("invoice_details")
      .select("registration_id")
      .in("registration_id", regIds);

    const invoicedIds = new Set((existingInvoices || []).map((i: any) => i.registration_id));
    const missing = paidRegs.filter((r: any) => !invoicedIds.has(r.id));

    if (missing.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "All paid registrations have invoice details" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const reg of missing) {
      const fname = reg.first_name || "participante";
      const link = `${SITE_URL}/fatura?rid=${reg.id}&t=${reg.edit_token}`;

      const subject = `${fname}, precisamos dos teus dados de faturação`;
      const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f9fafb;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="background:#ffffff;border-radius:12px;padding:32px 28px;border:1px solid #e5e7eb;">
    <h1 style="font-size:20px;color:#111827;margin:0 0 12px;">Olá ${fname} 👋</h1>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 16px;">
      Obrigado pela tua participação na formação do Frederico Carvalho!
    </p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 16px;">
      Para podermos emitir a tua fatura, precisamos que preenchas os teus dados de faturação — <strong>demora menos de 1 minuto</strong>:
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${link}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
        Preencher dados de faturação →
      </a>
    </div>
    <p style="font-size:13px;color:#6b7280;line-height:1.5;margin:0 0 8px;">
      Dados necessários: Nome/Empresa, NIF, Morada, Código Postal, Localidade e Email de faturação.
    </p>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:16px 0 0;">
      Se tiveres dúvidas, responde directamente a este email.
    </p>
  </div>
</div>
</body></html>`;

      try {
        const { error: sendErr } = await supabase.functions.invoke("send-email", {
          body: {
            to: reg.email,
            subject,
            html,
            replyTo: "fredericodigital@gmail.com",
            group: "invoice-request",
          },
        });
        if (sendErr) throw sendErr;
        sent++;
      } catch (err: any) {
        errors.push(`${reg.email}: ${err.message || "unknown"}`);
      }
    }

    return new Response(
      JSON.stringify({ sent, total: missing.length, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
