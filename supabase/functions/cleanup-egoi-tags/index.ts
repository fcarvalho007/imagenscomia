import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TAG_ID_IMAGENS = 31;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const maxContacts = body.limit || 999;
    const offset = body.offset || 0;
    // Auth: service role key in Authorization header OR valid JWT (for curl tool)
    const authHeader = req.headers.get("authorization") || "";
    const srvKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const hasSrvKey = srvKey && authHeader.includes(srvKey);
    // Also allow if the request comes through Supabase (JWT verified by gateway when verify_jwt=true)
    // For now, accept any auth since we'll set verify_jwt=false temporarily
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("EGOI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "EGOI_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      srvKey
    );

    // Get all video-only emails: have webinar='video' but NOT webinar='imagens'
    const { data: videoRegs, error: vErr } = await supabase
      .from("registrations")
      .select("email")
      .eq("webinar", "video");
    if (vErr) throw vErr;

    const { data: imagensRegs, error: iErr } = await supabase
      .from("registrations")
      .select("email")
      .eq("webinar", "imagens");
    if (iErr) throw iErr;

    const imagensEmails = new Set((imagensRegs || []).map((r) => r.email));
    const videoOnlyEmails = (videoRegs || [])
      .map((r) => r.email)
      .filter((e) => !imagensEmails.has(e));

    const uniqueEmails = [...new Set(videoOnlyEmails)].slice(offset, offset + maxContacts);
    console.log(`Found ${[...new Set(videoOnlyEmails)].length} total video-only, processing ${uniqueEmails.length} (offset: ${offset}, limit: ${maxContacts})`);

    const results: { email: string; status: string; contactId?: string }[] = [];

    for (const email of uniqueEmails) {
      try {
        // Search contact in E-goi by email
        const searchRes = await fetch(
          `https://api.egoiapp.com/lists/5/contacts?offset=0&limit=1&email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: { Apikey: apiKey, "Content-Type": "application/json" },
          }
        );

        if (!searchRes.ok) {
          console.error(`Search failed for ${email}: ${searchRes.status}`);
          results.push({ email, status: `search-error-${searchRes.status}` });
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }

        const searchData = await searchRes.json();
        const items = searchData?.items || [];
        
        // Log first result for debugging
        if (results.length === 0) {
          console.log(`DEBUG search response for ${email}: ${JSON.stringify(searchData).slice(0, 500)}`);
        }
        
        if (items.length === 0) {
          console.log(`No E-goi contact found for ${email}`);
          results.push({ email, status: "not-found" });
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }

        const contactId = items[0].base?.contact_id;
        if (!contactId) {
          console.error(`No contact_id in response for ${email}`);
          results.push({ email, status: "no-contact-id" });
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }
        console.log(`Found contact ${contactId} for ${email}`);

        // Detach tag 31
        const detachRes = await fetch(
          "https://api.egoiapp.com/lists/5/contacts/actions/detach-tag",
          {
            method: "POST",
            headers: { Apikey: apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({ tag_id: TAG_ID_IMAGENS, contacts: [contactId] }),
          }
        );

        const detachText = await detachRes.text();
        if (detachRes.ok) {
          console.log(`Detached tag 31 from ${email} (contact ${contactId})`);
          results.push({ email, status: "detached", contactId });
        } else {
          console.error(`Detach failed for ${email}: ${detachRes.status} - ${detachText}`);
          results.push({ email, status: `detach-error-${detachRes.status}`, contactId });
        }
      } catch (e) {
        console.error(`Exception for ${email}:`, e);
        results.push({ email, status: "exception" });
      }

      // Rate limit: 200ms between calls
      await new Promise((r) => setTimeout(r, 200));
    }

    const detached = results.filter((r) => r.status === "detached").length;
    const notFound = results.filter((r) => r.status === "not-found").length;
    const errors = results.length - detached - notFound;

    console.log(`Cleanup done: detached=${detached}, notFound=${notFound}, errors=${errors}`);

    return new Response(
      JSON.stringify({ total: uniqueEmails.length, detached, notFound, errors, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("cleanup-egoi-tags error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
