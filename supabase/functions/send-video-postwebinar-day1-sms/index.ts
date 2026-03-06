import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const TEMPLATE_KEY = "sms_followup_day1";
const SMS_TEXT = "Bom dia. O documento resumo do webinar Video com IA foi enviado agora por email. Acesso premium + Sessao completa video em: imagenscomia.com/comprar";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("authorization") || "";
    const isCron = cronSecret === Deno.env.get("CRON_SECRET");
    const isServiceRole = authHeader.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "__none__");
    const isAnonCron = authHeader.includes(Deno.env.get("SUPABASE_ANON_KEY") || "__none__");

    if (!isCron && !isServiceRole && !isAnonCron) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get eligible registrants: free, not premium-granted, has phone, not do_not_contact
    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name, whatsapp")
      .eq("webinar", "video")
      .is("paid_at", null)
      .is("premium_granted_at", null)
      .eq("do_not_contact", false)
      .not("whatsapp", "is", null);

    if (queryErr) throw queryErr;

    // Filter out empty phone numbers
    const withPhone = (registrants || []).filter((r) => r.whatsapp && r.whatsapp.trim().length > 0);

    if (withPhone.length === 0) {
      return new Response(JSON.stringify({ sent: 0, skipped: 0, errors: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Dedup: check who already received this SMS
    const ids = withPhone.map((r) => r.id);
    const { data: alreadySent } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", TEMPLATE_KEY)
      .eq("channel", "sms")
      .eq("status", "sent")
      .in("registration_id", ids);

    const sentSet = new Set((alreadySent || []).map((m) => m.registration_id));
    const toSend = withPhone.filter((r) => !sentSet.has(r.id));

    let sent = 0;
    let errors = 0;

    for (const reg of toSend) {
      await new Promise((r) => setTimeout(r, 800));
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceRoleKey}`,
            "x-crm-admin-email": "fredericodigital@gmail.com",
          },
          body: JSON.stringify({
            to: reg.whatsapp,
            text: SMS_TEXT,
            provider: "smseasy",
            registrationId: reg.id,
          }),
        });

        const result = await res.json();

        // Also log with our template key for dedup
        if (result.success) {
          await supabase.from("message_logs").insert({
            registration_id: reg.id,
            template_key: TEMPLATE_KEY,
            provider: "smseasy",
            channel: "sms",
            status: "sent",
            provider_message_id: result.messageId || null,
          });
          sent++;
        } else {
          await supabase.from("message_logs").insert({
            registration_id: reg.id,
            template_key: TEMPLATE_KEY,
            provider: "smseasy",
            channel: "sms",
            status: "failed",
            error: result.error || JSON.stringify(result),
          });
          errors++;
        }
      } catch (err) {
        console.error(`SMS failed for ${reg.email}:`, err);
        errors++;
      }
    }

    console.log(`${TEMPLATE_KEY}: sent=${sent}, errors=${errors}, skipped=${sentSet.size}`);
    return new Response(JSON.stringify({ sent, skipped: sentSet.size, errors }), {
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
