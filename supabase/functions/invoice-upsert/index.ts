import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { registration_id, edit_token, payload } = await req.json();

    if (!registration_id || !edit_token || !payload) {
      return new Response(
        JSON.stringify({ error: "Missing registration_id, edit_token or payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate edit_token
    const { data: reg } = await supabase
      .from("registrations")
      .select("id, edit_token, edit_token_created_at, paid_at")
      .eq("id", registration_id)
      .eq("edit_token", edit_token)
      .maybeSingle();

    if (!reg) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: check 30-day expiry
    if (reg.edit_token_created_at) {
      const created = new Date(reg.edit_token_created_at).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - created > thirtyDays) {
        return new Response(
          JSON.stringify({ error: "Token expired" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate payload fields
    const { invoice_name, invoice_vat, invoice_address, invoice_zip, invoice_city, invoice_email } = payload;

    const errors: string[] = [];
    if (!invoice_name || invoice_name.trim().length < 2) errors.push("invoice_name");
    if (!invoice_vat || !/^\d{9}$/.test(invoice_vat)) errors.push("invoice_vat");
    if (!invoice_address || invoice_address.trim().length < 5) errors.push("invoice_address");
    if (!invoice_zip || !/^\d{4}-\d{3}$/.test(invoice_zip)) errors.push("invoice_zip");
    if (!invoice_city || invoice_city.trim().length < 2) errors.push("invoice_city");
    if (!invoice_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice_email)) errors.push("invoice_email");

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", fields: errors }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert invoice_details
    const { error: upsertError } = await supabase.from("invoice_details").upsert({
      registration_id,
      invoice_name: invoice_name.trim(),
      invoice_vat,
      invoice_address: invoice_address.trim(),
      invoice_zip,
      invoice_city: invoice_city.trim(),
      invoice_email: invoice_email.trim(),
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auto-emit invoice if the registration is paid
    let invoiceResult = null;
    if (reg.paid_at) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const res = await fetch(`${supabaseUrl}/functions/v1/create-invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            registration_id,
            draft_only: false,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          invoiceResult = { success: true, document_id: data.document_id };
          console.log(`Auto-emitted invoice for ${registration_id}: #${data.document_id}`);
        } else {
          invoiceResult = { success: false, error: data.error || "Unknown" };
          console.error(`Auto-emit failed for ${registration_id}:`, data.error);
        }
      } catch (err: any) {
        invoiceResult = { success: false, error: err.message };
        console.error(`Auto-emit exception for ${registration_id}:`, err.message);
      }
    }

    // Notify Frederico that billing data was filled
    try {
      const notifyHtml = `
<div style="font-family:Arial,sans-serif;padding:16px;">
  <h2 style="font-size:16px;color:#111;">📋 Dados de faturação preenchidos</h2>
  <table style="font-size:14px;color:#374151;border-collapse:collapse;">
    <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Nome/Empresa:</td><td>${payload.invoice_name}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;font-weight:600;">NIF:</td><td>${payload.invoice_vat}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Email fatura:</td><td>${payload.invoice_email}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Fatura auto-emitida:</td><td>${invoiceResult?.success ? "✅ Sim (#" + invoiceResult.document_id + ")" : reg.paid_at ? "❌ Falhou" : "⏳ Pagamento pendente"}</td></tr>
  </table>
</div>`;

      await supabase.functions.invoke("send-email", {
        body: {
          to: "fredericodigital@gmail.com",
          subject: `📋 NIF preenchido — ${payload.invoice_name}`,
          html: notifyHtml,
          group: "admin-notification",
        },
      });

      // Log notification in message_logs
      await supabase.from("message_logs").insert({
        registration_id,
        channel: "email",
        provider: "resend",
        template_key: "invoice_filled_notification",
        status: "sent",
      });
    } catch (notifyErr: any) {
      console.error("Admin notification failed:", notifyErr.message);
    }

    return new Response(
      JSON.stringify({ success: true, invoice: invoiceResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
