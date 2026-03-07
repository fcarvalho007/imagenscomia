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

interface Registration {
  id: string;
  email: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  plan_selected: string | null;
  paid_at: string | null;
  webinar: string;
  eupago_ref: string | null;
  invoice_document_id: string | null;
  invoice_sent: boolean;
  paid_amount: number | null;
  group_payment_ref: string | null;
}

interface InvoiceDetail {
  registration_id: string;
  invoice_name: string;
  invoice_email: string;
  invoice_vat: string;
  invoice_address: string;
  invoice_zip: string;
  invoice_city: string;
}

// ─── Helper: check InvoiceExpress document state ───
async function getIEDocumentState(API_KEY: string, documentId: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/invoice_receipts/${documentId}.json?api_key=${API_KEY}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn(`⚠️ GET doc #${documentId} failed: ${res.status} ${text}`);
      return null;
    }
    const data = await res.json();
    return data.invoice_receipt?.status || data.status || null;
  } catch (e: any) {
    console.warn(`⚠️ GET doc #${documentId} error: ${e.message}`);
    return null;
  }
}

// ─── Helper: recover document ID from message_logs ───
async function recoverDocumentId(supabase: any, memberIds: string[]): Promise<string | null> {
  // Check if any member already had an invoice emitted
  const { data: logs } = await supabase
    .from("message_logs")
    .select("registration_id")
    .eq("template_key", "invoice_emitted")
    .eq("provider", "invoicexpress")
    .in("registration_id", memberIds)
    .limit(1);

  if (!logs || logs.length === 0) return null;

  // Found a log — get the document_id from registrations (might have been on a different member)
  const { data: reg } = await supabase
    .from("registrations")
    .select("invoice_document_id")
    .eq("id", logs[0].registration_id)
    .single();

  if (reg?.invoice_document_id) return reg.invoice_document_id;

  // Also check other members that might still have the document_id
  const { data: regs } = await supabase
    .from("registrations")
    .select("invoice_document_id")
    .in("id", memberIds)
    .not("invoice_document_id", "is", null)
    .limit(1);

  return regs?.[0]?.invoice_document_id || null;
}

