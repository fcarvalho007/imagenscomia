import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { data: registrations, error } = await supabase
      .from("registrations")
      .select("first_name, last_name, email, whatsapp, referral_code")
      .eq("webinar", "imagens")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }

    const results: { email: string; status: string }[] = [];

    for (const reg of registrations || []) {
      try {
        const res = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-egoi`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              first_name: reg.first_name || "",
              last_name: reg.last_name || "",
              email: reg.email,
              cellphone: reg.whatsapp || null,
              referral_code: reg.referral_code,
            }),
          }
        );

        const text = await res.text();
        console.log(`[${reg.email}] ${res.status}: ${text}`);
        results.push({ email: reg.email, status: res.ok ? "ok" : `error-${res.status}` });
      } catch (e) {
        console.error(`[${reg.email}] failed:`, e);
        results.push({ email: reg.email, status: "exception" });
      }

      // 200ms delay between calls
      await new Promise((r) => setTimeout(r, 200));
    }

    const success = results.filter((r) => r.status === "ok").length;
    const failed = results.length - success;

    return new Response(
      JSON.stringify({ total: results.length, success, failed, details: results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("bulk-sync-egoi error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
