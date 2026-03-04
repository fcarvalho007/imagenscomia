import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EGOI_SENDER_ID = 2;
const EGOI_DOMAIN = "digitalfc.pt";
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
  provider: "egoi" | "resend";
  messageId: string | null;
  error?: string;
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
        to: [to],
        subject,
        htmlBody: html,
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
    // Auth: only allow service role or internal calls
    const authHeader = req.headers.get("authorization") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "__none__";
    if (!authHeader.includes(serviceRoleKey)) {
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

    // Try E-goi first
    const egoiResult = await sendViaEgoi(to, subject, html);
    if (egoiResult.ok) {
      const response: SendEmailResponse = {
        success: true,
        provider: "egoi",
        messageId: egoiResult.messageId,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback to Resend
    console.log(`E-goi failed, falling back to Resend for ${to}`);
    const resendResult = await sendViaResend(to, subject, html, fromAddress);

    const response: SendEmailResponse = {
      success: resendResult.ok,
      provider: "resend",
      messageId: resendResult.messageId,
      error: resendResult.ok ? undefined : resendResult.error,
    };

    return new Response(JSON.stringify(response), {
      status: resendResult.ok ? 200 : 502,
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
