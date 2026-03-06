import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACCOUNT = "fomentarsonhos";
const BASE_URL = `https://${ACCOUNT}.app.invoicexpress.com`;

interface InvoiceRequest {
  registration_id: string;
  /** If true, also send the invoice by email via InvoiceExpress */
  send_email?: boolean;
  /** If true, create as draft only — do not finalize or send email */
  draft_only?: boolean;
}

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

    const body: InvoiceRequest = await req.json();
    const { registration_id, send_email = true, draft_only = false } = body;

    if (!registration_id) {
      return new Response(JSON.stringify({ error: "registration_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch registration + invoice_details ──
    const { data: reg } = await supabase
      .from("registrations")
      .select("email, name, first_name, last_name, plan_selected, paid_at, webinar, eupago_ref, paid_amount")
      .eq("id", registration_id)
      .maybeSingle();

    if (!reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invoice } = await supabase
      .from("invoice_details")
      .select("*")
      .eq("registration_id", registration_id)
      .maybeSingle();

    // ── Build client data ──
    const clientName = invoice?.invoice_name || reg.name || "Consumidor Final";
    const clientEmail = invoice?.invoice_email || reg.email;
    const clientVat = invoice?.invoice_vat || "999999990"; // consumidor final
    const clientAddress = invoice?.invoice_address || "";
    const clientZip = invoice?.invoice_zip || "";
    const clientCity = invoice?.invoice_city || "";

    // ── Price map ──
    const PRICES: Record<string, number> = {
      premium: 15.00,
      masterclass: 47.00,
      bundle: 57.00,
      gravacao: 27.00,
      "video-premium": 27.00,
      "video-masterclass": 67.00,
      "video-bundle": 107.00,
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

    const planKey = reg.plan_selected || "premium";
    const itemDescription = PLAN_LABELS[planKey] || planKey;
    const itemDetail = PLAN_DESCRIPTIONS[planKey] || itemDescription;

    // ── Determine tax ──
    // Portuguese NIF → 23% IVA, foreign → tax exempt
    const isPortuguese = clientVat === "999999990" || /^[1-9]\d{8}$/.test(clientVat);
    const taxName = isPortuguese ? "IVA23" : "IVA0";
    const taxExemption = isPortuguese ? undefined : "M01";

    // Source of truth: paid_amount from EuPago webhook (includes IVA)
    // For Portuguese NIF → divide by 1.23 to get base price
    // For foreign (tax exempt) → paid_amount IS the base price
    let unitPrice: number;
    if (reg.paid_amount && parseFloat(reg.paid_amount) > 0) {
      const paidAmount = parseFloat(reg.paid_amount);
      unitPrice = isPortuguese 
        ? Math.round((paidAmount / 1.23) * 100) / 100
        : paidAmount;
      console.log(`💰 Using paid_amount=${paidAmount}€ → unitPrice=${unitPrice}€ (isPortuguese=${isPortuguese})`);
    } else {
      unitPrice = PRICES[planKey] || 15.00;
      console.warn(`⚠️ No paid_amount for ${reg.email} — using PRICES fallback: ${unitPrice}€ for plan "${planKey}"`);
    }

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    // ── Step 1: Create invoice-receipt (simplified invoice) ──
    const invoicePayload = {
      invoice: {
        date: dateStr,
        due_date: dateStr,
        reference: reg.eupago_ref || registration_id.slice(0, 12),
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
            tax: {
              name: taxName,
            },
          },
        ],
      },
    };

    console.log(`📄 Creating invoice-receipt for ${reg.email} — plan: ${planKey}, price: ${unitPrice}€`);

    const createRes = await fetch(`${BASE_URL}/invoice_receipts.json?api_key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(invoicePayload),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      console.error("InvoiceExpress create error:", JSON.stringify(createData));
      return new Response(JSON.stringify({ error: "InvoiceExpress create failed", details: createData }), {
        status: createRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const documentId = createData.invoice_receipt?.id || createData.id;
    console.log(`✅ Invoice-receipt created: ID=${documentId}`);

    let emailSent = false;

    if (!draft_only) {
      // ── Step 2: Finalize the invoice-receipt ──
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
        console.error("InvoiceExpress finalize error:", stateData);
        return new Response(JSON.stringify({ error: "InvoiceExpress finalize failed", document_id: documentId, details: stateData }), {
          status: stateRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`✅ Invoice-receipt ${documentId} finalized`);

      // ── Step 3: Send by email (optional) ──
      if (send_email && clientEmail) {
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

        emailSent = emailRes.ok;
        console.log(`📧 Invoice email ${emailSent ? "sent" : "FAILED"} to ${clientEmail}`);
      }

      // ── Step 4: Mark invoice_sent in registrations ──
      await supabase
        .from("registrations")
        .update({ invoice_sent: true })
        .eq("id", registration_id);
    } else {
      console.log(`📝 Draft mode — skipping finalize, email, and invoice_sent update`);
      // Save document_id on registration for tracking
      await supabase
        .from("registrations")
        .update({ invoice_document_id: String(documentId) })
        .eq("id", registration_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        document_id: documentId,
        draft_only,
        email_sent: emailSent,
        client_email: clientEmail,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("create-invoice error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
