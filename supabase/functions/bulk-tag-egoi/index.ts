import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TAG_MAP: Record<string, { premium: number; masterclass: number }> = {
  imagens: { premium: 32, masterclass: 33 },
  video: { premium: 35, masterclass: 33 },
};
const EGOI_LIST_ID = 5;
const DELAY_MS = 300;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const apiKey = Deno.env.get("EGOI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "EGOI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch all buyers (paid or premium-granted)
    const { data: buyers, error } = await supabase
      .from("registrations")
      .select("email, plan_selected, paid_at, premium_granted_at, webinar")
      .or("paid_at.not.is.null,premium_granted_at.not.is.null");

    if (error) {
      throw new Error(`Failed to fetch buyers: ${error.message}`);
    }

    console.log(`Found ${buyers?.length ?? 0} buyers to process`);

    const results: {
      email: string;
      plan: string | null;
      tags: number[];
      status: string;
      detail?: string;
    }[] = [];

    for (const buyer of buyers || []) {
      const plan = buyer.plan_selected;
      const webinar = (buyer as any).webinar || "imagens";
      const tags = TAG_MAP[webinar] ?? TAG_MAP.imagens;

      // Determine tags to apply
      const tagsToApply: number[] = [];
      if (["premium", "bundle"].includes(plan ?? "") || buyer.premium_granted_at) {
        tagsToApply.push(tags.premium);
      }
      if (["masterclass", "bundle"].includes(plan ?? "")) {
        tagsToApply.push(tags.masterclass);
      }

      if (tagsToApply.length === 0) {
        console.log(`[${buyer.email}] No tags to apply (plan: ${plan})`);
        results.push({ email: buyer.email, plan, tags: [], status: "no_tags" });
        continue;
      }

      // 2. Find contactId by email in E-Goi
      let contactId: string | null = null;
      try {
        const contactRes = await fetch(
          `https://api.egoiapp.com/lists/${EGOI_LIST_ID}/contacts?email=${encodeURIComponent(buyer.email)}`,
          { headers: { "Apikey": apiKey } }
        );
        const contactData = await contactRes.json();
        // Log full response for first contact to diagnose field structure
        if (results.length === 0) {
          console.log(`[DEBUG] E-Goi contacts response for ${buyer.email}:`, JSON.stringify(contactData));
        }
        // E-Goi returns contact_id in items[0].base.contact_id
        const item = contactData?.items?.[0];
        contactId = item?.base?.contact_id ?? null;
        console.log(`[${buyer.email}] contactId: ${contactId}`);
      } catch (e) {
        console.error(`[${buyer.email}] Error fetching contact:`, e);
        results.push({ email: buyer.email, plan, tags: tagsToApply, status: "error_lookup", detail: String(e) });
        await new Promise((r) => setTimeout(r, DELAY_MS));
        continue;
      }

      if (!contactId) {
        console.warn(`[${buyer.email}] Contact not found in E-Goi`);
        results.push({ email: buyer.email, plan, tags: tagsToApply, status: "contact_not_found" });
        await new Promise((r) => setTimeout(r, DELAY_MS));
        continue;
      }

      // 3. Attach each tag
      let allTagsOk = true;
      for (const tagId of tagsToApply) {
        try {
          const tagRes = await fetch(
            `https://api.egoiapp.com/lists/${EGOI_LIST_ID}/contacts/actions/attach-tag`,
            {
              method: "POST",
              headers: { "Apikey": apiKey, "Content-Type": "application/json" },
              body: JSON.stringify({ tag_id: tagId, contacts: [contactId] }),
            }
          );
          const tagText = await tagRes.text();
          console.log(`[${buyer.email}] tag ${tagId} → ${tagRes.status}: ${tagText}`);
          if (!tagRes.ok) {
            allTagsOk = false;
          }
        } catch (e) {
          console.error(`[${buyer.email}] Error attaching tag ${tagId}:`, e);
          allTagsOk = false;
        }
      }

      results.push({
        email: buyer.email,
        plan,
        tags: tagsToApply,
        status: allTagsOk ? "ok" : "partial_error",
      });

      // 4. Rate-limit delay
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    // Summary
    const summary = {
      total: results.length,
      tagged: results.filter((r) => r.status === "ok").length,
      contact_not_found: results.filter((r) => r.status === "contact_not_found").length,
      no_tags: results.filter((r) => r.status === "no_tags").length,
      errors: results.filter((r) => ["error_lookup", "partial_error"].includes(r.status)).length,
      details: results,
    };

    console.log("Bulk tag complete:", JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("bulk-tag-egoi error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
