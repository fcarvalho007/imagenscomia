import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCTS: Record<string, { value: number; identifier: string; label: string }> = {
  premium: { value: 18.45, identifier: "WEBINAR-PREMIUM", label: "Premium Pass (15+IVA)" },
  masterclass: { value: 57.81, identifier: "WEBINAR-MASTERCLASS", label: "Masterclass IA Vídeo (47+IVA)" },
  bundle: { value: 76.26, identifier: "WEBINAR-BUNDLE", label: "Premium Pass (15+IVA) + Masterclass IA Vídeo (47+IVA)" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");
    if (!EUPAGO_API_KEY) throw new Error("EUPAGO_API_KEY not configured");

    const { email, plan, nome } = await req.json();
    if (!email || !plan || !nome) {
      return new Response(
        JSON.stringify({ error: "email, plan e nome são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const product = PRODUCTS[plan];
    if (!product) {
      return new Response(
        JSON.stringify({ error: "Plano inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const origin = req.headers.get("origin") || "https://imagenscomia.lovable.app";

    // Generate new EuPago pay-by-link
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
            amount: { value: product.value, currency: "EUR" },
            identifier: `${product.identifier}-${email}-${Date.now()}`,
            successUrl: `${origin}/confirmacao?plan=${plan}&email=${encodeURIComponent(email)}`,
            failUrl: `${origin}/?payment=failed`,
            backUrl: `${origin}/upgrade`,
            lang: "PT",
            methods: ["CC", "MBWAY", "MB"],
            callbackUrl: `${supabaseUrl}/functions/v1/eupago-webhook`,
          },
          customer: { notify: false, email },
        }),
      }
    );

    const data = await eupagoResponse.json();
    console.log("EuPago reminder response:", JSON.stringify(data));

    if (!eupagoResponse.ok || data.transactionStatus !== "Success") {
      return new Response(
        JSON.stringify({ error: "Erro ao criar link de pagamento", details: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paymentLink = data.url || data.redirectUrl || data.paymentLink || data.payment_url;
    const transactionID = data.transactionID || data.transaction_id || data.id;

    // Look up registration for logging
    const { data: regRow } = await supabase
      .from("registrations")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    // Update eupago_ref + payment link metadata in DB
    if (transactionID) {
      await supabase
        .from("registrations")
        .update({
          eupago_ref: transactionID,
          last_payment_link: paymentLink || null,
          payment_link_created_at: new Date().toISOString(),
          last_payment_link_sent_at: new Date().toISOString(),
        })
        .eq("email", email);

      console.log(`✅ Updated eupago_ref=${transactionID} for ${email}`);
    }

    // Audit: insert into message_logs
    if (regRow) {
      await supabase.from("message_logs").insert({
        registration_id: regRow.id,
        channel: "email",
        provider: "internal",
        template_key: "payment_link_regenerated",
        status: "sent",
        payment_url: paymentLink || null,
      }).then(({ error }) => {
        if (error) console.warn("message_logs insert (non-blocking):", error.message);
      });

      // Audit: insert into payment_events
      const idempotencyKey = `reminder-${email}-${transactionID}-${Date.now()}`;
      await supabase.from("payment_events").insert({
        registration_id: regRow.id,
        event_type: "link_created",
        eupago_ref: transactionID,
        idempotency_key: idempotencyKey,
        payload: { plan, email, paymentLink, source: "generate-reminder" },
      }).then(({ error }) => {
        if (error) console.warn("payment_events insert (non-blocking):", error.message);
      });
    }

    // Format display value
    const displayValue = (product.value).toFixed(2).replace(".", ",");
    const firstName = nome.split(" ")[0];

    const emailSubject = `Lembrete — o teu ${product.label} está à espera`;
    const emailBody = `Olá ${firstName},

Vi que iniciaste o processo de inscrição no ${product.label} mas o pagamento ainda não foi concluído.

Deixo-te aqui o link para concluíres:
${paymentLink}

Valor total (c/ IVA): ${displayValue}€
Métodos disponíveis: MB WAY, Multibanco

Se tiveres alguma dúvida, responde a este email.

Frederico Carvalho`;

    return new Response(
      JSON.stringify({ paymentLink, transactionID, emailSubject, emailBody }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("generate-reminder error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
