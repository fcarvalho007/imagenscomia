import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LIST_ID = 5;
const TAG_VIDEO_WEBINAR = 34;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fname, phone, action, tagId, registrationId } = await req.json();

    const apiKey = Deno.env.get("EGOI_API_KEY");
    if (!apiKey) {
      console.error("EGOI_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "EGOI_API_KEY not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const baseUrl = `https://api.egoiapp.com/lists/${LIST_ID}`;

    // ── Helper: find contact by email ──
    const findContact = async (): Promise<string | null> => {
      try {
        const res = await fetch(
          `${baseUrl}/contacts?email=${encodeURIComponent(email)}`,
          { headers: { Apikey: apiKey } }
        );
        const data = await res.json();
        const contactId = data?.items?.[0]?.contact || null;
        console.log(`E-goi findContact(${email}): ${contactId ? `found ${contactId}` : "not found"}`);
        return contactId;
      } catch (err) {
        console.error("E-goi findContact error:", err);
        return null;
      }
    };

    // ── Helper: attach tag ──
    const attachTag = async (contactId: string, tid: number): Promise<boolean> => {
      try {
        const res = await fetch(
          `${baseUrl}/contacts/actions/attach-tag`,
          {
            method: "POST",
            headers: { Apikey: apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({ tag_id: tid, contacts: [contactId] }),
          }
        );
        const text = await res.text();
        console.log(`E-goi attach tag ${tid} to ${contactId}: status=${res.status}, body=${text}`);
        return res.ok;
      } catch (err) {
        console.error(`E-goi attachTag(${tid}) error:`, err);
        return false;
      }
    };

    // ── Helper: log to message_logs ──
    const logEvent = async (templateKey: string, status: string, errorMsg?: string) => {
      if (!registrationId) return;
      try {
        await supabase.from("message_logs").insert({
          registration_id: registrationId,
          channel: "api",
          provider: "egoi",
          template_key: templateKey,
          status,
          error: errorMsg || null,
        });
      } catch (err) {
        console.error("egoi-sync logEvent error:", err);
      }
    };

    // ══════════════════════════════════════════════════════════════════════════
    // ACTION: register
    // ══════════════════════════════════════════════════════════════════════════
    if (action === "register") {
      let contactId = await findContact();

      if (!contactId) {
        // Create contact
        const digits = phone ? phone.replace(/\D/g, "") : "";
        const localDigits = digits.startsWith("351") ? digits.slice(3) : digits;
        const cellphone = localDigits.length >= 9
          ? `+351${localDigits}`
          : undefined;

        const payload: Record<string, unknown> = {
          base: {
            email,
            first_name: fname || "",
            status: "active",
            ...(cellphone ? { cellphone } : {}),
          },
          extra: [],
        };

        console.log("E-goi creating contact:", JSON.stringify(payload));
        try {
          const res = await fetch(`${baseUrl}/contacts`, {
            method: "POST",
            headers: { Apikey: apiKey, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const text = await res.text();
          console.log(`E-goi create contact: status=${res.status}, body=${text}`);

          if (res.ok) {
            try {
              const created = JSON.parse(text);
              contactId = created?.contact_id || null;
            } catch { /* ignore parse error */ }
          } else if (res.status === 409) {
            // Contact exists (race condition) — extract contact_id from 409
            try {
              const conflict = JSON.parse(text);
              const contacts = conflict?.errors?.contacts;
              contactId = Array.isArray(contacts) && contacts.length > 0 ? contacts[0] : null;
              console.log(`E-goi 409 extracted contact_id: ${contactId}`);
            } catch { /* ignore */ }
          }
        } catch (err) {
          console.error("E-goi create contact error:", err);
          await logEvent("egoi_sync", "failed", String(err));
          return new Response(
            JSON.stringify({ success: false, error: String(err) }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      if (contactId) {
        await attachTag(contactId, TAG_VIDEO_WEBINAR);
        await logEvent("egoi_sync", "sent");
        return new Response(
          JSON.stringify({ success: true, contact_id: contactId }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await logEvent("egoi_sync", "failed", "Could not find or create contact");
      return new Response(
        JSON.stringify({ success: false, error: "Could not find or create contact" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ACTION: tag
    // ══════════════════════════════════════════════════════════════════════════
    if (action === "tag") {
      if (!tagId) {
        return new Response(
          JSON.stringify({ success: false, error: "tagId required for action=tag" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const contactId = await findContact();
      if (!contactId) {
        console.warn(`E-goi tag: contact not found for ${email}`);
        await logEvent("egoi_tag", "failed", "contact_not_found");
        return new Response(
          JSON.stringify({ success: false, reason: "contact_not_found" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ok = await attachTag(contactId, tagId);
      await logEvent("egoi_tag", ok ? "sent" : "failed", ok ? undefined : `Failed to attach tag ${tagId}`);
      return new Response(
        JSON.stringify({ success: ok, contact_id: contactId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("egoi-sync error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
