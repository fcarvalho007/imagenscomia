import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

// ── Constants ──
const MODAL_LAUNCH_AT = "2026-02-15T18:00:00Z";
const EVENT_DATE = "2026-02-18T10:00:00Z";
const FINAL_EMAIL_AT = "2026-02-17T16:00:00Z"; // T-18h before event

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

const BACKLOG_THRESHOLD_MS = 36 * 60 * 60 * 1000; // 36 hours

type Segment = "recent" | "warm" | "backlog" | "weak_backlog";

function classifySegment(reg: any, nowMs: number): Segment {
  const intentTime = reg.upgrade_clicked_at || reg.created_at;
  if (!intentTime) return "weak_backlog";
  const ageMs = nowMs - new Date(intentTime).getTime();

  if (ageMs < 12 * 60 * 60 * 1000) return "recent";
  if (ageMs < BACKLOG_THRESHOLD_MS) return "warm";
  // 36h+ → check signal strength
  if (reg.upgrade_clicked_at) return "backlog";
  return "weak_backlog";
}

function replacePlaceholders(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(`{{${key}}}`).join(value);
  }
  return result;
}

async function validateLink(url: string): Promise<boolean> {
  if (!url || !url.startsWith("https://")) return false;
  const trimmed = url.trim();
  if (trimmed.length < 30 || trimmed !== url) return false;
  try {
    const res = await fetch(trimmed, { method: "HEAD", redirect: "follow" });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function refreshPaymentLink(
  reg: any,
  supabase: any,
  EUPAGO_API_KEY: string,
  supabaseUrl: string,
  nowMs: number,
  stage: number,
  forceRefresh = false,
): Promise<string | null> {
  const plan = reg.plan_selected || "premium";
  const product = PRODUCTS[plan] || PRODUCTS.premium;
  const linkAge = reg.payment_link_created_at
    ? nowMs - new Date(reg.payment_link_created_at).getTime()
    : Infinity;

  if (!forceRefresh && reg.last_payment_link && linkAge <= 12 * 60 * 60 * 1000) {
    return reg.last_payment_link;
  }

  const origin = "https://imagenscomia.lovable.app";
  try {
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
      const paymentLink = linkData.url || linkData.redirectUrl || linkData.paymentLink || linkData.payment_url;
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
      return paymentLink;
    } else {
      console.error(`Failed to create payment link for ${reg.email}:`, JSON.stringify(linkData));
      return null;
    }
  } catch (linkErr) {
    console.error(`Payment link error for ${reg.email}:`, linkErr);
    return null;
  }
}

async function sendEmail(
  reg: any,
  templateKey: string,
  paymentLink: string,
  supabase: any,
  RESEND_API_KEY: string,
): Promise<{ success: boolean; messageId: string | null; error: string | null }> {
  // Load template
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
    return { success: false, messageId: null, error: "template_missing" };
  }

  const tpl = tplRows[0];
  const plan = reg.plan_selected || "premium";
  const product = PRODUCTS[plan] || PRODUCTS.premium;
  const firstName = reg.first_name || (reg.name || "").split(" ")[0] || "participante";

  const templateVars: Record<string, string> = {
    name: firstName,
    payment_link: paymentLink,
    plan_selected: product.label,
    support_whatsapp: "915 015 508",
    webinar_date: "18 Fev 2026 · 10h00",
  };

  // Validate required variables
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
    return { success: false, messageId: null, error: `missing_variable:${missingVar}` };
  }

  const emailSubject = replacePlaceholders(tpl.subject, templateVars);
  const emailBody = tpl.html_body
    ? replacePlaceholders(tpl.html_body, templateVars)
    : tpl.text_body
      ? replacePlaceholders(tpl.text_body, templateVars)
      : null;

  if (!emailBody) {
    console.error(`Template ${templateKey} has no body content`);
    return { success: false, messageId: null, error: "template_empty_body" };
  }

  // Insert queued log with payment_url
  const { data: logRow, error: logError } = await supabase
    .from("message_logs")
    .insert({
      registration_id: reg.id,
      channel: "email",
      provider: "resend",
      template_key: templateKey,
      status: "queued",
      payment_url: paymentLink || null,
    } as any)
    .select("id")
    .single();

  if (logError) {
    console.error(`message_logs error for ${reg.email}:`, logError);
    return { success: false, messageId: null, error: "log_insert_failed" };
  }

  console.log(`📧 [${templateKey}] Prepared email for ${reg.email}: "${emailSubject}"`);

  // Send via Resend
  try {
    const resendPayload: Record<string, unknown> = {
      from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>",
      to: [reg.email],
      subject: emailSubject,
    };

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
      await supabase.from("message_logs").update({
        status: "sent",
        provider_message_id: resendData.id,
        payment_url: paymentLink || null,
        updated_at: new Date().toISOString(),
      } as any).eq("id", logRow.id);
      console.log(`✅ Resend sent for ${reg.email}, id=${resendData.id}`);
      return { success: true, messageId: resendData.id, error: null };
    } else {
      const sendError = JSON.stringify(resendData);
      await supabase.from("message_logs").update({
        status: "failed",
        error: sendError,
        updated_at: new Date().toISOString(),
      }).eq("id", logRow.id);
      console.error(`❌ Resend error for ${reg.email}:`, sendError);
      return { success: false, messageId: null, error: sendError };
    }
  } catch (err) {
    const sendError = err instanceof Error ? err.message : "Resend fetch error";
    await supabase.from("message_logs").update({
      status: "failed",
      error: sendError,
      updated_at: new Date().toISOString(),
    }).eq("id", logRow.id);
    console.error(`❌ Resend exception for ${reg.email}:`, sendError);
    return { success: false, messageId: null, error: sendError };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Parse body first to detect manual mode ──
  let manualMode: { registrationId: string; templateKey: string } | null = null;
  let bodyParsed = false;
  try {
    const body = await req.clone().json();
    bodyParsed = true;
    if (body?.mode === "manual_send" && body?.registration_id && body?.template_key) {
      manualMode = { registrationId: body.registration_id, templateKey: body.template_key };
    }
  } catch { /* not JSON, normal cron mode */ }

  // ── Auth guard ──
  const cronSecret = Deno.env.get("CRON_SECRET");
  const requestSecret = req.headers.get("x-cron-secret");
  const hasCronSecret = cronSecret && requestSecret === cronSecret;

  if (manualMode) {
    // Manual mode: accept cron secret OR anon key (the function is called via supabase.functions.invoke which sends the anon key)
    // Since verify_jwt=false, we just check that it's a manual mode call with valid body
    // The CRM is password-protected client-side
    if (!hasCronSecret) {
      // Accept if Authorization header has a Bearer token (anon key from client)
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
  } else {
    // Cron mode: require cron secret
    if (!hasCronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const runId = `run-${Date.now()}`;
    console.log(`[followup-abandoned] ${runId} started, source=${manualMode ? "manual" : "cron"}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    const summary = {
      processed: 0, sent: 0, skipped: 0, errors: 0,
      segments: { recent: 0, warm: 0, backlog: 0, weak_backlog: 0 },
      backlog_checkins: 0,
      final_emails: 0,
    };

    // ── Manual send mode ──
    if (manualMode) {
      const { data: reg, error: regErr } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", manualMode.registrationId)
        .single();

      if (regErr || !reg) {
        return new Response(JSON.stringify({ error: "Registration not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (reg.do_not_contact) {
        return new Response(JSON.stringify({ error: "do_not_contact is true" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Idempotency check
      const { data: existing } = await supabase
        .from("message_logs")
        .select("id")
        .eq("registration_id", reg.id)
        .eq("template_key", manualMode.templateKey)
        .limit(1);

      if (existing && existing.length > 0 && manualMode.templateKey !== "reminder_manual") {
        return new Response(JSON.stringify({ error: "already_sent", template_key: manualMode.templateKey }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Ensure payment link
      let paymentLink = reg.last_payment_link;
      if (!paymentLink && EUPAGO_API_KEY) {
        paymentLink = await refreshPaymentLink(reg, supabase, EUPAGO_API_KEY, supabaseUrl, now, 0);
      }
      // Validate link before manual send
      if (paymentLink && !(await validateLink(paymentLink))) {
        if (EUPAGO_API_KEY) {
          paymentLink = await refreshPaymentLink(reg, supabase, EUPAGO_API_KEY, supabaseUrl, now, 0, true);
        }
      }
      if (!paymentLink) {
        return new Response(JSON.stringify({ error: "no_payment_link" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await sendEmail(reg, manualMode.templateKey, paymentLink, supabase, RESEND_API_KEY);
      return new Response(JSON.stringify({ ...result, registration_id: reg.id, template_key: manualMode.templateKey }), {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Normal cron mode ──
    const { data: candidates, error: fetchError } = await supabase
      .from("registrations")
      .select("id, email, name, first_name, plan_selected, eupago_ref, upgrade_clicked_at, created_at, followup_stage, last_followup_at, last_payment_link, payment_link_created_at, do_not_contact, paid_at, next_followup_at")
      .is("paid_at", null)
      .eq("do_not_contact", false)
      .not("plan_selected", "is", null)
      .neq("plan_selected", "free");

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error("Failed to fetch candidates");
    }

    if (!candidates || candidates.length === 0) {
      console.log(`[followup-abandoned] ${runId} complete: no candidates found`);
      return new Response(JSON.stringify({ ...summary, message: "No candidates" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[followup-abandoned] ${runId} candidates_found=${candidates.length}`);

    const isFinalTime = now >= new Date(FINAL_EMAIL_AT).getTime();
    const isBeforeEvent = now < new Date(EVENT_DATE).getTime();

    for (const reg of candidates) {
      summary.processed++;
      const segment = classifySegment(reg, now);
      summary.segments[segment]++;

      const stage = reg.followup_stage || 0;

      // ── TRACK A: Normal stage flow (for all segments, stages 0-2) ──
      if (stage < 3) {
        const triggerTime = reg.upgrade_clicked_at || reg.created_at;
        if (triggerTime) {
          let eligibleAfter: number;
          if (stage === 0) {
            eligibleAfter = new Date(triggerTime).getTime() + STAGE_DELAYS_MS[0];
          } else {
            const lastFollowup = reg.last_followup_at || triggerTime;
            eligibleAfter = new Date(lastFollowup).getTime() + STAGE_DELAYS_MS[stage];
          }

          if (now >= eligibleAfter) {
            const templateKey = `followup_stage_${stage}`;
            // Idempotency check
            const { data: existingLog } = await supabase
              .from("message_logs")
              .select("id")
              .eq("registration_id", reg.id)
              .eq("template_key", templateKey)
              .limit(1);

            if (!existingLog || existingLog.length === 0) {
              // Ensure payment link
              let paymentLink = reg.last_payment_link;
              const linkAge = reg.payment_link_created_at
                ? now - new Date(reg.payment_link_created_at).getTime()
                : Infinity;

              if ((!paymentLink || linkAge > 12 * 60 * 60 * 1000) && EUPAGO_API_KEY) {
                paymentLink = await refreshPaymentLink(reg, supabase, EUPAGO_API_KEY, supabaseUrl, now, stage);
              }

              // Validate link health before sending
              if (paymentLink && !(await validateLink(paymentLink))) {
                console.warn(`⚠️ Link failed validation for ${reg.email}, regenerating...`);
                if (EUPAGO_API_KEY) {
                  paymentLink = await refreshPaymentLink(reg, supabase, EUPAGO_API_KEY, supabaseUrl, now, stage, true);
                }
                if (!paymentLink || !(await validateLink(paymentLink))) {
                  console.error(`❌ Link validation failed after regeneration for ${reg.email}`);
                  await supabase.from("message_logs").insert({
                    registration_id: reg.id,
                    channel: "email",
                    provider: "resend",
                    template_key: templateKey,
                    status: "failed",
                    error: "link_validation_failed",
                    payment_url: paymentLink || null,
                  } as any);
                  summary.errors++;
                  continue;
                }
              }
              if (paymentLink) {
                const result = await sendEmail(reg, templateKey, paymentLink, supabase, RESEND_API_KEY);
                if (result.success) {
                  // Compute next_followup_at
                  let nextFollowupAt: string | null = null;
                  if (stage + 1 < 3) {
                    nextFollowupAt = new Date(now + STAGE_DELAYS_MS[stage + 1]).toISOString();
                  }
                  await supabase.from("registrations").update({
                    followup_stage: stage + 1,
                    last_followup_at: new Date().toISOString(),
                    next_followup_at: nextFollowupAt,
                    last_payment_link_sent_at: new Date().toISOString(),
                  }).eq("id", reg.id);
                  summary.sent++;
                  continue; // Move to next candidate (sent stage email)
                } else {
                  summary.errors++;
                  continue;
                }
              } else {
                if (!EUPAGO_API_KEY) {
                  console.warn("No EUPAGO_API_KEY — cannot refresh payment link");
                }
                summary.errors++;
                continue;
              }
            }
          }
        }
      }

      // ── TRACK B: Backlog check-in (parallel, for 36h+ candidates) ──
      if ((segment === "backlog" || segment === "weak_backlog") && isBeforeEvent) {
        const backlogTemplateKey = segment === "backlog"
          ? "followup_backlog_checkin"
          : "followup_backlog_weak";

        const { data: existingBacklog } = await supabase
          .from("message_logs")
          .select("id")
          .eq("registration_id", reg.id)
          .eq("template_key", backlogTemplateKey)
          .limit(1);

        if (!existingBacklog || existingBacklog.length === 0) {
          let paymentLink = reg.last_payment_link;
          if (!paymentLink && EUPAGO_API_KEY) {
            paymentLink = await refreshPaymentLink(reg, supabase, EUPAGO_API_KEY, supabaseUrl, now, 0);
          }
          if (paymentLink && !(await validateLink(paymentLink)) && EUPAGO_API_KEY) {
            paymentLink = await refreshPaymentLink(reg, supabase, EUPAGO_API_KEY, supabaseUrl, now, 0, true);
          }
          if (paymentLink) {
            const result = await sendEmail(reg, backlogTemplateKey, paymentLink, supabase, RESEND_API_KEY);
            if (result.success) {
              summary.backlog_checkins++;
              summary.sent++;
              continue;
            } else {
              summary.errors++;
              continue;
            }
          }
        }
      }

      // ── TRACK C: Final before event (for ALL unpaid with intent, at T-18h) ──
      if (isFinalTime && isBeforeEvent) {
        const { data: existingFinal } = await supabase
          .from("message_logs")
          .select("id")
          .eq("registration_id", reg.id)
          .eq("template_key", "followup_final_before_event")
          .limit(1);

        if (!existingFinal || existingFinal.length === 0) {
          let paymentLink = reg.last_payment_link;
          if (!paymentLink && EUPAGO_API_KEY) {
            paymentLink = await refreshPaymentLink(reg, supabase, EUPAGO_API_KEY, supabaseUrl, now, 0);
          }
          if (paymentLink && !(await validateLink(paymentLink)) && EUPAGO_API_KEY) {
            paymentLink = await refreshPaymentLink(reg, supabase, EUPAGO_API_KEY, supabaseUrl, now, 0, true);
          }
          if (paymentLink) {
            const result = await sendEmail(reg, "followup_final_before_event", paymentLink, supabase, RESEND_API_KEY);
            if (result.success) {
              summary.final_emails++;
              summary.sent++;
              continue;
            } else {
              summary.errors++;
              continue;
            }
          }
        }
      }

      summary.skipped++;
    }

    console.log(`[followup-abandoned] ${runId} complete:`, JSON.stringify(summary));

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
