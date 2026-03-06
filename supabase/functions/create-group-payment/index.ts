import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_PER_PERSON = 82.41;
const DISCOUNT_THRESHOLD = 3;
const DISCOUNT_RATE = 0.10;

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");
    if (!EUPAGO_API_KEY) throw new Error("EUPAGO_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { buyer, attendees, plan, webinar, discountApplied } = await req.json();

    if (!buyer?.firstName || !buyer?.email) {
      return new Response(JSON.stringify({ error: "Dados do comprador em falta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!attendees || !Array.isArray(attendees) || attendees.length < 1 || attendees.length > 10) {
      return new Response(JSON.stringify({ error: "Número de participantes inválido (1-10)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    for (const a of attendees) {
      if (!a.firstName || !a.email) {
        return new Response(JSON.stringify({ error: "Nome e email obrigatórios para cada participante" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate group_payment_ref
    const groupPaymentRef = crypto.randomUUID();
    const count = attendees.length;
    const shouldDiscount = count >= DISCOUNT_THRESHOLD;
    const total = count * PRICE_PER_PERSON * (shouldDiscount ? (1 - DISCOUNT_RATE) : 1);
    const totalRounded = Math.round(total * 100) / 100;

    console.log(`📦 Group payment: ${count} attendees, discount=${shouldDiscount}, total=${totalRounded}, ref=${groupPaymentRef}`);

    // Register each attendee
    const registeredIds: string[] = [];
    let buyerRegId = "";

    for (let i = 0; i < attendees.length; i++) {
      const a = attendees[i];
      const email = a.email.toLowerCase().trim();
      const firstName = a.firstName.trim();
      const lastName = (a.lastName || "").trim();
      const name = `${firstName} ${lastName}`.trim();
      const referralCode = generateCode();
      const editToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
      const orderId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

      // Check if this attendee already has a video registration
      const { data: existing } = await supabase
        .from("registrations")
        .select("id")
        .eq("email", email)
        .eq("webinar", "video")
        .maybeSingle();

      let regId: string;

      if (existing) {
        // Update existing registration with group info
        const { data: updated, error: upErr } = await supabase
          .from("registrations")
          .update({
            plan_selected: "masterclass-group-pending",
            group_payment_ref: groupPaymentRef,
            upgrade_clicked_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select("id")
          .single();

        if (upErr) {
          console.error(`Failed to update registration for ${email}:`, upErr);
          continue;
        }
        regId = updated.id;
      } else {
        // Create new registration
        const { data: inserted, error: insErr } = await supabase
          .from("registrations")
          .insert({
            name,
            first_name: firstName,
            last_name: lastName,
            email,
            referral_code: referralCode,
            edit_token: editToken,
            edit_token_created_at: new Date().toISOString(),
            order_id: orderId,
            registration_source: "webinar",
            webinar: "video",
            plan_selected: "masterclass-group-pending",
            group_payment_ref: groupPaymentRef,
            upgrade_clicked_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insErr) {
          console.error(`Failed to insert registration for ${email}:`, insErr);
          continue;
        }
        regId = inserted.id;
      }

      registeredIds.push(regId);

      // Track buyer's registration (first attendee whose email matches buyer, or first one)
      if (!buyerRegId && email === buyer.email.toLowerCase().trim()) {
        buyerRegId = regId;
      }
    }

    if (!buyerRegId && registeredIds.length > 0) {
      buyerRegId = registeredIds[0];
    }

    if (registeredIds.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum participante registado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create single EuPago payment
    const origin = Deno.env.get("PUBLIC_SITE_URL") || "https://imagenscomia.com";
    const buyerEmailClean = buyer.email.toLowerCase().trim().replace(/[^a-zA-Z0-9@._-]/g, "").slice(0, 30);
    const identifierStr = `GRP-${count}x-${buyerEmailClean}-MC`;

    const eupagoResponse = await fetch("https://clientes.eupago.pt/api/v1.02/paybylink/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${EUPAGO_API_KEY}`,
      },
      body: JSON.stringify({
        payment: {
          amount: { value: totalRounded, currency: "EUR" },
          identifier: identifierStr,
          successUrl: `${origin}/confirmacao?plan=masterclass&group=true`,
          failUrl: `${origin}/?payment=failed`,
          backUrl: `${origin}/comprar?plan=masterclass`,
          lang: "PT",
          methods: ["CC", "MBWAY", "MB"],
          callbackUrl: `${supabaseUrl}/functions/v1/eupago-webhook`,
        },
        customer: {
          notify: false,
          email: buyer.email.toLowerCase().trim(),
        },
      }),
    });

    const eupagoData = await eupagoResponse.json();
    console.log("EuPago group response:", JSON.stringify({
      status: eupagoData.transactionStatus,
      url: eupagoData.url,
      transactionID: eupagoData.transactionID,
    }));

    if (!eupagoResponse.ok || eupagoData.transactionStatus !== "Success") {
      console.error("EuPago group error:", JSON.stringify(eupagoData));
      return new Response(JSON.stringify({ error: "Erro ao criar pagamento" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentLink = eupagoData.url || eupagoData.redirectUrl || eupagoData.paymentLink || eupagoData.payment_url;
    const transactionID = eupagoData.transactionID || eupagoData.transaction_id || eupagoData.id;

    // Store payment info on buyer's registration
    if (buyerRegId) {
      await supabase.from("registrations").update({
        eupago_ref: transactionID,
        eupago_transaction_id: transactionID || null,
        last_payment_link: paymentLink || null,
        payment_link_created_at: new Date().toISOString(),
      }).eq("id", buyerRegId);

      // Log payment event
      await supabase.from("payment_events").insert({
        registration_id: buyerRegId,
        event_type: "group_link_created",
        eupago_ref: transactionID,
        idempotency_key: `group-link-${groupPaymentRef}`,
        payload: {
          groupPaymentRef,
          attendeeCount: count,
          total: totalRounded,
          discountApplied: shouldDiscount,
          buyerEmail: buyer.email,
          identifierStr,
        },
      }).then(({ error }) => {
        if (error) console.warn("payment_events insert:", error.message);
      });
    }

    return new Response(JSON.stringify({
      paymentLink,
      groupPaymentRef,
      attendeeCount: registeredIds.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-group-payment error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
