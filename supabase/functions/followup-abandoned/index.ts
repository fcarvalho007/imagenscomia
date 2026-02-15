import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const PRODUCTS: Record<string, { value: number; identifier: string; label: string }> = {
  premium: { value: 18.45, identifier: "WEBINAR-PREMIUM", label: "Premium Pass (15+IVA)" },
  masterclass: { value: 57.81, identifier: "WEBINAR-MASTERCLASS", label: "Masterclass IA Vídeo (47+IVA)" },
  bundle: { value: 76.26, identifier: "WEBINAR-BUNDLE", label: "Premium Pass (15+IVA) + Masterclass IA Vídeo (47+IVA)" },
};

const STAGE_DELAYS_MS = [
  30 * 60 * 1000,       // stage 0: 30 min
  6 * 60 * 60 * 1000,   // stage 1: 6 hours
  24 * 60 * 60 * 1000,  // stage 2: 24 hours
];

function replacePlaceholders(
  text: string,
  vars: Record<string, string>,
): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(`{{${key}}}`).join(value);
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Cron secret guard ──
  const cronSecret = Deno.env.get("CRON_SECRET");
  const requestSecret = req.headers.get("x-cron-secret");
  if (!cronSecret || requestSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const now = Date.now();
    const summary = { processed: 0, sent: 0, skipped: 0, errors: 0 };

    const { data: candidates, error: fetchError } = await supabase
      .from("registrations")
      .select("id, email, name, first_name, plan_selected, eupago_ref, upgrade_clicked_at, created_at, followup_stage, last_followup_at, last_payment_link, payment_link_created_at, do_not_contact, paid_at, next_followup_at")
      .is("paid_at", null)
      .eq("do_not_contact", false)
      .lt("followup_stage", 3)
      .not("plan_selected", "is", null)
      .neq("plan_selected", "free");

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error("Failed to fetch candidates");
    }

    if (!candidates || candidates.length === 0) {
      console.log("No follow-up candidates found.");
      return new Response(JSON.stringify({ ...summary, message: "No candidates" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const reg of candidates) {
      summary.processed++;
      const stage = reg.followup_stage || 0;

      if (stage >= 3) {
        summary.skipped++;
        continue;
      }

      const triggerTime = reg.upgrade_clicked_at || reg.created_at;
      if (!triggerTime) {
        summary.skipped++;
        continue;
      }

      let eligibleAfter: number;
      if (stage === 0) {
        eligibleAfter = new Date(triggerTime).getTime() + STAGE_DELAYS_MS[0];
      } else {
        const lastFollowup = reg.last_followup_at || triggerTime;
        eligibleAfter = new Date(lastFollowup).getTime() + STAGE_DELAYS_MS[stage];
      }

      if (now < eligibleAfter) {
        summary.skipped++;
        continue;
      }

      // Idempotency: check if this stage was already sent
      const templateKey = `followup_stage_${stage}`;
      const { data: existingLog } = await supabase
        .from("message_logs")
        .select("id")
        .eq("registration_id", reg.id)
        .eq("template_key", templateKey)
        .limit(1);

      if (existingLog && existingLog.length > 0) {
        summary.skipped++;
        continue;
      }

      // ── Load template from DB ──
      const { data: tplRows, error: tplError } = await supabase
        .from("email_templates")
        .select("subject, text_body, html_body, variables")
        .eq("template_key", templateKey)
        .eq("is_active", true)
        .limit(1);

      if (tplError || !tplRows || tplRows.length === 0) {
        console.error(`Template missing or inactive: ${templateKey}`);
        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          channel: "email",
          provider: "resend",
          template_key: templateKey,
          status: "failed",
          error: "template_missing",
        });
        summary.errors++;
        continue;
      }

      const tpl = tplRows[0];

      const plan = reg.plan_selected || "premium";
      const product = PRODUCTS[plan] || PRODUCTS.premium;

      // Refresh payment link if missing or old (>48h)
      let paymentLink = reg.last_payment_link;
      const linkAge = reg.payment_link_created_at
        ? now - new Date(reg.payment_link_created_at).getTime()
        : Infinity;

      if (!paymentLink || linkAge > 48 * 60 * 60 * 1000) {
        if (EUPAGO_API_KEY) {
          try {
            const origin = "https://imagenscomia.lovable.app";
            const eupagoRes = await fetch("https://clientes.eupago.pt/api/v1.02/paybylink/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `ApiKey ${EUPAGO_API_KEY}`,
              },
              body: JSON.stringify({
                payment: {
                  amount: { value: product.value, currency: "EUR" },
                  identifier: `${product.identifier}-${reg.email}-${Date.now()}`,
                  successUrl: `${origin}/confirmacao?plan=${plan}&email=${encodeURIComponent(reg.email)}`,
                  failUrl: `${origin}/?payment=failed`,
                  backUrl: `${origin}/upgrade`,
                  lang: "PT",
                  methods: ["CC", "MBWAY", "MB"],
                  callbackUrl: `${supabaseUrl}/functions/v1/eupago-webhook`,
                },
                customer: { notify: false, email: reg.email },
              }),
            });

            const linkData = await eupagoRes.json();
            if (eupagoRes.ok && linkData.transactionStatus === "Success") {
              paymentLink = linkData.url || linkData.redirectUrl || linkData.paymentLink || linkData.payment_url;
              const txId = linkData.transactionID || linkData.transaction_id || linkData.id;

              await supabase.from("registrations").update({
                eupago_ref: txId,
                last_payment_link: paymentLink,
                payment_link_created_at: new Date().toISOString(),
              }).eq("id", reg.id);

              await supabase.from("payment_events").insert({
                registration_id: reg.id,
                event_type: "link_created",
                eupago_ref: txId,
                idempotency_key: `followup-link-${reg.id}-${stage}-${Date.now()}`,
                payload: { plan, source: "followup-abandoned", stage },
              });

              console.log(`🔗 Refreshed payment link for ${reg.email}`);
            } else {
              console.error(`Failed to create payment link for ${reg.email}:`, JSON.stringify(linkData));
              summary.errors++;
              continue;
            }
          } catch (linkErr) {
            console.error(`Payment link error for ${reg.email}:`, linkErr);
            summary.errors++;
            continue;
          }
        } else {
          console.warn("No EUPAGO_API_KEY — cannot refresh payment link");
          summary.skipped++;
          continue;
        }
      }

      // Insert message_log as queued
      const { data: logRow, error: logError } = await supabase
        .from("message_logs")
        .insert({
          registration_id: reg.id,
          channel: "email",
          provider: "resend",
          template_key: templateKey,
          status: "queued",
        })
        .select("id")
        .single();

      if (logError) {
        console.error(`message_logs error for ${reg.email}:`, logError);
        summary.errors++;
        continue;
      }

      // ── Build email content from DB template ──
      const firstName = reg.first_name || (reg.name || "").split(" ")[0] || "participante";
      const templateVars: Record<string, string> = {
        name: firstName,
        payment_link: paymentLink!,
        plan_selected: product.label,
        support_whatsapp: "915 015 508",
        webinar_date: "18 Fev 2026 · 10h00",
      };

      // Validate required variables from template
      const requiredVars: string[] = Array.isArray(tpl.variables) ? tpl.variables : [];
      const missingVar = requiredVars.find((v: string) => !templateVars[v]);
      if (missingVar) {
        console.error(`Missing variable '${missingVar}' for ${reg.email}`);
        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          channel: "email",
          provider: "resend",
          template_key: templateKey,
          status: "failed",
          error: `missing_variable:${missingVar}`,
        });
        summary.errors++;
        continue;
      }

      const emailSubject = replacePlaceholders(tpl.subject, templateVars);
      const emailBody = tpl.html_body
        ? replacePlaceholders(tpl.html_body, templateVars)
        : tpl.text_body
          ? replacePlaceholders(tpl.text_body, templateVars)
          : null;

      if (!emailBody) {
        console.error(`Template ${templateKey} has no body content`);
        await supabase.from("message_logs").update({
          status: "failed",
          error: "template_empty_body",
          updated_at: new Date().toISOString(),
        }).eq("id", logRow.id);
        summary.errors++;
        continue;
      }

      console.log(`📧 [Stage ${stage}] Prepared email for ${reg.email}: "${emailSubject}"`);

      // ── Send via Resend ──
      let sendSuccess = false;
      let providerMessageId: string | null = null;
      let sendError: string | null = null;

      if (RESEND_API_KEY) {
        try {
          const resendPayload: Record<string, unknown> = {
            from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>",
            to: [reg.email],
            subject: emailSubject,
          };

          // Send as HTML if html_body exists, otherwise as text
          if (tpl.html_body) {
            resendPayload.html = emailBody;
          } else {
            resendPayload.text = emailBody;
          }

          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify(resendPayload),
          });

          const resendData = await resendRes.json();

          if (resendRes.ok && resendData.id) {
            sendSuccess = true;
            providerMessageId = resendData.id;
            console.log(`✅ Resend sent for ${reg.email}, id=${resendData.id}`);
          } else {
            sendError = JSON.stringify(resendData);
            console.error(`❌ Resend error for ${reg.email}:`, sendError);
          }
        } catch (err) {
          sendError = err instanceof Error ? err.message : "Resend fetch error";
          console.error(`❌ Resend exception for ${reg.email}:`, sendError);
        }
      } else {
        sendError = "RESEND_API_KEY not configured";
        console.warn(sendError);
      }

      // Update message_logs with result
      await supabase.from("message_logs")
        .update({
          status: sendSuccess ? "sent" : "failed",
          provider_message_id: providerMessageId,
          error: sendError,
          updated_at: new Date().toISOString(),
        })
        .eq("id", logRow.id);

      if (!sendSuccess) {
        summary.errors++;
        continue;
      }

      // Compute next_followup_at
      let nextFollowupAt: string | null = null;
      if (stage + 1 < 3) {
        const nextDelay = STAGE_DELAYS_MS[stage + 1];
        nextFollowupAt = new Date(now + nextDelay).toISOString();
      }

      // Update registration
      await supabase.from("registrations").update({
        followup_stage: stage + 1,
        last_followup_at: new Date().toISOString(),
        next_followup_at: nextFollowupAt,
        last_payment_link_sent_at: new Date().toISOString(),
      }).eq("id", reg.id);

      summary.sent++;
    }

    console.log(`Follow-up summary:`, JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("followup-abandoned error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
