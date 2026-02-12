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
    const TAG_ID = 31;

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

    // Helper to attach tag
    const attachTag = async (contactId: string) => {
      const tagResponse = await fetch(
        `https://api.egoiapp.com/lists/5/contacts/actions/attach-tag`,
        {
          method: "POST",
          headers: {
            "Apikey": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tag_id: TAG_ID,
            contacts: [contactId],
          }),
        }
      );
      const tagText = await tagResponse.text();
      console.log(`E-goi attach-tag response: ${tagResponse.status}, body: ${tagText}`);
      if (!tagResponse.ok) {
        console.error(`Failed to attach tag (id=${TAG_ID}) to contact ${contactId}`);
      }
    };

    if (!response.ok) {
      // If contact already exists (409), add tag
      if (response.status === 409) {
        console.log("Contact already exists in E-goi, attempting to add tag...");

        let contactId: string | null = null;
        try {
          const conflictData = JSON.parse(responseText);
          // E-goi returns contact_id in errors.contacts[0]
          const contacts = conflictData?.errors?.contacts;
          contactId = Array.isArray(contacts) && contacts.length > 0 ? contacts[0] : null;
          console.log(`Extracted contact_id from 409: ${contactId}`);
        } catch {
          console.error("Could not parse 409 response for contact_id");
        }

        if (contactId) {
          await attachTag(contactId);
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

    // Contact created successfully — now attach tag explicitly
    let newContactId: string | null = null;
    try {
      const createdData = JSON.parse(responseText);
      newContactId = createdData?.contact_id || null;
    } catch {
      console.error("Could not parse creation response for contact_id");
    }

    if (newContactId) {
      await attachTag(newContactId);
    } else {
      console.error("Contact created but no contact_id returned, cannot attach tag");
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
