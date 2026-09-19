import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleAccessLink, type AccessLinkRegistration } from "./handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_FROM = "Frederico Carvalho <frederico.carvalho@digitalfc.pt>";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const payload = await req.json().catch(() => ({}));

    const result = await handleAccessLink(payload, {
      origin: Deno.env.get("PUBLIC_SITE_URL") || "https://imagenscomia.com",
      findRegistration: async (email, webinar): Promise<AccessLinkRegistration | null> => {
        const { data } = await supabase
          .from("registrations")
          .select("id, email, first_name, edit_token")
          .eq("email", email)
          .eq("webinar", webinar)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return (data as AccessLinkRegistration | null) ?? null;
      },
      claim: async (registrationId, destination) => {
        const { data, error } = await supabase.rpc("legacy_access_link_claim", {
          p_registration_id: registrationId,
          p_destination: destination,
        });
        if (error) {
          console.error("access-link claim failed:", error.message);
          return false;
        }
        return data === true;
      },
      sendEmail: async (to, subject, html) => {
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (!resendKey) {
          console.error("RESEND_API_KEY not configured");
          return false;
        }
        const from = Deno.env.get("COURSE_EMAIL_FROM") || DEFAULT_FROM;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [to], subject, html }),
        });
        if (!res.ok) {
          console.error(`Resend failed with status ${res.status}`);
          return false;
        }
        return true;
      },
      log: (message) => console.log(message),
    });

    return new Response(result.body, {
      status: result.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("legacy-access-link error:", error instanceof Error ? error.message : "unknown");
    return new Response(JSON.stringify({ error: "Erro inesperado." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
