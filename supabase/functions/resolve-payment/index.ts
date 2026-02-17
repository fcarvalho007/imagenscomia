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

/** Validate a payment link with GET + redirect:manual + 8s timeout */
async function validateLink(url: string): Promise<{ valid: boolean; status: number }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { method: "GET", redirect: "manual", signal: controller.signal });
    clearTimeout(timer);
    if (res.status === 200) {
      return { valid: true, status: 200 };
    }
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location") || "";
      const isCheckout = location.includes("/api/extern/paybylink/form/") || location.includes("/paybylink/");
      return { valid: isCheckout, status: res.status };
    }
    return { valid: false, status: res.status };
  } catch {
    return { valid: false, status: 0 };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://imagenscomia.com";

  // Helper: log resolve attempt to message_logs (non-blocking)
  async function logResolve(regId: string | null, resolveStatus: string, redirectUrl: string | null, errorDetail: string | null) {
    if (!regId) {
      console.log(`[resolve-payment] no reg for logging: status=${resolveStatus}, error=${errorDetail}`);
      return;
    }
    const dbStatus = ["ok_redirect", "regenerated", "already_paid"].includes(resolveStatus) ? "sent" : "failed";
    try {
      const { error: logErr } = await supabase.from("message_logs").insert({
        registration_id: regId,
        channel: "email",
        provider: "system",
        template_key: "resolve_attempt",
        status: dbStatus,
        payment_url: redirectUrl || null,
        error: JSON.stringify({ resolve: resolveStatus, detail: errorDetail }),
      });
      if (logErr) console.warn("resolve log insert error:", logErr.message);
      else console.log(`[resolve-payment] logged: reg=${regId}, resolve=${resolveStatus}, db_status=${dbStatus}`);
    } catch (e) {
      console.warn("resolve log insert (non-blocking):", e);
    }
  }

  /** Generate a fresh EuPago payment link. Returns { paymentLink, txId } or null. */
  async function generateLink(reg: any, plan: string, product: any, EUPAGO_API_KEY: string): Promise<{ paymentLink: string; txId: string } | null> {
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
          successUrl: `${siteUrl}/upgrade/sucesso?rid=${reg.id}&t=${encodeURIComponent(reg.edit_token || "")}`,
          failUrl: `${siteUrl}/?payment=failed`,
          backUrl: `${siteUrl}/upgrade`,
          lang: "PT",
          methods: ["CC", "MBWAY", "MB"],
          callbackUrl: `${supabaseUrl}/functions/v1/eupago-webhook`,
        },
        customer: { notify: false, email: reg.email },
      }),
    });

    const linkData = await eupagoRes.json();
    console.log("[resolve-payment] EuPago response keys:", Object.keys(linkData));
    console.log("[resolve-payment] EuPago response (safe):", JSON.stringify({
      transactionStatus: linkData.transactionStatus,
      url: linkData.url,
      redirectUrl: linkData.redirectUrl,
      paymentLink: linkData.paymentLink,
      payment_url: linkData.payment_url,
      reference: linkData.reference,
      transactionID: linkData.transactionID,
    }));

    if (!eupagoRes.ok || linkData.transactionStatus !== "Success") {
      console.error("[resolve-payment] EuPago error:", JSON.stringify(linkData).slice(0, 300));
      return null;
    }

    const paymentLink = linkData.url || linkData.redirectUrl || linkData.paymentLink || linkData.payment_url;
    const txId = linkData.transactionID || linkData.transaction_id || linkData.id;

    // Persist to DB
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
      payload: { plan, source: "resolve-payment", order_id: reg.order_id },
    });

    return { paymentLink, txId };
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .select("id, email, name, paid_at, last_payment_link, payment_link_created_at, plan_selected, edit_token, order_id")
      .eq("order_id", order_id)
      .maybeSingle();

    if (regErr || !reg) {
      await logResolve(null, "not_found", null, `order_id=${order_id}`);
      return new Response(JSON.stringify({ error: "Inscrição não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already paid
    if (reg.paid_at) {
      await logResolve(reg.id, "already_paid", null, null);
      return new Response(JSON.stringify({ status: "paid", redirect_url: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");
    if (!EUPAGO_API_KEY) {
      await logResolve(reg.id, "error", null, "EUPAGO_API_KEY missing");
      return new Response(JSON.stringify({ error: "Configuração de pagamento em falta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = reg.plan_selected || "premium";
    const product = PRODUCTS[plan] || PRODUCTS.premium;

    // --- Validate + regenerate loop (max 2 attempts) ---
    const MAX_ATTEMPTS = 2;
    let currentLink = reg.last_payment_link;
    const now = Date.now();
    const linkAge = reg.payment_link_created_at
      ? now - new Date(reg.payment_link_created_at).getTime()
      : Infinity;
    const linkFresh = linkAge <= 12 * 60 * 60 * 1000;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // If we have a fresh link, validate it
      if (currentLink && (attempt === 1 ? linkFresh : true)) {
        const { valid, status: httpStatus } = await validateLink(currentLink);
        console.log(`[resolve-payment] validate: order_id=${order_id}, url=${currentLink}, http_status=${httpStatus}, attempt=${attempt}, regenerated=${attempt > 1}`);

        if (valid) {
          await logResolve(reg.id, attempt === 1 ? "ok_redirect" : "regenerated", currentLink, JSON.stringify({ http_status: httpStatus, attempts: attempt }));
          return new Response(JSON.stringify({ status: "pending", redirect_url: currentLink }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        console.log(`[resolve-payment] link invalid (status=${httpStatus}), will regenerate`);
      }

      // Generate a new link
      const result = await generateLink(reg, plan, product, EUPAGO_API_KEY);
      if (!result) {
        await logResolve(reg.id, "error", null, JSON.stringify({ eupago_create_failed: true, attempt }));
        return new Response(JSON.stringify({ error: "Erro ao gerar link de pagamento" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      currentLink = result.paymentLink;
      console.log(`[resolve-payment] regenerated link: order_id=${order_id}, attempt=${attempt}, txId=${result.txId}`);
    }

    // If we get here, both attempts produced links that failed validation
    await logResolve(reg.id, "error_link_invalid", currentLink, JSON.stringify({ attempts: MAX_ATTEMPTS, final_url: currentLink }));
    console.error(`[resolve-payment] error_link_invalid after ${MAX_ATTEMPTS} attempts for order_id=${order_id}`);

    return new Response(JSON.stringify({ status: "error_link_invalid" }), {
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
