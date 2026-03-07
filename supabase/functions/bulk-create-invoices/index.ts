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
        prices["gravacao"] = Number(row.price_premium) || 0; // gravacao uses premium price
      } else if (row.webinar === "video") {
        prices["video-premium"] = Number(row.price_premium) || 0;
        prices["video-masterclass"] = Number(row.price_masterclass) || 0;
        prices["video-bundle"] = Number(row.price_bundle) || 0;
      }
    }
  }
  return prices;
}

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
  paid_amount: number | null;
  group_payment_ref: string | null;
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

    // Fetch DB prices (with IVA)
    const DB_PRICES = await fetchDBPrices(supabase);
    console.log("📦 DB prices loaded:", JSON.stringify(DB_PRICES));

    // Fetch all paid registrations without an invoice yet
    let query = supabase
      .from("registrations")
      .select("id, email, name, first_name, last_name, plan_selected, paid_at, webinar, eupago_ref, invoice_document_id, paid_amount, group_payment_ref")
      .not("paid_at", "is", null)
      .is("invoice_document_id", null);

    if (webinarFilter !== "all") {
      query = query.eq("webinar", webinarFilter);
    }

    const { data: registrations, error: fetchErr } = await query;
    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);

    if (!registrations || registrations.length === 0) {
      return new Response(
        JSON.stringify({ created: 0, skipped: 0, errors: [], message: "No eligible registrations" }),
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

    let created = 0;
    let skipped = 0;
    const errors: { id: string; email: string; error: string }[] = [];

    console.log(`📄 Bulk create: ${registrations.length} eligible (${individuals.length} individual, ${groups.size} groups) webinar=${webinarFilter}`);

    // ─── Helper: create a single draft ───
    async function createDraft(opts: {
      buyerReg: Registration;
      invoice: any;
      quantity: number;
      totalPaid: number;
      planKey: string;
      allMemberIds: string[];
    }) {
      const { buyerReg, invoice, quantity, totalPaid, planKey, allMemberIds } = opts;

      const clientName = invoice?.invoice_name || buyerReg.name || "Consumidor Final";
      const clientEmail = invoice?.invoice_email || buyerReg.email;
      const clientVat = invoice?.invoice_vat || "999999990";
      const clientAddress = invoice?.invoice_address || "";
      const clientZip = invoice?.invoice_zip || "";
      const clientCity = invoice?.invoice_city || "";

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
        console.log(`💰 ${buyerReg.email}: totalPaid=${totalPaid}€, qty=${quantity} → unitPrice=${unitPrice}€`);
      } else {
        // Fallback: use DB prices (with IVA) → apply same /1.23 logic
        const dbPrice = DB_PRICES[planKey] || 0;
        if (dbPrice > 0) {
          unitPrice = isPortuguese
            ? Math.round((dbPrice / 1.23) * 100) / 100
            : dbPrice;
        } else {
          unitPrice = 15.0;
        }
        console.warn(`⚠️ ${buyerReg.email}: no paid_amount — DB fallback: ${unitPrice}€`);
      }

      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

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
        console.error(`❌ ${buyerReg.email}: InvoiceExpress error`, JSON.stringify(createData));
        return { ok: false, error: JSON.stringify(createData) };
      }

      const documentId = String(createData.invoice_receipt?.id || createData.id);
      console.log(`✅ ${buyerReg.email} → draft #${documentId} (qty=${quantity})`);

      // Save document ID on ALL members
      for (const memberId of allMemberIds) {
        await supabase
          .from("registrations")
          .update({ invoice_document_id: documentId } as any)
          .eq("id", memberId);
      }

      return { ok: true, documentId };
    }

    // ─── Process GROUPS ───
    for (const [groupRef, members] of groups) {
      try {
        const buyer = members.find((m) => invoiceMap.has(m.id)) || members[0];
        const invoice = invoiceMap.get(buyer.id) || null;
        const allMemberIds = members.map((m) => m.id);
        const quantity = members.length;
        const totalPaid = members.reduce((sum, m) => sum + (m.paid_amount ? Number(m.paid_amount) : 0), 0);
        const planKey = buyer.plan_selected || "video-premium";

        console.log(`👥 Group ${groupRef.slice(0, 8)}: ${quantity} members, buyer=${buyer.email}, total=${totalPaid}€`);

        const result = await createDraft({
          buyerReg: buyer, invoice, quantity, totalPaid, planKey, allMemberIds,
        });

        if (!result.ok) {
          errors.push({ id: buyer.id, email: buyer.email, error: result.error || "Unknown" });
        } else {
          created++;
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
        const invoice = invoiceMap.get(reg.id) || null;
        const planKey = reg.plan_selected || "premium";
        const totalPaid = reg.paid_amount ? Number(reg.paid_amount) : 0;

        const result = await createDraft({
          buyerReg: reg, invoice, quantity: 1, totalPaid, planKey, allMemberIds: [reg.id],
        });

        if (!result.ok) {
          errors.push({ id: reg.id, email: reg.email, error: result.error || "Unknown" });
        } else {
          created++;
        }

        await new Promise((r) => setTimeout(r, 1000));
      } catch (err: any) {
        console.error(`❌ ${reg.email}: ${err.message}`);
        errors.push({ id: reg.id, email: reg.email, error: err.message });
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`📊 Done: ${created} created, ${skipped} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ created, skipped, errors, total: registrations.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("bulk-create-invoices error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
