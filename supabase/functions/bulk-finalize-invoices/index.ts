import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACCOUNT = "fomentarsonhos";
const BASE_URL = `https://${ACCOUNT}.app.invoicexpress.com`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("INVOICEEXPRESS_API_KEY");
    if (!API_KEY) throw new Error("INVOICEEXPRESS_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const registrationIds: string[] = body.registration_ids || [];
    const customEmailSubject: string | undefined = body.email_subject;
    const customEmailBody: string | undefined = body.email_body;

    if (registrationIds.length === 0) {
      return new Response(
        JSON.stringify({ finalized: 0, errors: [], message: "No registration_ids provided" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch registrations with draft invoices
    const { data: registrations, error: fetchErr } = await supabase
      .from("registrations")
      .select("id, email, name, plan_selected, invoice_document_id, invoice_sent, webinar")
      .in("id", registrationIds);

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);

    let finalized = 0;
    const errors: { id: string; email: string; error: string }[] = [];

    for (const reg of registrations || []) {
      try {
        // Skip if already sent
        if (reg.invoice_sent) {
          console.log(`⏭️ ${reg.email}: already sent, skipping`);
          continue;
        }

        const documentId = reg.invoice_document_id;

        // If no draft exists, create one first
        if (!documentId) {
          console.log(`⏭️ ${reg.email}: no draft, skipping (use bulk-create-invoices first)`);
          errors.push({ id: reg.id, email: reg.email, error: "No draft invoice found. Create drafts first." });
          continue;
        }

        // Step 1: Finalize the invoice-receipt
        const stateRes = await fetch(
          `${BASE_URL}/invoice_receipts/${documentId}/change-state.json?api_key=${API_KEY}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ invoice: { state: "finalized" } }),
          }
        );

        if (!stateRes.ok) {
          const stateData = await stateRes.text();
          console.error(`❌ ${reg.email}: finalize error`, stateData);
          errors.push({ id: reg.id, email: reg.email, error: `Finalize failed: ${stateData}` });
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        console.log(`✅ ${reg.email}: invoice #${documentId} finalized`);

        // Step 2: Send by email
        await new Promise((r) => setTimeout(r, 2000));

        const PLAN_LABELS: Record<string, string> = {
          premium: "Formação — Premium Pass",
          masterclass: "Formação — Masterclass",
          bundle: "Formação — Premium + Masterclass",
          gravacao: "Formação — Sessão HD + Pack Apoio",
          "video-premium": "Formação — Sessão HD + Pack Apoio · Vídeo com IA",
          "video-masterclass": "Formação — Masterclass · Vídeo com IA",
          "video-bundle": "Formação — Masterclass + Sessão · Vídeo com IA",
        };

        const planKey = reg.plan_selected || "premium";
        const itemDescription = PLAN_LABELS[planKey] || planKey;

        const emailRes = await fetch(
          `${BASE_URL}/invoice_receipts/${documentId}/email-document.json?api_key=${API_KEY}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              message: {
                client: { email: reg.email, save: "0" },
                subject: (customEmailSubject || `Fatura-Recibo — {{plano}}`).replace("{{plano}}", itemDescription),
                body: customEmailBody || `Segue em anexo a fatura-recibo referente à sua compra.\n\nObrigado pela confiança.\nFrederico Carvalho`,
                logo: "0",
              },
            }),
          }
        );

        const emailSent = emailRes.ok;
        console.log(`📧 ${reg.email}: email ${emailSent ? "sent" : "FAILED"}`);

        // Step 3: Update registration
        await supabase
          .from("registrations")
          .update({ invoice_sent: true })
          .eq("id", reg.id);

        // Step 4: Log in message_logs
        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          channel: "email",
          provider: "invoicexpress",
          template_key: "invoice_finalized",
          status: emailSent ? "sent" : "failed",
        });

        finalized++;

        // Rate limit
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: any) {
        console.error(`❌ ${reg.email}: ${err.message}`);
        errors.push({ id: reg.id, email: reg.email, error: err.message });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`📊 Bulk finalize done: ${finalized} finalized, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ finalized, errors, total: registrations?.length || 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("bulk-finalize-invoices error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
