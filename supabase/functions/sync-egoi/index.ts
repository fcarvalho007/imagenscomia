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

    const TAG = "webinar_imagens_com_ia_18_fev";

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
      tags: [TAG],
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
      // If contact already exists (409), add tag via PATCH
      if (response.status === 409) {
        console.log("Contact already exists in E-goi, attempting to add tag...");

        let contactId: string | null = null;
        try {
          const conflictData = JSON.parse(responseText);
          contactId = conflictData?.conflicts?.contact_id || null;
        } catch {
          console.error("Could not parse 409 response for contact_id");
        }

        if (contactId) {
          // Attach tag to existing contact
          const tagResponse = await fetch(
            `https://api.egoiapp.com/lists/5/contacts/actions/attach-tag`,
            {
              method: "POST",
              headers: {
                "Apikey": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                tag_id: TAG,
                contacts: [contactId],
              }),
            }
          );

          const tagText = await tagResponse.text();
          console.log(`E-goi attach-tag response: ${tagResponse.status}, body: ${tagText}`);

          if (!tagResponse.ok) {
            console.error(`Failed to attach tag to existing contact ${contactId}`);
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: "Contact already exists, tag added" }),
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
