import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all video registrations
    const { data: videoRegs, error: regErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .eq("webinar", "video");

    if (regErr) throw regErr;
    if (!videoRegs || videoRegs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0, skipped: 0, message: "No video registrations found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get all existing confirmation logs
    const { data: existingLogs } = await supabase
      .from("email_send_logs")
      .select("recipient_email")
      .eq("email_key", "confirmation")
      .eq("webinar", "video");

    const alreadySent = new Set((existingLogs || []).map((l) => l.recipient_email.toLowerCase()));

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const reg of videoRegs) {
      const email = reg.email.toLowerCase();

      // Double-check before each send
      if (alreadySent.has(email)) {
        skipped++;
        continue;
      }

      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-video-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ email, fname: (reg.first_name || "").trim() }),
        });

        if (res.ok) {
          sent++;
          alreadySent.add(email); // prevent duplicates within this run
        } else {
          const errText = await res.text();
          console.error(`Failed for ${email}: ${res.status} ${errText}`);
          failed++;
        }
      } catch (err) {
        console.error(`Error sending to ${email}:`, err);
        failed++;
      }
    }

    console.log(`Backfill complete: sent=${sent}, failed=${failed}, skipped=${skipped}`);

    return new Response(
      JSON.stringify({ sent, failed, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Backfill error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
