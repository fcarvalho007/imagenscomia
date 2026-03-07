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
  send_email?: boolean;
  draft_only?: boolean;
  email_subject?: string;
  email_body?: string;
}

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

/** Fetch per-plan prices (with IVA) from webinar_settings */
async function fetchDBPrices(supabase: any): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("webinar_settings")
    .select("webinar, price_premium, price_masterclass, price_bundle");
  const prices: Record<string, number> = {};
  if (data) {
    for (const row of data) {
      if (row.webinar === "imagens") {
        prices["premium"] = Number(row.price_premium) || 0;
        prices["masterclass"] = Number(row.price_masterclass) || 0;
        prices["bundle"] = Number(row.price_bundle) || 0;
        prices["gravacao"] = Number(row.price_premium) || 0;
      } else if (row.webinar === "video") {
        prices["video-premium"] = Number(row.price_premium) || 0;
        prices["video-masterclass"] = Number(row.price_masterclass) || 0;
        prices["video-bundle"] = Number(row.price_bundle) || 0;
      }
    }
  }
  return prices;
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
    const { registration_id, send_email = true, draft_only = false, email_subject, email_body } = body;

    if (!registration_id) {
      return new Response(JSON.stringify({ error: "registration_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch DB prices
    const DB_PRICES = await fetchDBPrices(supabase);

    // ── Fetch registration ──
    const { data: reg } = await supabase
      .from("registrations")
      .select("id, email, name, first_name, last_name, plan_selected, paid_at, webinar, eupago_ref, paid_amount, group_payment_ref, invoice_document_id")
      .eq("id", registration_id)
      .maybeSingle();

    if (!reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Detect group ──
    let allMembers = [reg];
    let allMemberIds = [reg.id];
    let buyerReg = reg;
    let quantity = 1;
    let totalPaid = reg.paid_amount ? Number(reg.paid_amount) : 0;

    if (reg.group_payment_ref) {
      const { data: groupMembers } = await supabase
        .from("registrations")
        .select("id, email, name, first_name, last_name, plan_selected, paid_at, webinar, eupago_ref, paid_amount, group_payment_ref, invoice_document_id")
        .eq("group_payment_ref", reg.group_payment_ref);

      if (groupMembers && groupMembers.length > 1) {
        allMembers = groupMembers;
        allMemberIds = groupMembers.map((m: any) => m.id);
        quantity = groupMembers.length;
        totalPaid = groupMembers.reduce((sum: number, m: any) => sum + (m.paid_amount ? Number(m.paid_amount) : 0), 0);

        // Find buyer = member with invoice_details, or original reg
        const { data: allInvoiceDetails } = await supabase
          .from("invoice_details")
          .select("*")
          .in("registration_id", allMemberIds);

        if (allInvoiceDetails && allInvoiceDetails.length > 0) {
          const buyerDetail = allInvoiceDetails[0];
          const foundBuyer = groupMembers.find((m: any) => m.id === buyerDetail.registration_id);
          if (foundBuyer) buyerReg = foundBuyer;
        }

        console.log(`👥 Group detected: ${quantity} members, buyer=${buyerReg.email}, total=${totalPaid}€`);
      }
    }

    // ── Fetch invoice_details for buyer ──
    const { data: invoice } = await supabase
      .from("invoice_details")
      .select("*")
      .eq("registration_id", buyerReg.id)
      .maybeSingle();

    // ── Build client data ──
    const clientName = invoice?.invoice_name || buyerReg.name || "Consumidor Final";
    const clientEmail = invoice?.invoice_email || buyerReg.email;
    const clientVat = invoice?.invoice_vat || "999999990";
    const clientAddress = invoice?.invoice_address || "";
    const clientZip = invoice?.invoice_zip || "";
    const clientCity = invoice?.invoice_city || "";

    const planKey = buyerReg.plan_selected || "premium";
    const itemDescription = PLAN_LABELS[planKey] || planKey;
    const itemDetail = PLAN_DESCRIPTIONS[planKey] || itemDescription;

    const isPortuguese = clientVat === "999999990" || /^[1-9]\d{8}$/.test(clientVat);
    const taxName = isPortuguese ? "IVA23" : "IVA0";
    const taxExemption = isPortuguese ? undefined : "M01";

    let unitPrice: number;
    if (totalPaid > 0) {
      const perPerson = totalPaid / quantity;
      unitPrice = isPortuguese
        ? Math.round((perPerson / 1.23) * 100) / 100
        : perPerson;
      console.log(`💰 totalPaid=${totalPaid}€, qty=${quantity} → unitPrice=${unitPrice}€ (isPortuguese=${isPortuguese})`);
    } else {
      const dbPrice = DB_PRICES[planKey] || 0;
      if (dbPrice > 0) {
        unitPrice = isPortuguese
          ? Math.round((dbPrice / 1.23) * 100) / 100
          : dbPrice;
      } else {
        unitPrice = 15.0;
      }
      console.warn(`⚠️ No paid_amount — DB fallback: ${unitPrice}€ for plan "${planKey}"`);
    }

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    // ── Step 1: Create invoice-receipt ──
    const invoicePayload = {
      invoice: {
        date: dateStr,
        due_date: dateStr,
        reference: buyerReg.eupago_ref || buyerReg.id.slice(0, 12),
        observations: `Webinar: ${buyerReg.webinar === "video" ? "Vídeo com IA" : "Imagens com IA"}${quantity > 1 ? ` · Grupo de ${quantity} pessoas` : ""}`,
        ...(taxExemption ? { tax_exemption: taxExemption } : {}),
        client: {
          name: clientName,
          code: clientEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30),
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
            quantity: String(quantity),
            unit: "service",
            tax: { name: taxName },
          },
        ],
      },
    };

    console.log(`📄 Creating invoice-receipt for ${buyerReg.email} — plan: ${planKey}, price: ${unitPrice}€, qty: ${quantity}`);

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
      // ── Step 2: Finalize ──
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

      // ── Step 3: Send by email ──
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
                subject: (email_subject || `Fatura-Recibo — {{plano}}`).replace(/\{\{plano\}\}/g, itemDescription).replace(/\{\{nome\}\}/g, buyerReg.name || ""),
                body: (email_body || `Olá {{nome}},\n\nSegue em anexo a sua fatura-recibo referente ao serviço subscrito.\n\nMuito obrigado pela confiança! Este documento foi emitido pela Fomentar Sonhos, Lda. — a empresa por detrás das formações do Frederico Carvalho.\n\nSe tiver qualquer questão, não hesite em responder a este email.\n\nCom os melhores cumprimentos,\nFrederico Carvalho\nFomentar Sonhos`).replace(/\{\{plano\}\}/g, itemDescription).replace(/\{\{nome\}\}/g, buyerReg.name || ""),
                logo: "0",
              },
            }),
          }
        );

        emailSent = emailRes.ok;
        console.log(`📧 Invoice email ${emailSent ? "sent" : "FAILED"} to ${clientEmail}`);
      }

      // ── Step 4: Mark ALL members as invoice_sent ──
      for (const memberId of allMemberIds) {
        await supabase
          .from("registrations")
          .update({ invoice_sent: true, invoice_document_id: String(documentId) } as any)
          .eq("id", memberId);
      }
    } else {
      console.log(`📝 Draft mode — skipping finalize, email, and invoice_sent update`);
      // Save document_id on ALL members
      for (const memberId of allMemberIds) {
        await supabase
          .from("registrations")
          .update({ invoice_document_id: String(documentId) } as any)
          .eq("id", memberId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        document_id: documentId,
        draft_only,
        email_sent: emailSent,
        client_email: clientEmail,
        group_size: quantity,
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
