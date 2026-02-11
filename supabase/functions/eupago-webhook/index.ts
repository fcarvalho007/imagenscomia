import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const body = await req.json();
    console.log("EuPago webhook received:", JSON.stringify(body));

    const { transactionStatus, reference, amount, identifier, paymentMethod } = body;

    if (transactionStatus === "Success" && identifier) {
      console.log(`✅ Payment confirmed: ref=${reference}, amount=${amount}, method=${paymentMethod}, id=${identifier}`);

      // Extract email from identifier format: WEBINAR-PLAN-email@example.com-timestamp
      const parts = identifier.split("-");
      // Remove first two parts (WEBINAR, PLAN) and last part (timestamp)
      // Email is everything in between
      let email = "";
      if (parts.length >= 4) {
        email = parts.slice(2, -1).join("-");
      }

      if (email) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase
          .from("registrations")
          .update({
            paid_at: new Date().toISOString(),
            eupago_ref: reference || identifier,
          })
          .eq("email", email);

        if (error) {
          console.error("DB update error:", error);
        } else {
          console.log(`✅ Updated registration for ${email} with paid_at`);
        }
      } else {
        console.warn("⚠️ Could not extract email from identifier:", identifier);
      }
    } else {
      console.log(`⚠️ Payment status: ${transactionStatus}, ref=${reference}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
