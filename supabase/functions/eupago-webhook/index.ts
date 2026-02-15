import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentData {
  transactionStatus: string;
  reference: string;
  amount: string;
  identifier: string;
  paymentMethod: string;
  transactionID: string;
}

function extractFromGET(req: Request): PaymentData {
  const url = new URL(req.url);
  const p = url.searchParams;
  return {
    transactionStatus: "Success",
    reference: p.get("referencia") || "",
    amount: p.get("valor") || "",
    identifier: p.get("identificador") || "",
    paymentMethod: p.get("canal") || "",
    transactionID: p.get("transacao") || "",
  };
}

async function extractFromPOST(req: Request): Promise<PaymentData> {
  const body = await req.json();
  return {
    transactionStatus: body.transactionStatus || "",
    reference: body.reference || "",
    amount: body.amount || "",
    identifier: body.identifier || "",
    paymentMethod: body.paymentMethod || "",
    transactionID: body.transactionID || body.transaction_id || "",
  };
}

async function processPayment(data: PaymentData) {
  const { transactionStatus, reference, amount, identifier, paymentMethod, transactionID } = data;

  console.log(`EuPago webhook: status=${transactionStatus}, ref=${reference}, amount=${amount}, method=${paymentMethod}, id=${identifier}, txID=${transactionID}`);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // --- Idempotent audit log: insert webhook event ---
  const idempotencyKey = `webhook-${transactionID || "none"}-${reference || "none"}`;
  const { error: eventError } = await supabase.from("payment_events").insert({
    event_type: "webhook_received",
    eupago_ref: transactionID || reference || null,
    idempotency_key: idempotencyKey,
    payload: data,
  });

  if (eventError) {
    if (eventError.code === "23505") {
      console.log(`⚡ Duplicate webhook ignored (idempotency_key=${idempotencyKey})`);
      return;
    }
    console.warn("payment_events insert warning:", eventError.message);
  }

  if (transactionStatus !== "Success") {
    console.log(`⚠️ Payment status: ${transactionStatus}, ref=${reference}`);
    return;
  }

  console.log(`✅ Payment confirmed: ref=${reference}, amount=${amount}, method=${paymentMethod}, id=${identifier}, txID=${transactionID}`);

  let matched = false;
  let matchedRegId: string | null = null;

  // Strategy 1: Match by transactionID
  if (transactionID) {
    const { data: rows, error } = await supabase
      .from("registrations")
      .update({
        paid_at: new Date().toISOString(),
        eupago_ref: reference || transactionID,
      })
      .eq("eupago_ref", transactionID)
      .select("id, email");

    if (!error && rows && rows.length > 0) {
      console.log(`✅ Matched by transactionID: ${rows[0].email}`);
      matched = true;
      matchedRegId = rows[0].id;
    } else {
      console.log(`⚠️ No match by transactionID=${transactionID}, trying email extraction...`);
    }
  }

  // Strategy 2: Extract email from identifier (fallback)
  if (!matched && identifier) {
    const parts = identifier.split("-");
    let email = "";
    if (parts.length >= 4) {
      email = parts.slice(2, -1).join("-");
    }

    if (email) {
      const { data: updatedRows, error } = await supabase
        .from("registrations")
        .update({
          paid_at: new Date().toISOString(),
          eupago_ref: reference || identifier,
        })
        .eq("email", email)
        .select("id");

      if (error) {
        console.error("DB update error (email fallback):", error);
      } else if (updatedRows && updatedRows.length > 0) {
        console.log(`✅ Updated registration for ${email} via email fallback`);
        matched = true;
        matchedRegId = updatedRows[0].id;
      }
    }
  }

  if (!matched) {
    console.warn("⚠️ Could not match payment to any registration. identifier:", identifier, "txID:", transactionID);
  }

  // Log payment_confirmed event
  if (matched && matchedRegId) {
    await supabase.from("payment_events").insert({
      registration_id: matchedRegId,
      event_type: "payment_confirmed",
      eupago_ref: transactionID || reference,
      idempotency_key: `confirmed-${transactionID || reference}-${matchedRegId}`,
      payload: data,
      processed_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.warn("payment_confirmed event (non-blocking):", error.message);
    });

    // Update the webhook_received event with registration_id and processed_at
    await supabase.from("payment_events")
      .update({ registration_id: matchedRegId, processed_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let data: PaymentData;

    if (req.method === "GET") {
      console.log("📥 EuPago classic GET callback");
      data = extractFromGET(req);
    } else {
      console.log("📥 EuPago POST webhook (2.0)");
      data = await extractFromPOST(req);
    }

    await processPayment(data);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
