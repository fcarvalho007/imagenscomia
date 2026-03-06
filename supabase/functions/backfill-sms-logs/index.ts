import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-crm-admin-email",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: require admin email header
    const adminEmail = req.headers.get("x-crm-admin-email");
    if (adminEmail?.toLowerCase() !== "fredericodigital@gmail.com") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { rows, templateKey } = await req.json();
    if (!rows || !Array.isArray(rows) || !templateKey) {
      return new Response(JSON.stringify({ error: "Missing rows or templateKey" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load all video registrations with phone
    const { data: registrations, error: regErr } = await supabase
      .from("registrations")
      .select("id, whatsapp, email, first_name")
      .eq("webinar", "video")
      .not("whatsapp", "is", null);

    if (regErr) throw regErr;

    // Build phone -> registration map (normalize to 9 digits)
    const phoneMap = new Map<string, { id: string; email: string }>();
    for (const reg of registrations || []) {
      if (!reg.whatsapp) continue;
      let digits = reg.whatsapp.replace(/\D/g, "");
      // Strip 351 prefix if present
      if (digits.startsWith("351") && digits.length > 9) digits = digits.slice(3);
      if (digits.startsWith("0") && digits.length === 10) digits = digits.slice(1);
      if (digits.length === 9) {
        phoneMap.set(digits, { id: reg.id, email: reg.email });
      }
    }

    // Check existing logs for dedup
    const regIds = Array.from(new Set([...phoneMap.values()].map((r) => r.id)));
    const { data: existingLogs } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", templateKey)
      .eq("channel", "sms")
      .in("registration_id", regIds);

    const alreadyLogged = new Set((existingLogs || []).map((l) => l.registration_id));

    let matched = 0;
    let unmatched = 0;
    let skipped = 0;
    let inserted = 0;
    const errors: string[] = [];

    // Process rows — dedup by registration_id (keep first per phone)
    const processedRegs = new Set<string>();

    for (const row of rows) {
      const rawPhone = String(row.phone || "").replace(/\D/g, "");
      let localPhone = rawPhone;
      // Strip 351 prefix
      if (localPhone.startsWith("351") && localPhone.length > 9) {
        localPhone = localPhone.slice(3);
      }
      if (localPhone.startsWith("0") && localPhone.length === 10) {
        localPhone = localPhone.slice(1);
      }

      const reg = phoneMap.get(localPhone);
      if (!reg) {
        unmatched++;
        continue;
      }

      matched++;

      if (alreadyLogged.has(reg.id) || processedRegs.has(reg.id)) {
        skipped++;
        continue;
      }

      processedRegs.add(reg.id);

      // Map status
      const csvStatus = String(row.status || "").toUpperCase();
      const logStatus = csvStatus === "DELIVRD" ? "sent" : "failed";

      const { error: insertErr } = await supabase.from("message_logs").insert({
        registration_id: reg.id,
        template_key: templateKey,
        channel: "sms",
        provider: "smseasy",
        status: logStatus,
        error: logStatus === "failed" ? csvStatus : null,
        created_at: row.timestamp || new Date().toISOString(),
      });

      if (insertErr) {
        errors.push(`${reg.email}: ${insertErr.message}`);
      } else {
        inserted++;
      }
    }

    console.log(`backfill-sms-logs: matched=${matched}, unmatched=${unmatched}, skipped=${skipped}, inserted=${inserted}`);

    return new Response(JSON.stringify({ matched, unmatched, skipped, inserted, errors }), {
      status: 200,
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
