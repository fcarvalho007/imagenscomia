import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret, x-crm-admin-email, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TAG_MAP: Record<string, number> = {
  imagens: 32,
  video: 35,
};
const EGOI_LIST_ID = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registration_id } = await req.json();
    if (!registration_id) {
      return new Response(JSON.stringify({ error: "registration_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const apiKey = Deno.env.get("EGOI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "EGOI_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch registration email
    const { data: reg, error: regError } = await supabase
      .from("registrations")
      .select("email, webinar")
      .eq("id", registration_id)
      .maybeSingle();

    if (regError || !reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Find contactId in E-Goi
    const contactRes = await fetch(
      `https://api.egoiapp.com/lists/${EGOI_LIST_ID}/contacts?email=${encodeURIComponent(reg.email)}`,
      { headers: { "Apikey": apiKey } }
    );
    const contactData = await contactRes.json();
    const contactId = contactData?.items?.[0]?.base?.contact_id ?? null;

    if (!contactId) {
      console.warn(`[grant-premium-egoi] Contact not found in E-Goi for ${reg.email}`);
      return new Response(JSON.stringify({ ok: false, reason: "contact_not_found", email: reg.email }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Attach premium tag (32 for imagens, 35 for video)
    const webinar = reg.webinar || "imagens";
    const tagId = TAG_MAP[webinar] ?? TAG_MAP.imagens;
    const tagRes = await fetch(
      `https://api.egoiapp.com/lists/${EGOI_LIST_ID}/contacts/actions/attach-tag`,
      {
        method: "POST",
        headers: { "Apikey": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ tag_id: tagId, contacts: [contactId] }),
      }
    );
    const tagText = await tagRes.text();
    console.log(`[grant-premium-egoi] tag ${tagId} (${webinar}) → ${tagRes.status}: ${tagText}`);

    return new Response(JSON.stringify({ ok: tagRes.ok, email: reg.email, contactId, tagId, webinar, tagStatus: tagRes.status }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("grant-premium-egoi error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
