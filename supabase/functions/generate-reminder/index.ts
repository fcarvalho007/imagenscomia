import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCTS: Record<string, { value: number; identifier: string; label: string }> = {
  premium: { value: 18.45, identifier: "WEBINAR-PREMIUM", label: "Premium Pass" },
  masterclass: { value: 57.81, identifier: "WEBINAR-MASTERCLASS", label: "Premium Pass + Masterclass IA" },
  bundle: { value: 76.26, identifier: "WEBINAR-BUNDLE", label: "Premium Pass + Masterclass + Workshop" },
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
            successUrl: `${origin}/confirmacao?plan=${plan}`,
            failUrl: `${origin}/?payment=failed`,
            backUrl: `${origin}/upgrade`,
            lang: "PT",
            methods: ["CC", "MBWAY", "MB"],
            callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/eupago-webhook`,
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

    // Update eupago_ref in DB
    if (transactionID) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from("registrations")
        .update({ eupago_ref: transactionID })
        .eq("email", email);

      console.log(`✅ Updated eupago_ref=${transactionID} for ${email}`);
    }

    // Format display value (with IVA included)
    const displayValue = (product.value).toFixed(2).replace(".", ",");
    const firstName = nome.split(" ")[0];

    // Build email template
    const emailSubject = `Lembrete — o teu ${product.label} está à espera`;
    const emailBody = `Olá ${firstName},

Vi que iniciaste o processo de inscrição no ${product.label} mas o pagamento ainda não foi concluído.

Deixo-te aqui o link para concluíres:
${paymentLink}

Valor: ${displayValue}€
Métodos disponíveis: Cartão de Crédito, MB WAY, Multibanco

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
