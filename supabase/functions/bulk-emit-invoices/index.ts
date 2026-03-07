import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACCOUNT = "fomentarsonhos";
const BASE_URL = `https://${ACCOUNT}.app.invoicexpress.com`;

const PRICES: Record<string, number> = {
  premium: 15.0,
  masterclass: 47.0,
  bundle: 57.0,
  gravacao: 27.0,
  "video-premium": 27.0,
  "video-masterclass": 67.0,
  "video-bundle": 107.0,
};

const PLAN_LABELS: Record<string, string> = {
  premium: "Formação — Premium Pass · Imagens com IA",
  masterclass: "Formação — Masterclass · Imagens com IA",
  bundle: "Formação — Premium + Masterclass · Imagens com IA",
  gravacao: "Formação — Sessão HD + Pack Apoio · Imagens com IA",
  "video-premium": "Formação — Sessão HD + Pack Apoio · Vídeo com IA",
  "video-masterclass": "Formação — Masterclass · Vídeo com IA",
  "video-bundle": "Formação — Masterclass + Sessão · Vídeo com IA",
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  premium: "Acesso premium ao webinar Imagens com IA",
  masterclass: "Masterclass online de 3h · Imagens com IA",
  bundle: "Acesso premium + Masterclass · Imagens com IA",
  gravacao: "Sessão completa em HD + pack de apoio · Imagens com IA",
  "video-premium": "Sessão completa em HD + pack de apoio · Vídeo com IA",
  "video-masterclass": "Masterclass online de 3h · Vídeo com IA",
  "video-bundle": "Masterclass + sessão completa · Vídeo com IA",
};

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
    const webinarFilter: string = body.webinar || "video";

    // Fetch all paid registrations without invoice sent yet
    let query = supabase
      .from("registrations")
      .select("id, email, name, first_name, last_name, plan_selected, paid_at, webinar, eupago_ref, invoice_document_id, invoice_sent, paid_amount")
      .not("paid_at", "is", null)
      .eq("invoice_sent", false);

    if (webinarFilter !== "all") {
      query = query.eq("webinar", webinarFilter);
    }

    const { data: registrations, error: fetchErr } = await query;
    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);

    if (!registrations || registrations.length === 0) {
      return new Response(
        JSON.stringify({ emitted: 0, errors: [], total: 0, message: "No eligible registrations" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch invoice_details for all registrations
    const regIds = registrations.map((r) => r.id);
    const { data: allInvoiceDetails } = await supabase
      .from("invoice_details")
      .select("*")
      .in("registration_id", regIds);

    const invoiceMap = new Map((allInvoiceDetails || []).map((d) => [d.registration_id, d]));

    let emitted = 0;
    let draftsOnly = 0;
    const errors: { id: string; email: string; error: string }[] = [];

    console.log(`🚀 Bulk emit: ${registrations.length} eligible registrations (webinar=${webinarFilter})`);

    for (const reg of registrations) {
      try {
        const invoice = invoiceMap.get(reg.id);
        const clientName = invoice?.invoice_name || reg.name || "Consumidor Final";
        const clientEmail = invoice?.invoice_email || reg.email;
        const clientVat = invoice?.invoice_vat || "999999990";
        const clientAddress = invoice?.invoice_address || "";
        const clientZip = invoice?.invoice_zip || "";
        const clientCity = invoice?.invoice_city || "";

        const planKey = reg.plan_selected || "premium";
        const itemDescription = PLAN_LABELS[planKey] || planKey;
        const itemDetail = PLAN_DESCRIPTIONS[planKey] || itemDescription;

        const isPortuguese = clientVat === "999999990" || /^[1-9]\d{8}$/.test(clientVat);
        const taxName = isPortuguese ? "IVA23" : "IVA0";
        const taxExemption = isPortuguese ? undefined : "M01";

        // Use paid_amount as source of truth
        let unitPrice: number;
        if (reg.paid_amount && parseFloat(reg.paid_amount) > 0) {
          const paidAmount = parseFloat(reg.paid_amount);
          unitPrice = isPortuguese
            ? Math.round((paidAmount / 1.23) * 100) / 100
            : paidAmount;
        } else {
          unitPrice = PRICES[planKey] || 15.0;
          console.warn(`⚠️ ${reg.email}: no paid_amount — fallback: ${unitPrice}€`);
        }

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

        let documentId = reg.invoice_document_id;

        // Step 1: Create invoice-receipt if no draft exists
        if (!documentId) {
          const invoicePayload = {
            invoice: {
              date: dateStr,
              due_date: dateStr,
              reference: reg.eupago_ref || reg.id.slice(0, 12),
              observations: `Webinar: ${reg.webinar === "video" ? "Vídeo com IA" : "Imagens com IA"}`,
              ...(taxExemption ? { tax_exemption: taxExemption } : {}),
              client: {
                name: clientName,
                code: reg.email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30),
                email: clientEmail,
                fiscal_id: clientVat,
                address: clientAddress,
                postal_code: clientZip,
                city: clientCity,
                country: "Portugal",
              },
              items: [
                {
                  name: itemDescription,
                  description: itemDetail,
                  unit_price: unitPrice.toFixed(2),
                  quantity: "1",
                  unit: "service",
                  tax: { name: taxName },
                },
              ],
            },
          };

          const createRes = await fetch(`${BASE_URL}/invoice_receipts.json?api_key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(invoicePayload),
          });

          const createData = await createRes.json();

          if (!createRes.ok) {
            console.error(`❌ ${reg.email}: create error`, JSON.stringify(createData));
            errors.push({ id: reg.id, email: reg.email, error: `Create failed: ${JSON.stringify(createData)}` });
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          documentId = String(createData.invoice_receipt?.id || createData.id);
          console.log(`📄 ${reg.email}: created draft #${documentId}`);

          await supabase
            .from("registrations")
            .update({ invoice_document_id: documentId } as any)
            .eq("id", reg.id);

          await new Promise((r) => setTimeout(r, 1000));
        }

        // Step 2: Finalize
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

        console.log(`✅ ${reg.email}: finalized #${documentId}`);

        // Step 3: Send email via InvoiceExpress
        await new Promise((r) => setTimeout(r, 2000));

        const emailRes = await fetch(
          `${BASE_URL}/invoice_receipts/${documentId}/email-document.json?api_key=${API_KEY}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              message: {
                client: { email: clientEmail, save: "0" },
                subject: `Fatura-Recibo — ${itemDescription}`,
                body: `Segue em anexo a fatura-recibo referente à sua compra.\n\nObrigado pela confiança.\nFrederico Carvalho`,
                logo: "0",
              },
            }),
          }
        );

        const emailSent = emailRes.ok;
        console.log(`📧 ${reg.email}: email ${emailSent ? "sent" : "FAILED"}`);

        // Step 4: Update DB
        await supabase
          .from("registrations")
          .update({ invoice_sent: true, invoice_document_id: documentId } as any)
          .eq("id", reg.id);

        // Step 5: Log
        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          channel: "email",
          provider: "invoicexpress",
          template_key: "invoice_emitted",
          status: emailSent ? "sent" : "failed",
        });

        emitted++;
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: any) {
        console.error(`❌ ${reg.email}: ${err.message}`);
        errors.push({ id: reg.id, email: reg.email, error: err.message });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`📊 Done: ${emitted} emitted, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ emitted, errors, total: registrations.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("bulk-emit-invoices error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
