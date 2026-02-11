import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { first_name, last_name, email, cellphone, referral_code } = await req.json();

    const apiKey = Deno.env.get("EGOI_API_KEY");
    if (!apiKey) {
      console.error("EGOI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "E-goi API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: Record<string, unknown> = {
      base: {
        status: "active",
        first_name: first_name || "",
        last_name: last_name || "",
        email: email,
        ...(cellphone ? { cellphone: `351-${cellphone.replace(/\D/g, "")}` } : {}),
      },
      extra: [
        { field_id: 40, value: referral_code || "" },
      ],
      tags: ["webinar_imagens_com_ia_18_fev"],
    };

    console.log("Sending to E-goi:", JSON.stringify(payload));

    const response = await fetch("https://api.egoiapp.com/lists/5/contacts", {
      method: "POST",
      headers: {
        "Apikey": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`E-goi response status: ${response.status}, body: ${responseText}`);

    if (!response.ok) {
      // If contact already exists (409), treat as success
      if (response.status === 409) {
        console.log("Contact already exists in E-goi, skipping");
        return new Response(
          JSON.stringify({ success: true, message: "Contact already exists" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error(`E-goi API error: ${response.status} - ${responseText}`);
      return new Response(
        JSON.stringify({ error: "E-goi sync failed", details: responseText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("sync-egoi error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
