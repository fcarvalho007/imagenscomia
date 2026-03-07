import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ACCOUNT = "fomentarsonhos";
const BASE_URL = `https://${ACCOUNT}.app.invoicexpress.com`;

const PLAN_LABELS: Record<string, string> = {
  premium: "Formação — Premium Pass · Imagens com IA",
  masterclass: "Formação — Masterclass · Imagens com IA",
  bundle: "Formação — Premium + Masterclass · Imagens com IA",
  gravacao: "Formação — Sessão HD + Pack Apoio · Imagens com IA",
  "video-premium": "Formação — Sessão HD + Pack Apoio · Vídeo com IA",
  "video-masterclass": "Formação — Masterclass · Vídeo com IA",
  "video-bundle": "Formação — Masterclass + Sessão · Vídeo com IA",
};

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
      .select("id, email, name, plan_selected, invoice_document_id, invoice_sent, webinar, group_payment_ref")
      .in("id", registrationIds);

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);

    let finalized = 0;
    let skippedCount = 0;
    const errors: { id: string; email: string; error: string }[] = [];

    // Track already-processed document IDs to avoid double-finalizing group invoices
    const processedDocIds = new Set<string>();

    for (const reg of registrations || []) {
      try {
        // Skip if already sent
        if (reg.invoice_sent) {
          console.log(`⏭️ ${reg.email}: already sent, skipping`);
          skippedCount++;
          continue;
        }

        const documentId = reg.invoice_document_id;

        if (!documentId) {
          console.log(`⏭️ ${reg.email}: no draft, skipping`);
          errors.push({ id: reg.id, email: reg.email, error: "No draft invoice found. Create drafts first." });
          continue;
        }

        // Skip if we already processed this document (group scenario)
        if (processedDocIds.has(documentId)) {
          console.log(`⏭️ ${reg.email}: doc #${documentId} already processed in this batch`);
          // Still mark as sent
          await supabase
            .from("registrations")
            .update({ invoice_sent: true })
            .eq("id", reg.id);
          continue;
        }

        // Step 0: Check document state before finalizing
        const currentState = await getIEDocumentState(API_KEY, documentId);
        console.log(`🔍 ${reg.email}: doc #${documentId} state="${currentState}"`);

        if (currentState === "finalized" || currentState === "settled") {
          console.log(`⏭️ ${reg.email}: doc #${documentId} already ${currentState} — skipping finalize`);
          processedDocIds.add(documentId);
          // Mark all group members as sent
          await markGroupMembersSent(supabase, reg, documentId);
          skippedCount++;
          // Still send email if not yet sent
          await sendInvoiceEmail(API_KEY, supabase, reg, documentId, customEmailSubject, customEmailBody);
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
        processedDocIds.add(documentId);

        // Step 2: Send by email
        await sendInvoiceEmail(API_KEY, supabase, reg, documentId, customEmailSubject, customEmailBody);

        // Step 3: Mark all group members as sent
        await markGroupMembersSent(supabase, reg, documentId);

        finalized++;
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: any) {
        console.error(`❌ ${reg.email}: ${err.message}`);
        errors.push({ id: reg.id, email: reg.email, error: err.message });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`📊 Bulk finalize done: ${finalized} finalized, ${skippedCount} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ finalized, skipped: skippedCount, errors, total: registrations?.length || 0 }),
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

// ─── Helper: send invoice email ───
async function sendInvoiceEmail(
  API_KEY: string,
  supabase: any,
  reg: any,
  documentId: string,
  customEmailSubject?: string,
  customEmailBody?: string,
) {
  await new Promise((r) => setTimeout(r, 2000));

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
          subject: (customEmailSubject || `Fatura-Recibo — {{plano}}`)
            .replace(/\{\{plano\}\}/g, itemDescription)
            .replace(/\{\{nome\}\}/g, reg.name || ""),
          body: (customEmailBody || `Olá {{nome}},\n\nSegue em anexo a sua fatura-recibo referente ao serviço subscrito.\n\nMuito obrigado pela confiança! Este documento foi emitido pela Fomentar Sonhos, Lda. — a empresa por detrás das formações do Frederico Carvalho.\n\nSe tiver qualquer questão, não hesite em responder a este email.\n\nCom os melhores cumprimentos,\nFrederico Carvalho\nFomentar Sonhos`)
            .replace(/\{\{plano\}\}/g, itemDescription)
            .replace(/\{\{nome\}\}/g, reg.name || ""),
          logo: "0",
        },
      }),
    }
  );

  const emailSent = emailRes.ok;
  console.log(`📧 ${reg.email}: email ${emailSent ? "sent" : "FAILED"}`);

  // Log
  await supabase.from("message_logs").insert({
    registration_id: reg.id,
    channel: "email",
    provider: "invoicexpress",
    template_key: "invoice_finalized",
    status: emailSent ? "sent" : "failed",
  });
}

// ─── Helper: mark group members as invoice_sent ───
async function markGroupMembersSent(supabase: any, reg: any, documentId: string) {
  // Always mark the current reg
  await supabase
    .from("registrations")
    .update({ invoice_sent: true })
    .eq("id", reg.id);

  // If part of a group, mark all members
  if (reg.group_payment_ref) {
    const { data: groupMembers } = await supabase
      .from("registrations")
      .select("id")
      .eq("group_payment_ref", reg.group_payment_ref);

    if (groupMembers) {
      for (const member of groupMembers) {
        await supabase
          .from("registrations")
          .update({ invoice_sent: true, invoice_document_id: documentId } as any)
          .eq("id", member.id);
      }
      console.log(`👥 Marked ${groupMembers.length} group members as invoice_sent`);
    }
  }
}
