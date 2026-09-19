import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { canReusePaymentLink, nextStoredPlan, webinarForPlan } from "../_shared/legacy/access.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRODUCTS: Record<string, { value: number; identifier: string; description: string }> = {
  premium: {
    value: 33.21,
    identifier: "WEBINAR-PREMIUM",
    description: "Premium Pass — Webinar IA",
  },
  masterclass: {
    value: 82.41,
    identifier: "WEBINAR-MASTERCLASS",
    description: "Premium Pass + Masterclass IA",
  },
  workshop: {
    value: 512.0,
    identifier: "WEBINAR-WORKSHOP",
    description: "Premium Pass + Workshop Presencial",
  },
  bundle: {
    value: 131.61,
    identifier: "WEBINAR-BUNDLE",
    description: "Premium Pass + Masterclass + Workshop",
  },
  gravacao: {
    value: 33.21,
    identifier: "WEBINAR-GRAVACAO",
    description: "Gravação + Pack de Apoio — Webinar IA",
  },
  "gravacao-masterclass": {
    value: 91.02,
    identifier: "WEBINAR-GRAVMC",
    description: "Gravação + Pack + Masterclass — Webinar IA",
  },
  "video-premium": {
    value: 33.21,
    identifier: "VIDEO-SESSAO",
    description: "Sessão Prática + Materiais — Vídeo com IA",
  },
  "video-masterclass": {
    value: 82.41,
    identifier: "VIDEO-MASTERCLASS",
    description: "Masterclass — Vídeo com IA",
  },
  "video-bundle": {
    value: 131.61,
    identifier: "VIDEO-BUNDLE",
    description: "Pack IA Completo — Vídeo + Imagens com IA",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");
    if (!EUPAGO_API_KEY) {
      throw new Error("EUPAGO_API_KEY is not configured");
    }

    const body = await req.json();
    const plan = typeof body?.plan === "string" ? body.plan : "";
    const nome = typeof body?.nome === "string" ? body.nome : "";
    const providedToken = typeof body?.editToken === "string" ? body.editToken.trim() : "";

    const product = PRODUCTS[plan];
    if (!product) {
      return new Response(
        JSON.stringify({ error: "Plano inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Derive webinar from plan prefix
    const webinar = webinarForPlan(plan);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Proof of possession is mandatory: an email never authorises a checkout.
    if (providedToken.length < 20) {
      return new Response(
        JSON.stringify({ error: "Acesso inválido. Recomeça a inscrição ou pede a ligação de acesso." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The registration must belong to the webinar implied by the plan.
    // There is deliberately no cross-webinar fallback.
    const { data: reg } = await supabase
      .from("registrations")
      .select("id, email, order_id, eupago_ref, paid_at, plan_selected, last_payment_link, payment_link_created_at")
      .eq("edit_token", providedToken)
      .eq("webinar", webinar)
      .maybeSingle();

    if (!reg) {
      return new Response(
        JSON.stringify({ error: "Inscrição não encontrada para este produto." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const regId: string = reg.id;
    const editToken = providedToken;
    const orderId: string = reg.order_id || "";
    const email: string = (reg.email || "").toLowerCase().trim();

    // Idempotency: only reuse a recent link for the exact same plan and amount.
    if (canReusePaymentLink(reg, plan, Date.now())) {
      console.log(`⏳ Idempotent: reusing existing transaction for registration ${regId}`);
      return new Response(
        JSON.stringify({
          paymentLink: reg.last_payment_link,
          reference: reg.eupago_ref,
          idempotent: true,
          message: "Pagamento já em processamento. Verifica o teu email ou aguarda.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const origin = Deno.env.get("PUBLIC_SITE_URL") || "https://imagenscomia.com";


    const PLAN_ABBREV: Record<string, string> = {
      premium: "SP", "video-premium": "SP", gravacao: "SP",
      masterclass: "MC", "video-masterclass": "MC",
      bundle: "PK", "video-bundle": "PK",
      "gravacao-masterclass": "GRMC",
    };
    const planTag = PLAN_ABBREV[plan] || plan.slice(0, 4).toUpperCase();
    const cleanName = (nome || "").replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 30);
    const cleanEmail = (email || "no-email").replace(/[^a-zA-Z0-9@._-]/g, "").slice(0, 30);
    const identifier = cleanName
      ? `ORD-${cleanName}-${planTag}`
      : `ORD-${cleanEmail}-${planTag}`;

    const eupagoResponse = await fetch(
      "https://clientes.eupago.pt/api/v1.02/paybylink/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey ${EUPAGO_API_KEY}`,
        },
        body: JSON.stringify({
          payment: {
            amount: {
              value: product.value,
              currency: "EUR",
            },
            identifier,
            successUrl: `${origin}/upgrade/sucesso?rid=${regId}&t=${encodeURIComponent(editToken)}`,
            failUrl: `${origin}/?payment=failed`,
            backUrl: `${origin}/upgrade`,
            lang: "PT",
            methods: ["CC", "MBWAY", "MB"],
            callbackUrl: `${supabaseUrl}/functions/v1/eupago-webhook`,
          },
          customer: {
            notify: false,
            email: email || undefined,
          },
        }),
      }
    );

    const data = await eupagoResponse.json();
    console.log("EuPago response keys:", Object.keys(data));
    console.log("EuPago response (safe):", JSON.stringify({
      transactionStatus: data.transactionStatus,
      url: data.url,
      redirectUrl: data.redirectUrl,
      paymentLink: data.paymentLink,
      payment_url: data.payment_url,
      reference: data.reference,
      transactionID: data.transactionID,
    }));

    if (!eupagoResponse.ok || data.transactionStatus !== "Success") {
      console.error("EuPago error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Erro ao criar pagamento", details: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentLink = data.url || data.redirectUrl || data.paymentLink || data.payment_url;
    const reference = data.reference || data.referencia;
    const transactionID = data.transactionID || data.transaction_id || data.id;

    // Save transactionID + reference + payment link to DB
    if (email) {
      try {
        await supabase
          .from("registrations")
          .update({
            eupago_ref: transactionID,
            eupago_transaction_id: transactionID || null,
            plan_selected: plan === "premium-masterclass" ? "bundle" : plan,
            upgrade_clicked_at: new Date().toISOString(),
            last_payment_link: paymentLink || null,
            payment_link_created_at: new Date().toISOString(),
          })
          .eq("email", email)
          .eq("webinar", webinar);

        console.log(`✅ Saved transactionID=${transactionID} for ${email}`);

        // Log to payment_events
        if (regId) {
          const idempotencyKey = `link-${email}-${plan}-${transactionID}`;
          await supabase.from("payment_events").insert({
            registration_id: regId,
            event_type: "link_created",
            eupago_ref: transactionID,
            idempotency_key: idempotencyKey,
            payload: { plan, email, paymentLink, reference, transactionID },
          }).then(({ error }) => {
            if (error) console.warn("payment_events insert (non-blocking):", error.message);
          });
        }
      } catch (dbErr) {
        console.error("DB save error (non-blocking):", dbErr);
      }
    }

    console.log(`Payment link created: plan=${plan}, email=${email}, ref=${reference}, txID=${transactionID}, link=${paymentLink}`);

    return new Response(
      JSON.stringify({ paymentLink, reference }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
