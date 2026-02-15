import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRODUCTS: Record<string, { value: number; identifier: string; label: string }> = {
  premium: { value: 18.45, identifier: "WEBINAR-PREMIUM", label: "Premium Pass (15+IVA)" },
  masterclass: { value: 57.81, identifier: "WEBINAR-MASTERCLASS", label: "Masterclass IA Vídeo (47+IVA)" },
  bundle: { value: 76.26, identifier: "WEBINAR-BUNDLE", label: "Premium Pass (15+IVA) + Masterclass IA Vídeo (47+IVA)" },
};

// Schedule: delays from the trigger point (upgrade_clicked_at or created_at)
const STAGE_DELAYS_MS = [
  30 * 60 * 1000,       // stage 0: 30 min
  6 * 60 * 60 * 1000,   // stage 1: 6 hours after last followup
  24 * 60 * 60 * 1000,  // stage 2: 24 hours after last followup
];

const STAGE_TEMPLATES = [
  {
    key: "followup_stage_0",
    subject: (name: string, label: string) => `${name}, faltou um passo para o teu ${label}`,
    body: (firstName: string, label: string, link: string, value: string) =>
      `Olá ${firstName},\n\nVi que escolheste o ${label} mas o pagamento ficou pendente.\n\nAqui está o link para concluíres:\n${link}\n\nValor total (c/ IVA): ${value}€\nMétodos: MB WAY, Multibanco\n\nQualquer dúvida, responde a este email.\n\nFrederico Carvalho`,
  },
  {
    key: "followup_stage_1",
    subject: (name: string, label: string) => `O teu ${label} ainda está à espera, ${name}`,
    body: (firstName: string, label: string, link: string, value: string) =>
      `Olá ${firstName},\n\nO teu lugar no ${label} continua reservado, mas o pagamento ainda não foi concluído.\n\nConclui aqui:\n${link}\n\nValor: ${value}€ (c/ IVA)\n\nSe tiveres questões, responde a este email.\n\nFrederico Carvalho`,
  },
  {
    key: "followup_stage_2",
    subject: (name: string, label: string) => `Última oportunidade — ${label}`,
    body: (firstName: string, label: string, link: string, value: string) =>
      `Olá ${firstName},\n\nEste é o último lembrete sobre o teu ${label}. O webinar é já dia 18 de Fevereiro.\n\nLink de pagamento:\n${link}\n\nValor: ${value}€ (c/ IVA)\n\nDepois deste email não envio mais lembretes.\n\nFrederico Carvalho`,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const EUPAGO_API_KEY = Deno.env.get("EUPAGO_API_KEY");

    const now = Date.now();
    const summary = { processed: 0, sent: 0, skipped: 0, errors: 0 };

    // Fetch candidates for follow-up
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

      // Check timing eligibility
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
                  successUrl: `${origin}/confirmacao?plan=${plan}`,
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

              // Log payment event
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
          provider: "internal",
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

      // Build email content
      const template = STAGE_TEMPLATES[stage];
      const firstName = reg.first_name || (reg.name || "").split(" ")[0] || "participante";
      const displayValue = product.value.toFixed(2).replace(".", ",");
      const emailSubject = template.subject(firstName, product.label);
      const emailBody = template.body(firstName, product.label, paymentLink!, displayValue);

      console.log(`📧 [Stage ${stage}] Prepared email for ${reg.email}: "${emailSubject}"`);

      // For now: mark as sent (internal = prepared for manual or future automated send)
      await supabase.from("message_logs")
        .update({ status: "sent", updated_at: new Date().toISOString() })
        .eq("id", logRow.id);

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
