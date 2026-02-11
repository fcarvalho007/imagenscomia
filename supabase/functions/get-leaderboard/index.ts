import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all registrations that were referred by someone
    const { data: referrals, error } = await supabase
      .from("registrations")
      .select("referred_by")
      .not("referred_by", "is", null);

    if (error) throw error;

    // Count referrals per referral_code
    const counts: Record<string, number> = {};
    for (const r of referrals || []) {
      if (r.referred_by) {
        counts[r.referred_by] = (counts[r.referred_by] || 0) + 1;
      }
    }

    // Get top codes sorted by count
    const topCodes = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (topCodes.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch names for these referral codes
    const codes = topCodes.map(([code]) => code);
    const { data: referrers } = await supabase
      .from("registrations")
      .select("referral_code, name")
      .in("referral_code", codes);

    const nameMap: Record<string, string> = {};
    for (const r of referrers || []) {
      // Anonymize: "Frederico Carvalho" -> "Frederico C."
      const parts = r.name.trim().split(/\s+/);
      const anonymized =
        parts.length > 1
          ? `${parts[0]} ${parts[parts.length - 1][0]}.`
          : parts[0];
      nameMap[r.referral_code] = anonymized;
    }

    const leaderboard = topCodes.map(([code, count]) => ({
      name: nameMap[code] || "Anónimo",
      count,
      referralCode: code,
    }));

    return new Response(JSON.stringify(leaderboard), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
