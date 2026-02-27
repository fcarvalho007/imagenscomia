import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentData {
  transactionStatus: string;
  reference: string;
  amount: string;
  identifier: string;
  paymentMethod: string;
  transactionID: string;
}

function extractFromGET(req: Request): PaymentData {
  const url = new URL(req.url);
  const p = url.searchParams;
  return {
    transactionStatus: "Success",
    reference: p.get("referencia") || "",
    amount: p.get("valor") || "",
    identifier: p.get("identificador") || "",
    paymentMethod: p.get("canal") || "",
    transactionID: p.get("transacao") || "",
  };
}

async function extractFromPOST(req: Request): Promise<PaymentData> {
  const body = await req.json();
  return {
    transactionStatus: body.transactionStatus || "",
    reference: body.reference || "",
    amount: body.amount || "",
    identifier: body.identifier || "",
    paymentMethod: body.paymentMethod || "",
    transactionID: body.transactionID || body.transaction_id || "",
  };
}

async function processPayment(data: PaymentData) {
  const { transactionStatus, reference, amount, identifier, paymentMethod, transactionID } = data;

  console.log(`EuPago webhook: status=${transactionStatus}, ref=${reference}, amount=${amount}, method=${paymentMethod}, id=${identifier}, txID=${transactionID}`);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // --- Idempotent audit log: insert webhook event ---
  const idempotencyKey = `webhook-${transactionID || "none"}-${reference || "none"}`;
  const { error: eventError } = await supabase.from("payment_events").insert({
    event_type: "webhook_received",
    eupago_ref: transactionID || reference || null,
    idempotency_key: idempotencyKey,
    payload: data,
  });

  if (eventError) {
    if (eventError.code === "23505") {
      console.log(`⚡ Duplicate webhook ignored (idempotency_key=${idempotencyKey})`);
      return;
    }
    console.warn("payment_events insert warning:", eventError.message);
  }

  if (transactionStatus !== "Success") {
    console.log(`⚠️ Payment status: ${transactionStatus}, ref=${reference}`);
    return;
  }

  console.log(`✅ Payment confirmed: ref=${reference}, amount=${amount}, method=${paymentMethod}, id=${identifier}, txID=${transactionID}`);

  let matched = false;
  let matchedRegId: string | null = null;

  // ── Strategy 1 (DIAGNOSTIC ONLY) ──────────────────────────────────────────
  // NOTE: The EuPago `transactionID` in the webhook is a short numeric ID
  // (e.g. "61611445"), while `eupago_ref` stored at link-creation time is a
  // 32-char UUID (e.g. "09acb60ac5d4433598b3176e1d76fb80"). They are DIFFERENT
  // fields from EuPago and will NEVER match each other. This strategy only
  // records the numeric transactionID in the dedicated audit column and logs
  // the mismatch for visibility. The actual paid_at update is Strategy 2.
  if (transactionID) {
    const { data: diagRows } = await supabase
      .from("registrations")
      .select("id, email, eupago_ref")
      .eq("eupago_ref", transactionID)
      .maybeSingle();

    if (diagRows) {
      // Rare case: a previous run stored the numeric ID in eupago_ref
      console.log(`ℹ️ Strategy 1 (diag): found row by eupago_ref match — email=${diagRows.email}`);
    } else {
      console.log(`ℹ️ Strategy 1 (diag): no eupago_ref match for txID=${transactionID} (expected — UUID vs numeric ID difference)`);
    }
  }

  // ── Strategy 2 (PRIMARY) — match by order_id in identifier ────────────────
  // Identifier format: "ORDER-{12-char-order_id}-{name}"
  // The order_id is always the first segment after "ORDER-" (12 hex chars).
  // The name can contain hyphens, spaces, accents — .split("-")[0] is safe.
  if (!matched && identifier && identifier.startsWith("ORDER-")) {
    const oid = identifier.replace("ORDER-", "").split("-")[0];
    console.log(`🔎 Strategy 2: extracted order_id="${oid}" from identifier="${identifier}"`);

    if (oid && oid.length === 12) {
      const { data: updatedRows, error } = await supabase
        .from("registrations")
        .update({
          paid_at: new Date().toISOString(),
          eupago_ref: reference || transactionID,
          eupago_transaction_id: transactionID || null,
        })
        .eq("order_id", oid)
        .select("id, email");

      if (!error && updatedRows && updatedRows.length > 0) {
        console.log(`✅ Strategy 2: matched by order_id="${oid}" — email=${updatedRows[0].email}`);
        matched = true;
        matchedRegId = updatedRows[0].id;
      } else {
        console.warn(`⚠️ Strategy 2: no match for order_id="${oid}"`, error?.message || "");
      }
    } else {
      console.warn(`⚠️ Strategy 2: extracted order_id="${oid}" has unexpected length — skipping`);
    }
  }

  // ── Strategy 3 (LEGACY FALLBACK) — extract email from identifier ──────────
  // Handles identifiers from before the ORDER-{order_id}-{name} format.
  if (!matched && identifier && !identifier.startsWith("ORDER-")) {
    const parts = identifier.split("-");
    let email = "";
    if (parts.length >= 4) {
      email = parts.slice(2, -1).join("-");
    }
    console.log(`🔎 Strategy 3 (legacy): extracted email="${email}" from identifier="${identifier}"`);

    if (email) {
      // Safe approach: SELECT the most recent unpaid registration for this email, then UPDATE by id
      const { data: legacyReg } = await supabase
        .from("registrations")
        .select("id, email, webinar")
        .eq("email", email)
        .is("paid_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (legacyReg) {
        const { data: updatedRows, error } = await supabase
          .from("registrations")
          .update({
            paid_at: new Date().toISOString(),
            eupago_ref: reference || identifier,
            eupago_transaction_id: transactionID || null,
          })
          .eq("id", legacyReg.id)
          .select("id, email");

        if (error) {
          console.error("Strategy 3 DB error:", error);
        } else if (updatedRows && updatedRows.length > 0) {
          console.log(`✅ Strategy 3: matched by id=${legacyReg.id} (email=${email}, webinar=${legacyReg.webinar})`);
          matched = true;
          matchedRegId = updatedRows[0].id;
        }
      } else {
        console.warn(`⚠️ Strategy 3: no unpaid registration found for email=${email}`);
      }
    }
  }

  // ── Fallback alert: unmatched payment ─────────────────────────────────────
  // If no strategy succeeded, log an unmatched_payment event so it's visible
  // in the audit log and never silently lost.
  if (!matched) {
    console.error(`🚨 UNMATCHED PAYMENT: identifier="${identifier}", txID=${transactionID}, ref=${reference}, amount=${amount}`);
    await supabase.from("payment_events").insert({
      event_type: "unmatched_payment",
      eupago_ref: transactionID || reference || null,
      idempotency_key: `unmatched-${transactionID || reference || Date.now()}`,
      payload: { ...data, alert: "No registration matched — manual review required" },
    }).then(({ error }) => {
      if (error && error.code !== "23505") {
        console.warn("unmatched_payment event insert:", error.message);
      }
    });
    return;
  }

  // ── Post-match processing ─────────────────────────────────────────────────

  // Log payment_confirmed event
  if (matchedRegId) {
    await supabase.from("payment_events").insert({
      registration_id: matchedRegId,
      event_type: "payment_confirmed",
      eupago_ref: transactionID || reference,
      idempotency_key: `confirmed-${transactionID || reference}-${matchedRegId}`,
      payload: data,
      processed_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.warn("payment_confirmed event (non-blocking):", error.message);
    });

    // Update the webhook_received event with registration_id and processed_at
    await supabase.from("payment_events")
      .update({ registration_id: matchedRegId, processed_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);

    // ── E-Goi: attach purchase tags based on plan ──────────────────────────
    try {
      const EGOI_API_KEY = Deno.env.get("EGOI_API_KEY");

      if (EGOI_API_KEY) {
        const { data: regForTags } = await supabase
          .from("registrations")
          .select("email, plan_selected, webinar")
          .eq("id", matchedRegId)
          .maybeSingle();

        if (regForTags?.email && regForTags?.plan_selected) {
          const plan = regForTags.plan_selected;
          const webinar = regForTags.webinar || "imagens";

          // Normalise plan (remove "video-" prefix if present)
          const normalizedPlan = plan.replace(/^video-/, "");

          // Tag map per webinar
          const TAG_MAP: Record<string, { premium: number; masterclass: number }> = {
            imagens: { premium: 32, masterclass: 33 },
            video:   { premium: 35, masterclass: 33 },
          };
          const tags = TAG_MAP[webinar] || TAG_MAP.imagens;

          // Look up contact by email
          const contactRes = await fetch(
            `https://api.egoiapp.com/lists/5/contacts?email=${encodeURIComponent(regForTags.email)}`,
            { headers: { "Apikey": EGOI_API_KEY } }
          );
          const contactData = await contactRes.json();
          const contactId: string | null = contactData?.items?.[0]?.contact || null;

          if (contactId) {
            const attachTag = async (tagId: number) => {
              const res = await fetch(
                "https://api.egoiapp.com/lists/5/contacts/actions/attach-tag",
                {
                  method: "POST",
                  headers: { "Apikey": EGOI_API_KEY, "Content-Type": "application/json" },
                  body: JSON.stringify({ tag_id: tagId, contacts: [contactId] }),
                }
              );
              const text = await res.text();
              console.log(`📌 E-goi attach tag ${tagId} to ${regForTags.email}: status=${res.status}, body=${text}`);
            };

            if (["premium", "bundle"].includes(normalizedPlan)) {
              await attachTag(tags.premium);
            }
            if (["masterclass", "bundle"].includes(normalizedPlan)) {
              await attachTag(tags.masterclass);
            }
          } else {
            console.warn(`⚠️ E-goi: contact not found for email=${regForTags.email}`);
          }
        }
      }
    } catch (egoiErr) {
      console.error("E-goi tag error (non-blocking):", egoiErr);
    }

    // ── Send invoice notification email (idempotent) ──
    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

      // Idempotency check: skip if already sent
      const { data: alreadySent } = await supabase
        .from("message_logs")
        .select("id")
        .eq("registration_id", matchedRegId)
        .eq("template_key", "invoice_notification")
        .eq("status", "sent")
        .limit(1);

      if (alreadySent && alreadySent.length > 0) {
        console.log("📧 Invoice notification already sent — skipping");
      } else {
        const { data: invoice } = await supabase
          .from("invoice_details")
          .select("*")
          .eq("registration_id", matchedRegId)
          .maybeSingle();

        const { data: reg } = await supabase
          .from("registrations")
          .select("email, name, plan_selected, eupago_ref")
          .eq("id", matchedRegId)
          .maybeSingle();

        if (reg && RESEND_API_KEY) {
          const planLabel = ({ premium: "Premium Pass", masterclass: "Masterclass IA", bundle: "Premium + Masterclass" } as Record<string, string>)[reg.plan_selected || ""] || reg.plan_selected;
          const totalMap: Record<string, string> = { premium: "18,45", masterclass: "57,81", bundle: "76,26" };
          const totalVal = totalMap[reg.plan_selected || ""] || amount;

          let subject: string;
          let htmlBody: string;
          let templateKey: string;

          if (invoice) {
            templateKey = "invoice_notification";
            subject = `FATURA -- ${planLabel} -- ${invoice.invoice_name} -- ${totalVal}EUR`;
            htmlBody = `<h2>Novo pagamento confirmado</h2>
              <p><strong>Cliente:</strong> ${reg.name} (${reg.email})</p>
              <p><strong>Produto:</strong> ${planLabel}</p>
              <p><strong>Total (c/ IVA):</strong> ${totalVal} EUR</p>
              <p><strong>Data/hora:</strong> ${new Date().toISOString()}</p>
              <p><strong>Ref EuPago:</strong> ${transactionID || reference}</p>
              <hr/>
              <h3>Dados de faturação</h3>
              <p><strong>Nome/Empresa:</strong> ${invoice.invoice_name}</p>
              <p><strong>NIF:</strong> ${invoice.invoice_vat}</p>
              <p><strong>Morada:</strong> ${invoice.invoice_address}</p>
              <p><strong>CP:</strong> ${invoice.invoice_zip} ${invoice.invoice_city}</p>
              <p><strong>Email fatura:</strong> ${invoice.invoice_email}</p>`;
          } else {
            templateKey = "invoice_notification_missing_details";
            subject = `FATURA -- DADOS EM FALTA -- ${reg.email} -- ${planLabel}`;
            htmlBody = `<h2>Pagamento confirmado — dados de faturação em falta</h2>
              <p><strong>Cliente:</strong> ${reg.name} (${reg.email})</p>
              <p><strong>Produto:</strong> ${planLabel}</p>
              <p><strong>Total:</strong> ${totalVal} EUR</p>
              <p><strong>Ref EuPago:</strong> ${transactionID || reference}</p>
              <hr/>
              <p><strong>Dados de faturação não recolhidos.</strong> Solicitar ao cliente.</p>`;
          }

          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>",
              to: ["info@fredericocarvalho.pt"],
              subject,
              html: htmlBody,
            }),
          });
          const resendData = await resendRes.json();

          await supabase.from("message_logs").insert({
            registration_id: matchedRegId,
            channel: "email",
            provider: "resend",
            template_key: templateKey,
            status: resendRes.ok ? "sent" : "failed",
            provider_message_id: resendData.id || null,
            payment_url: null,
            error: resendRes.ok ? null : JSON.stringify(resendData),
          });

          console.log(`📧 Invoice email (${templateKey}) ${resendRes.ok ? "sent" : "FAILED"} for ${reg.email}`);
        }
      }
    } catch (invoiceErr) {
      console.error("Invoice email error (non-blocking):", invoiceErr);
    }

    // ── Email ao cliente: payment confirmation (video-aware) ──
    try {
      const RESEND_API_KEY_CUST = Deno.env.get("RESEND_API_KEY");

      const { data: regCust } = await supabase
        .from("registrations")
        .select("email, name, first_name, plan_selected, eupago_ref, webinar")
        .eq("id", matchedRegId)
        .maybeSingle();

      if (regCust && RESEND_API_KEY_CUST) {
        const fname = regCust.first_name || (regCust.name || "").split(" ")[0] || "";
        const custWebinar = regCust.webinar || "imagens";
        const normalizedPlan = (regCust.plan_selected || "").replace(/^video-/, "");

        if (custWebinar === "video") {
          // ── Video webinar: plan-specific templates ──
          const templatesToSend: { templateKey: string; subject: string; htmlFallback: string }[] = [];

          const premiumHtml = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#1e293b;line-height:1.6"><h2 style="margin:0 0 16px;font-size:22px;color:#0f172a">Tudo confirmado ✅</h2><p>Olá ${fname},</p><p>O teu pagamento foi confirmado e o <strong>Premium Pass</strong> está ativo.</p><ul style="padding-left:20px;margin:12px 0"><li>Sessão de Q&amp;A exclusiva ao vivo</li><li>Gravação completa do webinar</li><li>Recursos premium e materiais de apoio</li></ul><p style="margin:24px 0"><a href="https://calendar.app.google/Mczyo7DFx7xazgXD6" style="display:inline-block;padding:14px 28px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Guardar no Calendário →</a></p><p style="font-size:13px;color:#64748b">Adiciona a sessão Q&amp;A ao teu calendário.</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/><p>Suporte: <a href="https://wa.me/351915015508" style="color:#2563eb">WhatsApp +351 915 015 508</a></p><p style="margin-top:24px">Com os melhores cumprimentos,<br/><strong>Frederico Carvalho</strong></p></div>`;

          const masterclassHtml = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#1e293b;line-height:1.6"><h2 style="margin:0 0 16px;font-size:22px;color:#0f172a">Lugar garantido ✅</h2><p>Olá ${fname},</p><p>O teu pagamento foi confirmado e o teu lugar na <strong>Masterclass de IA</strong> está reservado.</p><ul style="padding-left:20px;margin:12px 0"><li>Formação intensiva e prática</li><li>Acesso vitalício à gravação</li><li>Materiais exclusivos e templates</li></ul><p style="margin:24px 0"><a href="https://calendar.app.google/LWQVacdqqavvEqSG9" style="display:inline-block;padding:14px 28px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">Guardar no Calendário →</a></p><p style="font-size:13px;color:#64748b">Adiciona a Masterclass ao teu calendário.</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/><p>Suporte: <a href="https://wa.me/351915015508" style="color:#2563eb">WhatsApp +351 915 015 508</a></p><p style="margin-top:24px">Com os melhores cumprimentos,<br/><strong>Frederico Carvalho</strong></p></div>`;

          if (["premium", "gravacao"].includes(normalizedPlan) || normalizedPlan === "bundle") {
            templatesToSend.push({ templateKey: "video_payment_premium", subject: `Tudo confirmado ✅ — aqui está o teu acesso`, htmlFallback: premiumHtml });
          }
          if (["masterclass"].includes(normalizedPlan) || normalizedPlan === "bundle") {
            templatesToSend.push({ templateKey: "video_payment_masterclass", subject: `Lugar garantido na Masterclass ✅`, htmlFallback: masterclassHtml });
          }

          for (const tpl of templatesToSend) {
            // Idempotency check
            const { data: alreadySentCust } = await supabase
              .from("message_logs")
              .select("id")
              .eq("registration_id", matchedRegId)
              .eq("template_key", tpl.templateKey)
              .eq("status", "sent")
              .limit(1);

            if (alreadySentCust && alreadySentCust.length > 0) {
              console.log(`📧 ${tpl.templateKey} already sent — skipping`);
              continue;
            }

            // Try to load template from DB
            const { data: dbTpl } = await supabase
              .from("email_templates")
              .select("subject, html_body")
              .eq("template_key", tpl.templateKey)
              .eq("is_active", true)
              .maybeSingle();

            const finalSubject = (dbTpl?.subject || tpl.subject).replace(/\{\{fname\}\}/g, fname);
            const finalHtml = (dbTpl?.html_body || tpl.htmlFallback).replace(/\{\{fname\}\}/g, fname);

            const custRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${RESEND_API_KEY_CUST}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>",
                to: [regCust.email],
                subject: finalSubject,
                html: finalHtml,
              }),
            });
            const custData = await custRes.json();

            // Dual logging: message_logs + email_send_logs
            await supabase.from("message_logs").insert({
              registration_id: matchedRegId,
              channel: "email",
              provider: "resend",
              template_key: tpl.templateKey,
              status: custRes.ok ? "sent" : "failed",
              provider_message_id: custData.id || null,
              payment_url: null,
              error: custRes.ok ? null : JSON.stringify(custData),
            });

            await supabase.from("email_send_logs").insert({
              email_key: tpl.templateKey,
              recipient_email: regCust.email,
              fname: fname,
              webinar: "video",
              status: custRes.ok ? "sent" : "failed",
              resend_id: custData.id || null,
              error_message: custRes.ok ? null : JSON.stringify(custData),
            });

            console.log(`📧 ${tpl.templateKey} ${custRes.ok ? "sent" : "FAILED"} to ${regCust.email}`);
          }
        } else {
          // ── Imagens webinar: existing generic template ──
          const { data: customerEmailSent } = await supabase
            .from("message_logs")
            .select("id")
            .eq("registration_id", matchedRegId)
            .eq("template_key", "payment_confirmed_customer")
            .eq("status", "sent")
            .limit(1);

          if (customerEmailSent && customerEmailSent.length > 0) {
            console.log("📧 Customer confirmation already sent — skipping");
          } else {
            const custPlanLabel = ({ premium: "Premium Pass", masterclass: "Masterclass IA", bundle: "Bundle (Premium + Masterclass)" } as Record<string, string>)[regCust.plan_selected || ""] || regCust.plan_selected || "N/A";
            const eupagoRefDisplay = transactionID || reference || regCust.eupago_ref || "N/A";
            const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://imagenscomia.com";
            const primaryAccessUrl = `${siteUrl}/live`;
            const whatsappUrl = "https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20a%20minha%20inscri%C3%A7%C3%A3o";

            const customerSubject = "Pagamento confirmado — obrigado pela confiança";
            const customerHtml = `<h2>Pagamento confirmado</h2>
              <p>Agradece-se a confiança. O pagamento foi confirmado e a inscrição está garantida.</p>
              <hr/>
              <p><strong>Resumo</strong></p>
              <ul>
                <li><strong>Plano:</strong> ${custPlanLabel}</li>
                <li><strong>Referência:</strong> ${eupagoRefDisplay}</li>
                <li><strong>Email associado:</strong> ${regCust.email}</li>
              </ul>
              <p><strong>Próximo passo</strong></p>
              <p><a href="${primaryAccessUrl}" style="display:inline-block;padding:12px 16px;border-radius:10px;background:#0ea5e9;color:#ffffff;text-decoration:none;">Aceder / Preparar participação</a></p>
              <p style="font-size:13px;color:#64748b;">Se o botão não abrir, usar este link: ${primaryAccessUrl}</p>
              <hr/>
              <p><strong>Faturação</strong></p>
              <p>A fatura será emitida e enviada posteriormente para o email indicado nos dados de faturação.</p>
              <p><strong>Suporte</strong></p>
              <p>Se for necessária ajuda, contacto directo via WhatsApp: <a href="${whatsappUrl}">+351 915 015 508</a></p>
              <p>Com os melhores cumprimentos,<br/>Frederico Carvalho</p>`;

            const customerRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${RESEND_API_KEY_CUST}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>",
                to: [regCust.email],
                subject: customerSubject,
                html: customerHtml,
              }),
            });
            const customerData = await customerRes.json();

            await supabase.from("message_logs").insert({
              registration_id: matchedRegId,
              channel: "email",
              provider: "resend",
              template_key: "payment_confirmed_customer",
              status: customerRes.ok ? "sent" : "failed",
              provider_message_id: customerData.id || null,
              payment_url: null,
              error: customerRes.ok ? null : JSON.stringify(customerData),
            });

            console.log(`📧 Customer confirmation ${customerRes.ok ? "sent" : "FAILED"} to ${regCust.email}`);
          }
        }
      }
    } catch (custErr) {
      console.error("Customer email error (non-blocking):", custErr);
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let data: PaymentData;

    if (req.method === "GET") {
      console.log("📥 EuPago classic GET callback");
      data = extractFromGET(req);
    } else {
      console.log("📥 EuPago POST webhook (2.0)");
      data = await extractFromPOST(req);
    }

    await processPayment(data);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
