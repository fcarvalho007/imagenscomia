import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRODUCTS: Record<string, { value: number; identifier: string; description: string }> = {
  premium: {
    value: 18.45,
    identifier: "WEBINAR-PREMIUM",
    description: "Premium Pass — Webinar IA 18 Fev",
  },
  masterclass: {
    value: 57.81,
    identifier: "WEBINAR-MASTERCLASS",
    description: "Premium Pass + Masterclass IA",
  },
  workshop: {
    value: 512.0,
    identifier: "WEBINAR-WORKSHOP",
    description: "Premium Pass + Workshop Presencial",
  },
  bundle: {
    value: 76.26,
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
    value: 18.45,
    identifier: "WEBINAR-VIDPREM",
    description: "Premium Pass — Vídeo com IA",
  },
  "video-masterclass": {
    value: 57.81,
    identifier: "WEBINAR-VIDMC",
    description: "Masterclass — Vídeo com IA",
  },
  "video-bundle": {
    value: 76.26,
    identifier: "WEBINAR-VIDBUNDLE",
    description: "Premium + Masterclass — Vídeo com IA",
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

    const { plan, email, nome } = await req.json();

    const product = PRODUCTS[plan];
    if (!product) {
      return new Response(
        JSON.stringify({ error: "Plano inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Derive webinar from plan prefix
    const webinar = plan.startsWith("video-") ? "video" : "imagens";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- Idempotency check: reuse recent transaction if within 1 hour ---
    if (email) {
      const { data: reg } = await supabase
        .from("registrations")
        .select("eupago_ref, upgrade_clicked_at, paid_at, last_payment_link")
        .eq("email", email)
        .eq("webinar", webinar)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reg && reg.eupago_ref && !reg.paid_at && reg.upgrade_clicked_at) {
        const clickedAt = new Date(reg.upgrade_clicked_at).getTime();
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        if (clickedAt > oneHourAgo) {
          console.log(`⏳ Idempotent: reusing existing transaction for ${email}, ref=${reg.eupago_ref}`);
          return new Response(
            JSON.stringify({
              paymentLink: reg.last_payment_link || null,
              reference: reg.eupago_ref,
              idempotent: true,
              message: "Pagamento já em processamento. Verifica o teu email ou aguarda.",
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const origin = Deno.env.get("PUBLIC_SITE_URL") || "https://imagenscomia.com";

    // Lookup registration for rid+token+order_id in successUrl
    let regId = "";
    let editToken = "";
    let orderId = "";
    if (email) {
      const { data: regLookup } = await supabase
        .from("registrations")
        .select("id, edit_token, order_id")
        .eq("email", email)
        .eq("webinar", webinar)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (regLookup) {
        regId = regLookup.id;
        editToken = regLookup.edit_token || "";
        orderId = regLookup.order_id || "";
      }
    }

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
            identifier: orderId
              ? `ORDER-${orderId}-${(nome || "").replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 30)}`
              : `${product.identifier}-${Date.now()}`,
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
