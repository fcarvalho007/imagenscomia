import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { firstName, lastName, email, whatsapp, referredBy, registrationSource, webinar } = await req.json();

    if (!firstName || !email) {
      return new Response(
        JSON.stringify({ error: "Nome e email são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = `${firstName.trim()} ${(lastName || "").trim()}`.trim();
    const cleanPhone = whatsapp ? whatsapp.replace(/[\s\-\(\)\.]/g, "") : null;

    // Check if email already exists
    const { data: existing } = await supabase
      .from("registrations")
      .select("referral_code, premium_unlocked, first_name, last_name, whatsapp")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      // Sync to E-goi for existing registrations (non-blocking)
      try {
        const egoiResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-egoi`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              first_name: existing.first_name || "",
              last_name: existing.last_name || "",
              email: email.toLowerCase().trim(),
              cellphone: existing.whatsapp || null,
              referral_code: existing.referral_code,
            }),
          }
        );
        const egoiResult = await egoiResponse.text();
        console.log(`E-goi sync (existing) result: ${egoiResponse.status} - ${egoiResult}`);
      } catch (egoiError) {
        console.error("E-goi sync failed for existing registration (non-blocking):", egoiError);
      }

      // Video webinar: sync to E-goi with video tag (non-blocking)
      if ((webinar || "imagens") === "video") {
        fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/egoi-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            action: "register",
            email: email.toLowerCase().trim(),
            fname: (existing.first_name || "").trim(),
            phone: existing.whatsapp ? `+351${existing.whatsapp.replace(/\D/g, "")}` : "",
          }),
        }).catch(err => console.error("egoi-sync (video existing) failed:", err));
      }

      const origin = req.headers.get("origin") || "https://id-preview--bacfa751-bc77-4ced-ab7c-bb62e7ceb144.lovable.app";
      return new Response(
        JSON.stringify({
          referralCode: existing.referral_code,
          referralLink: `${origin}/?ref=${existing.referral_code}`,
          alreadyRegistered: true,
          premiumUnlocked: existing.premium_unlocked,
          name: `${existing.first_name || ""} ${existing.last_name || ""}`.trim(),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique referral code
    let referralCode = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: dup } = await supabase
        .from("registrations")
        .select("id")
        .eq("referral_code", referralCode)
        .maybeSingle();
      if (!dup) break;
      referralCode = generateCode();
      attempts++;
    }

    // Generate edit_token
    const editToken = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);

    // Generate order_id (12 chars, alphanumeric)
    const orderId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    // Insert new registration
    const { error: insertError } = await supabase.from("registrations").insert({
      name,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase().trim(),
      whatsapp: cleanPhone || null,
      referral_code: referralCode,
      referred_by: referredBy || null,
      edit_token: editToken,
      edit_token_created_at: new Date().toISOString(),
      order_id: orderId,
      registration_source: registrationSource || "webinar",
      webinar: webinar || "imagens",
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro ao registar" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If referred_by exists, check if the referrer now has 2+ referrals
    if (referredBy) {
      const { count } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("referred_by", referredBy);

      if (count !== null && count >= 2) {
        await supabase
          .from("registrations")
          .update({ premium_unlocked: true })
          .eq("referral_code", referredBy);

        console.log(`Premium unlocked for referrer: ${referredBy}`);
      }
    }

    // Sync to E-goi (non-blocking — don't fail registration if E-goi fails)
    try {
      const egoiResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-egoi`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: (lastName || "").trim(),
            email: email.toLowerCase().trim(),
            cellphone: cleanPhone || null,
            referral_code: referralCode,
          }),
        }
      );
      const egoiResult = await egoiResponse.text();
      console.log(`E-goi sync result: ${egoiResponse.status} - ${egoiResult}`);
    } catch (egoiError) {
      console.error("E-goi sync failed (non-blocking):", egoiError);
    }

    // Video webinar: sync to E-goi with video tag (non-blocking)
    if ((webinar || "imagens") === "video") {
      fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/egoi-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          action: "register",
          email: email.toLowerCase().trim(),
          fname: firstName.trim(),
          phone: cleanPhone ? `+351${cleanPhone.replace(/\D/g, "")}` : "",
        }),
      }).catch(err => console.error("egoi-sync (video register) failed:", err));
    }

    // Send video confirmation email (non-blocking)
    if ((webinar || "imagens") === "video") {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        fetch(`${supabaseUrl}/functions/v1/send-video-confirmation`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
          body: JSON.stringify({ email: email.toLowerCase().trim(), fname: firstName.trim() }),
        }).catch((err) => console.error("Video confirmation email failed (non-blocking):", err));
      } catch (err) {
        console.error("Video confirmation email setup failed:", err);
      }
    }

    const origin = req.headers.get("origin") || "https://id-preview--bacfa751-bc77-4ced-ab7c-bb62e7ceb144.lovable.app";

    return new Response(
      JSON.stringify({
        referralCode,
        referralLink: `${origin}/?ref=${referralCode}`,
        alreadyRegistered: false,
        premiumUnlocked: false,
        editToken,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
