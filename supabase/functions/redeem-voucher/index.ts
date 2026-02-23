import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Codes are ONLY defined server-side — never exposed to the browser
const VALID_CODES: Record<string, { product: string; plan: string }> = {
  fredgratis: { product: "gravacao", plan: "gravacao" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return new Response(JSON.stringify({ error: "Dados inválidos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedCode = String(code).toLowerCase().trim();
    const codeData = VALID_CODES[normalizedCode];

    if (!codeData) {
      return new Response(JSON.stringify({ error: "Código inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch registration
    const { data: reg, error: fetchErr } = await supabase
      .from("registrations")
      .select("id, edit_token, paid_at, is_gift, email")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr || !reg) {
      return new Response(
        JSON.stringify({ error: "Email não encontrado. Verifica o teu email de inscrição." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (reg.paid_at) {
      return new Response(
        JSON.stringify({ error: "Esta conta já tem acesso pago." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (reg.is_gift) {
      return new Response(
        JSON.stringify({ error: "Este voucher já foi utilizado nesta conta." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();

    // Activate access
    const { error: updateErr } = await supabase
      .from("registrations")
      .update({
        paid_at: now,
        is_gift: true,
        gift_code: normalizedCode,
        gifted_at: now,
        plan_selected: codeData.plan,
      } as any)
      .eq("id", reg.id);

    if (updateErr) {
      console.error("Error activating voucher:", updateErr);
      return new Response(
        JSON.stringify({ error: "Erro ao activar voucher. Tenta novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log
    await supabase.from("message_logs").insert({
      registration_id: reg.id,
      template_key: "voucher_redeemed",
      status: "sent",
      provider: "internal",
      channel: "email",
    } as any);

    const redirectUrl = `/upgrade/sucesso?rid=${reg.id}&t=${reg.edit_token || ""}`;

    return new Response(
      JSON.stringify({ success: true, redirectUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("redeem-voucher error:", err);
    return new Response(JSON.stringify({ error: "Erro interno." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
