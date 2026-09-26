import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { authorizedDelivery } from "../_shared/delivery-auth.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EGOI_SENDER_ID = "2";
const EGOI_DOMAIN = "mkt.digitalfc.pt";
const EGOI_SENDER_NAME = "Frederico Carvalho";
const DEFAULT_FROM = "Frederico Carvalho <frederico.carvalho@digitalfc.pt>";

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SendEmailResponse {
  success: boolean;
  provider: "brevo" | "egoi" | "resend";
  messageId: string | null;
  error?: string;
}

async function sendViaBrevo(to: string, subject: string, html: string): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) return { ok: false, messageId: null, error: "BREVO_API_KEY not configured" };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Frederico Carvalho", email: "frederico.carvalho@digitalfc.pt" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      const messageId = data?.messageId || data?.id || null;
      console.log(`Brevo sent to ${to}: ${messageId}`);
      return { ok: true, messageId };
    }

    console.warn(`Brevo failed (${res.status}) for ${to}:`, JSON.stringify(data));
    return { ok: false, messageId: null, error: `Brevo ${res.status}: ${JSON.stringify(data)}` };
  } catch (err) {
    console.warn(`Brevo exception for ${to}:`, err);
    return { ok: false, messageId: null, error: `Brevo exception: ${err}` };
  }
}

async function sendViaEgoi(to: string, subject: string, html: string): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  const apiKey = Deno.env.get("EGOI_API_KEY");
  if (!apiKey) return { ok: false, messageId: null, error: "EGOI_API_KEY not configured" };

  try {
    const res = await fetch("https://slingshot.egoiapp.com/api/v2/email/messages/action/send/single", {
      method: "POST",
      headers: {
        "ApiKey": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: EGOI_DOMAIN,
        senderId: EGOI_SENDER_ID,
        senderName: EGOI_SENDER_NAME,
        to: to,
        subject,
        htmlBody: html,
        openTracking: true,
        clickTracking: true,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      const messageId = data?.messageId || data?.id || null;
      console.log(`E-goi sent to ${to}: ${messageId}`);
      return { ok: true, messageId };
    }

    console.warn(`E-goi failed (${res.status}) for ${to}:`, JSON.stringify(data));
    return { ok: false, messageId: null, error: `E-goi ${res.status}: ${JSON.stringify(data)}` };
  } catch (err) {
    console.warn(`E-goi exception for ${to}:`, err);
    return { ok: false, messageId: null, error: `E-goi exception: ${err}` };
  }
}

async function sendViaResend(to: string, subject: string, html: string, from: string): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return { ok: false, messageId: null, error: "RESEND_API_KEY not configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.log(`Resend sent to ${to}: ${data.id}`);
      return { ok: true, messageId: data.id || null };
    }

    console.warn(`Resend failed (${res.status}) for ${to}:`, JSON.stringify(data));
    return { ok: false, messageId: null, error: `Resend ${res.status}: ${JSON.stringify(data)}` };
  } catch (err) {
    console.warn(`Resend exception for ${to}:`, err);
    return { ok: false, messageId: null, error: `Resend exception: ${err}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: service role key OR cron secret
    const authDb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!await authorizedDelivery(req, authDb, key => Deno.env.get(key))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SendEmailRequest = await req.json();
    const { to, subject, html, from } = body;

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject, html" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromAddress = from || DEFAULT_FROM;

    // Try Brevo first
    const brevoResult = await sendViaBrevo(to, subject, html);
    if (brevoResult.ok) {
      const response: SendEmailResponse = {
        success: true,
        provider: "brevo",
        messageId: brevoResult.messageId,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback 1: Resend
    console.log(`Brevo failed, falling back to Resend for ${to}`);
    const resendResult = await sendViaResend(to, subject, html, fromAddress);
    if (resendResult.ok) {
      const response: SendEmailResponse = {
        success: true,
        provider: "resend",
        messageId: resendResult.messageId,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback 2: E-goi
    console.log(`Resend failed, falling back to E-goi for ${to}`);
    const egoiResult = await sendViaEgoi(to, subject, html);

    const response: SendEmailResponse = {
      success: egoiResult.ok,
      provider: "egoi",
      messageId: egoiResult.messageId,
      error: egoiResult.ok ? undefined : egoiResult.error,
    };

    return new Response(JSON.stringify(response), {
      status: egoiResult.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("send-email error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
