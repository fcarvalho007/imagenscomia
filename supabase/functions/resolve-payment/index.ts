import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCTS: Record<string, { value: number; identifier: string }> = {
  premium: { value: 18.45, identifier: "WEBINAR-PREMIUM" },
  masterclass: { value: 57.81, identifier: "WEBINAR-MASTERCLASS" },
  bundle: { value: 76.26, identifier: "WEBINAR-BUNDLE" },
  workshop: { value: 512.0, identifier: "WEBINAR-WORKSHOP" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .select("id, email, paid_at, last_payment_link, payment_link_created_at, plan_selected, edit_token, order_id")
      .eq("order_id", order_id)
      .maybeSingle();

    if (regErr || !reg) {
      return new Response(JSON.stringify({ error: "Inscrição não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already paid
    if (reg.paid_at) {
      return new Response(JSON.stringify({ status: "paid", redirect_url: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if existing link is still fresh (< 12h)
    const now = Date.now();
    const linkAge = reg.payment_link_created_at
      ? now - new Date(reg.payment_link_created_at).getTime()
      : Infinity;

    if (reg.last_payment_link && linkAge <= 12 * 60 * 60 * 1000) {
      // Validate link is alive
      try {
        const res = await fetch(reg.last_payment_link, { method: "HEAD", redirect: "follow" });
        if (res.status >= 200 && res.status < 400) {
          return new Response(JSON.stringify({ status: "pending", redirect_url: reg.last_payment_link }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch { /* link dead, regenerate */ }
    }

    // Need to regenerate payment link
    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");
    if (!EUPAGO_API_KEY) {
      return new Response(JSON.stringify({ error: "Configuração de pagamento em falta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = reg.plan_selected || "premium";
    const product = PRODUCTS[plan] || PRODUCTS.premium;
    const origin = "https://imagenscomia.lovable.app";

    const eupagoRes = await fetch("https://clientes.eupago.pt/api/v1.02/paybylink/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${EUPAGO_API_KEY}`,
      },
      body: JSON.stringify({
        payment: {
          amount: { value: product.value, currency: "EUR" },
          identifier: `ORDER-${reg.order_id}`,
          successUrl: `${origin}/upgrade/sucesso?rid=${reg.id}&t=${encodeURIComponent(reg.edit_token || "")}`,
          failUrl: `${origin}/?payment=failed`,
          backUrl: `${origin}/upgrade`,
          lang: "PT",
          methods: ["CC", "MBWAY", "MB"],
          callbackUrl: `${supabaseUrl}/functions/v1/eupago-webhook`,
        },
        customer: { notify: false, email: reg.email },
      }),
    });

    const linkData = await eupagoRes.json();
    if (!eupagoRes.ok || linkData.transactionStatus !== "Success") {
      console.error("EuPago error in resolve-payment:", JSON.stringify(linkData));
      return new Response(JSON.stringify({ error: "Erro ao gerar link de pagamento" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentLink = linkData.url || linkData.redirectUrl || linkData.paymentLink || linkData.payment_url;
    const txId = linkData.transactionID || linkData.transaction_id || linkData.id;

    await supabase.from("registrations").update({
      eupago_ref: txId,
      last_payment_link: paymentLink,
      payment_link_created_at: new Date().toISOString(),
    }).eq("id", reg.id);

    await supabase.from("payment_events").insert({
      registration_id: reg.id,
      event_type: "link_created",
      eupago_ref: txId,
      idempotency_key: `resolve-${reg.id}-${Date.now()}`,
      payload: { plan, source: "resolve-payment", order_id },
    });

    console.log(`🔗 resolve-payment: new link for order_id=${order_id}, email=${reg.email}`);

    return new Response(JSON.stringify({ status: "pending", redirect_url: paymentLink }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("resolve-payment error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
