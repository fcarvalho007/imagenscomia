import { authorizedDelivery } from "../_shared/delivery-auth.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-crm-admin-email, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};


function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits.startsWith("351")) digits = "351" + digits;
  return digits;
}

async function sendViaSmsEasy(to: string, text: string): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  const credentials = Deno.env.get("SMSONLINE_API_KEY");
  if (!credentials) return { ok: false, messageId: null, error: "SMSONLINE_API_KEY not configured" };

  // Support both raw "user:pass" and pre-encoded Base64
  const isBase64 = !credentials.includes(":");
  const b64 = isBase64 ? credentials : btoa(credentials);

  const res = await fetch("https://login.smsonline.pt/Api/rest/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${b64}`,
    },
    body: JSON.stringify({
      to: [to],
      text,
      from: "IMAGENSIA",
      coding: "gsm-pt",
    }),
  });

  const body = await res.text();
  if (!res.ok) return { ok: false, messageId: null, error: `SMSEasy ${res.status}: ${body}` };

  try {
    const json = JSON.parse(body);
    return { ok: true, messageId: json?.id || json?.messageId || null };
  } catch {
    return { ok: true, messageId: null };
  }
}

async function sendViaEgoi(to: string, text: string): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  const apiKey = Deno.env.get("EGOI_API_KEY");
  if (!apiKey) return { ok: false, messageId: null, error: "EGOI_API_KEY not configured" };

  // Extract a valid 9-digit Portuguese mobile number
  let digits = to.replace(/\D/g, "");
  // Strip leading country codes (351, 00351, 0351)
  if (digits.startsWith("00351")) digits = digits.slice(5);
  else if (digits.startsWith("0351")) digits = digits.slice(4);
  else if (digits.startsWith("351") && digits.length > 9) digits = digits.slice(3);
  // Strip leading 0 (local format)
  if (digits.startsWith("0") && digits.length === 10) digits = digits.slice(1);

  // Validate: must be exactly 9 digits and start with 9 (mobile)
  if (digits.length !== 9) {
    return { ok: false, messageId: null, error: `Invalid phone: expected 9 digits, got ${digits.length} (${digits})` };
  }
  if (!digits.startsWith("9")) {
    return { ok: false, messageId: null, error: `Not a mobile number: ${digits} (must start with 9)` };
  }

  const egoiPhone = `351-${digits}`;

  const res = await fetch("https://slingshot.egoiapp.com/api/v2/sms/messages/action/send/single", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ApiKey": apiKey,
    },
    body: JSON.stringify({
      to: egoiPhone,
      from: "6",
      textBody: text,
      encoding: "unicode",
      maxCount: 1,
    }),
  });

  const body = await res.text();
  if (!res.ok) return { ok: false, messageId: null, error: `E-goi ${res.status}: ${body}` };

  try {
    const json = JSON.parse(body);
    return { ok: true, messageId: json?.messageId || json?.id || null };
  } catch {
    return { ok: true, messageId: null };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authDb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!await authorizedDelivery(req, authDb, (key) => Deno.env.get(key))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, text, provider, registrationId } = await req.json();

    if (!to || !text || !provider) {
      return new Response(JSON.stringify({ error: "Missing to, text, or provider" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phone = formatPhone(to);
    let result: { ok: boolean; messageId: string | null; error?: string };

    if (provider === "smseasy") {
      result = await sendViaSmsEasy(phone, text);
    } else if (provider === "egoi") {
      result = await sendViaEgoi(phone, text);
    } else {
      return new Response(JSON.stringify({ error: "Invalid provider" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log to message_logs
    if (registrationId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase.from("message_logs").insert({
        registration_id: registrationId,
        channel: "sms",
        provider,
        template_key: "sms_manual",
        status: result.ok ? "sent" : "failed",
        provider_message_id: result.messageId,
        error: result.error || null,
      });
    }

    return new Response(JSON.stringify({
      success: result.ok,
      provider,
      messageId: result.messageId,
      error: result.error,
    }), {
      status: result.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
