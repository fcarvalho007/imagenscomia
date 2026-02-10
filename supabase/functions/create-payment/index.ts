import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRODUCTS: Record<string, { value: number; identifier: string; description: string }> = {
  premium: {
    value: 15.0,
    identifier: "WEBINAR-PREMIUM",
    description: "Premium Pass — Webinar IA 18 Fev",
  },
  masterclass: {
    value: 52.0,
    identifier: "WEBINAR-MASTERCLASS",
    description: "Premium Pass + Masterclass IA",
  },
  workshop: {
    value: 512.0,
    identifier: "WEBINAR-WORKSHOP",
    description: "Premium Pass + Workshop Presencial",
  },
  bundle: {
    value: 524.0,
    identifier: "WEBINAR-BUNDLE",
    description: "Premium Pass + Masterclass + Workshop",
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

    // Build the base URL from the request origin or use a fallback
    const origin = req.headers.get("origin") || "https://id-preview--bacfa751-bc77-4ced-ab7c-bb62e7ceb144.lovable.app";

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
            identifier: `${product.identifier}-${Date.now()}`,
            successUrl: `${origin}/confirmacao?plan=${plan}`,
            failUrl: `${origin}/?payment=failed`,
            backUrl: `${origin}/upgrade`,
            lang: "PT",
            methods: ["CC", "MBWAY", "MB"],
            callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/eupago-webhook`,
          },
          customer: {
            notify: false,
            email: email || undefined,
          },
        }),
      }
    );

    const data = await eupagoResponse.json();

    if (!eupagoResponse.ok || data.transactionStatus !== "Success") {
      console.error("EuPago error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Erro ao criar pagamento", details: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Payment link created: plan=${plan}, email=${email}, ref=${data.reference}`);

    return new Response(
      JSON.stringify({ paymentLink: data.paymentLink, reference: data.reference }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating payment:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
