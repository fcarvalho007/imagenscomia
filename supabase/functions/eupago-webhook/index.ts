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

    const { transactionStatus, reference, amount, identifier, paymentMethod, transactionID, transaction_id } = body;
    const txID = transactionID || transaction_id;

    if (transactionStatus === "Success") {
      console.log(`✅ Payment confirmed: ref=${reference}, amount=${amount}, method=${paymentMethod}, id=${identifier}, txID=${txID}`);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      let matched = false;

      // Strategy 1: Match by transactionID (saved at payment creation)
      if (txID) {
        const { data, error } = await supabase
          .from("registrations")
          .update({
            paid_at: new Date().toISOString(),
            eupago_ref: reference || txID,
          })
          .eq("eupago_ref", txID)
          .select("email");

        if (!error && data && data.length > 0) {
          console.log(`✅ Matched by transactionID: ${data[0].email}`);
          matched = true;
        } else {
          console.log(`⚠️ No match by transactionID=${txID}, trying email extraction...`);
        }
      }

      // Strategy 2: Extract email from identifier (fallback)
      if (!matched && identifier) {
        const parts = identifier.split("-");
        let email = "";
        if (parts.length >= 4) {
          email = parts.slice(2, -1).join("-");
        }

        if (email) {
          const { error } = await supabase
            .from("registrations")
            .update({
              paid_at: new Date().toISOString(),
              eupago_ref: reference || identifier,
            })
            .eq("email", email);

          if (error) {
            console.error("DB update error (email fallback):", error);
          } else {
            console.log(`✅ Updated registration for ${email} via email fallback`);
            matched = true;
          }
        }
      }

      if (!matched) {
        console.warn("⚠️ Could not match payment to any registration. identifier:", identifier, "txID:", txID);
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