// ─── Helper: create, finalize & email one invoice-receipt ───
async function emitInvoice(opts: {
  API_KEY: string;
  supabase: any;
  buyerReg: Registration;
  invoiceDetail: InvoiceDetail | null;
  allMemberIds: string[];
  quantity: number;
  totalPaid: number;
  planKey: string;
  customEmailSubject?: string;
  customEmailBody?: string;
}): Promise<{ ok: boolean; error?: string; drafted?: boolean; skipped?: boolean }> {
  const {
    API_KEY, supabase, buyerReg, invoiceDetail, allMemberIds,
    quantity, totalPaid, planKey, customEmailSubject, customEmailBody,
  } = opts;

  const hasInvoiceDetails = !!invoiceDetail;
  const clientName = invoiceDetail?.invoice_name || buyerReg.name || "Consumidor Final";
  const clientEmail = invoiceDetail?.invoice_email || buyerReg.email;
  const clientVat = invoiceDetail?.invoice_vat || "999999990";
  const clientAddress = invoiceDetail?.invoice_address || "";
  const clientZip = invoiceDetail?.invoice_zip || "";
  const clientCity = invoiceDetail?.invoice_city || "";

  const itemDescription = PLAN_LABELS[planKey] || planKey;
  const itemDetail = PLAN_DESCRIPTIONS[planKey] || itemDescription;

  const isPortuguese = clientVat === "999999990" || /^[1-9]\d{8}$/.test(clientVat);
  const taxName = isPortuguese ? "IVA23" : "IVA0";
  const taxExemption = isPortuguese ? undefined : "M01";

  // Compute unit price from total paid
  let unitPrice: number;
  if (totalPaid > 0) {
    const perPerson = totalPaid / quantity;
    unitPrice = isPortuguese
      ? Math.round((perPerson / 1.23) * 100) / 100
      : perPerson;
  } else {
    unitPrice = PRICES[planKey] || 15.0;
    console.warn(`⚠️ ${buyerReg.email}: no paid_amount — fallback: ${unitPrice}€`);
  }

  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  let documentId = buyerReg.invoice_document_id;

  // Step 1: Create invoice-receipt if no draft exists
  if (!documentId) {
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

    const createRes = await fetch(`${BASE_URL}/invoice_receipts.json?api_key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(invoicePayload),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      console.error(`❌ ${buyerReg.email}: create error`, JSON.stringify(createData));
      return { ok: false, error: `Create failed: ${JSON.stringify(createData)}` };
    }

    documentId = String(createData.invoice_receipt?.id || createData.id);
    console.log(`📄 ${buyerReg.email}: created draft #${documentId} (qty=${quantity})`);

    // Save document ID on ALL members
    for (const memberId of allMemberIds) {
      await supabase
        .from("registrations")
        .update({ invoice_document_id: documentId } as any)
        .eq("id", memberId);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  // Draft-only mode: no invoice_details → skip finalize + email
  if (!hasInvoiceDetails) {
    console.log(`📋 ${buyerReg.email}: draft only (no invoice details) — #${documentId}`);
    return { ok: true, drafted: true };
  }

  // Step 2: Check document state in InvoiceExpress before finalizing
  const currentState = await getIEDocumentState(API_KEY, documentId!);
  console.log(`🔍 ${buyerReg.email}: doc #${documentId} state="${currentState}"`);

  if (currentState === "finalized" || currentState === "settled") {
    // Already finalized — just mark as sent in DB and skip
    console.log(`⏭️ ${buyerReg.email}: doc #${documentId} already ${currentState} — skipping, marking as sent`);
    for (const memberId of allMemberIds) {
      await supabase
        .from("registrations")
        .update({ invoice_sent: true, invoice_document_id: documentId } as any)
        .eq("id", memberId);
    }
    await supabase.from("message_logs").insert({
      registration_id: buyerReg.id,
      channel: "email",
      provider: "invoicexpress",
      template_key: "invoice_emitted",
      status: "skipped_already_finalized",
    });
    return { ok: true, skipped: true };
  }

  // Finalize the document
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
    console.error(`❌ ${buyerReg.email}: finalize error`, stateData);
    return { ok: false, error: `Finalize failed: ${stateData}` };
  }

  console.log(`✅ ${buyerReg.email}: finalized #${documentId}`);

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
          subject: (customEmailSubject || `Fatura-Recibo — {{plano}}`)
            .replace(/\{\{plano\}\}/g, itemDescription)
            .replace(/\{\{nome\}\}/g, buyerReg.name || ""),
          body: (customEmailBody || `Olá {{nome}},\n\nSegue em anexo a sua fatura-recibo referente ao serviço subscrito.\n\nMuito obrigado pela confiança! Este documento foi emitido pela Fomentar Sonhos, Lda. — a empresa por detrás das formações do Frederico Carvalho.\n\nSe tiver qualquer questão, não hesite em responder a este email.\n\nCom os melhores cumprimentos,\nFrederico Carvalho\nFomentar Sonhos`)
            .replace(/\{\{plano\}\}/g, itemDescription)
            .replace(/\{\{nome\}\}/g, buyerReg.name || ""),
          logo: "0",
        },
      }),
    }
  );

  const emailSent = emailRes.ok;
  console.log(`📧 ${buyerReg.email}: email ${emailSent ? "sent" : "FAILED"}`);

  // Step 4: Update ALL members as invoice_sent
  for (const memberId of allMemberIds) {
    await supabase
      .from("registrations")
      .update({ invoice_sent: true, invoice_document_id: documentId } as any)
      .eq("id", memberId);
  }

  // Step 5: Log
  await supabase.from("message_logs").insert({
    registration_id: buyerReg.id,
    channel: "email",
    provider: "invoicexpress",
    template_key: "invoice_emitted",
    status: emailSent ? "sent" : "failed",
  });

  return { ok: true };
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

    const body = await req.json().catch(() => ({}));
    const webinarFilter: string = body.webinar || "video";
    const customEmailSubject: string | undefined = body.email_subject;
    const customEmailBody: string | undefined = body.email_body;

    // Fetch all paid registrations without invoice sent yet
    let query = supabase
      .from("registrations")
      .select("id, email, name, first_name, last_name, plan_selected, paid_at, webinar, eupago_ref, invoice_document_id, invoice_sent, paid_amount, group_payment_ref")
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
    const regIds = registrations.map((r: any) => r.id);
    const { data: allInvoiceDetails } = await supabase
      .from("invoice_details")
      .select("*")
      .in("registration_id", regIds);

    const invoiceMap = new Map((allInvoiceDetails || []).map((d: any) => [d.registration_id, d]));

    // ─── Separate groups vs individuals ───
    const groups = new Map<string, Registration[]>();
    const individuals: Registration[] = [];

    for (const reg of registrations as Registration[]) {
      if (reg.group_payment_ref) {
        const key = reg.group_payment_ref;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(reg);
      } else {
        individuals.push(reg);
      }
    }

    let emitted = 0;
    let draftsOnly = 0;
    const errors: { id: string; email: string; error: string }[] = [];

    console.log(`🚀 Bulk emit: ${registrations.length} eligible (${individuals.length} individual, ${groups.size} groups) webinar=${webinarFilter}`);

    // ─── Process GROUPS ───
    for (const [groupRef, members] of groups) {
      try {
        // Find the buyer = member with invoice_details, or first member
        const buyer = members.find((m) => invoiceMap.has(m.id)) || members[0];
        const invoiceDetail = invoiceMap.get(buyer.id) || null;
        const allMemberIds = members.map((m) => m.id);
        const quantity = members.length;
        const totalPaid = members.reduce((sum, m) => sum + (m.paid_amount ? Number(m.paid_amount) : 0), 0);
        const planKey = buyer.plan_selected || "video-premium";

        console.log(`👥 Group ${groupRef.slice(0, 8)}: ${quantity} members, buyer=${buyer.email}, total=${totalPaid}€`);

        // Recovery: if buyer has no document_id, try to recover from message_logs or other members
        if (!buyer.invoice_document_id) {
          const recoveredId = await recoverDocumentId(supabase, allMemberIds);
          if (recoveredId) {
            console.log(`🔄 Group ${groupRef.slice(0, 8)}: recovered document #${recoveredId} from logs/members`);
            buyer.invoice_document_id = recoveredId;
            // Save on buyer
            await supabase
              .from("registrations")
              .update({ invoice_document_id: recoveredId } as any)
              .eq("id", buyer.id);
          }
        }

        // Delete orphan drafts for non-buyer members
        for (const member of members) {
          if (member.id !== buyer.id && member.invoice_document_id) {
            console.log(`🗑️ Deleting orphan draft #${member.invoice_document_id} for ${member.email}`);
            await fetch(
              `${BASE_URL}/invoice_receipts/${member.invoice_document_id}/change-state.json?api_key=${API_KEY}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ invoice: { state: "deleted" } }),
              }
            );
            await supabase
              .from("registrations")
              .update({ invoice_document_id: null } as any)
              .eq("id", member.id);
            await new Promise((r) => setTimeout(r, 500));
          }
        }

        const result = await emitInvoice({
          API_KEY, supabase, buyerReg: buyer, invoiceDetail,
          allMemberIds, quantity, totalPaid, planKey,
          customEmailSubject, customEmailBody,
        });

        if (!result.ok) {
          errors.push({ id: buyer.id, email: buyer.email, error: result.error || "Unknown" });
        } else if (result.drafted) {
          draftsOnly++;
        } else {
          emitted++;
        }

        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: any) {
        console.error(`❌ Group ${groupRef.slice(0, 8)}: ${err.message}`);
        errors.push({ id: groupRef, email: "group", error: err.message });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // ─── Process INDIVIDUALS ───
    for (const reg of individuals) {
      try {
        const invoiceDetail = invoiceMap.get(reg.id) || null;
        const planKey = reg.plan_selected || "premium";
        const totalPaid = reg.paid_amount ? Number(reg.paid_amount) : 0;

        const result = await emitInvoice({
          API_KEY, supabase, buyerReg: reg, invoiceDetail,
          allMemberIds: [reg.id], quantity: 1, totalPaid, planKey,
          customEmailSubject, customEmailBody,
        });

        if (!result.ok) {
          errors.push({ id: reg.id, email: reg.email, error: result.error || "Unknown" });
        } else if (result.drafted) {
          draftsOnly++;
        } else {
          emitted++;
        }

        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: any) {
        console.error(`❌ ${reg.email}: ${err.message}`);
        errors.push({ id: reg.id, email: reg.email, error: err.message });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`📊 Done: ${emitted} emitted, ${draftsOnly} drafts, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ emitted, draftsOnly, errors, total: registrations.length }),
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
