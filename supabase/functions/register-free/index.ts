import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const { firstName, lastName, email, whatsapp, referredBy } = await req.json();

    if (!firstName || !lastName || !email) {
      return new Response(
        JSON.stringify({ error: "Nome e email são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const name = `${firstName.trim()} ${lastName.trim()}`;

    // Check if email already exists
    const { data: existing } = await supabase
      .from("registrations")
      .select("referral_code, premium_unlocked")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      const origin = req.headers.get("origin") || "https://id-preview--bacfa751-bc77-4ced-ab7c-bb62e7ceb144.lovable.app";
      return new Response(
        JSON.stringify({
          referralCode: existing.referral_code,
          referralLink: `${origin}/?ref=${existing.referral_code}`,
          alreadyRegistered: true,
          premiumUnlocked: existing.premium_unlocked,
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

    // Insert new registration
    const { error: insertError } = await supabase.from("registrations").insert({
      name,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase().trim(),
      whatsapp: whatsapp?.trim() || null,
      referral_code: referralCode,
      referred_by: referredBy || null,
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

    const origin = req.headers.get("origin") || "https://id-preview--bacfa751-bc77-4ced-ab7c-bb62e7ceb144.lovable.app";

    return new Response(
      JSON.stringify({
        referralCode,
        referralLink: `${origin}/?ref=${referralCode}`,
        alreadyRegistered: false,
        premiumUnlocked: false,
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
