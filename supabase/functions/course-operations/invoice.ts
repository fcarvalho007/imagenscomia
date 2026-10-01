import type { DB } from "./email.ts";
export async function issueCourseInvoice(
  db: DB,
  ctx: any,
  env: (k: string) => string | undefined,
  send: typeof fetch = fetch,
) {
  const { job, registration: r, edition: e, payment: p, invoice: i } = ctx;
  const finish = async (outcome: string, reason?: string, id?: string) => {
    const { error } = await db.rpc("finish_course_job", {
      job_id: job.id,
      job_lease: job.lease,
      outcome,
      reason: reason || null,
      external_id: id || null,
    });
    if (error) throw new Error("job_persist_failed");
  };
  const account = env("COURSE_INVOICEEXPRESS_ACCOUNT"),
    key = env("INVOICEEXPRESS_API_KEY"),
    tax = env("COURSE_INVOICEEXPRESS_TAX_NAME");
  if (!account || !/^[a-z0-9-]+$/.test(account) || !key || !tax) {
    await finish("blocked", "invoice_configuration_missing");
    return;
  }
  if (!i || i.state === "awaiting_data") {
    await finish("blocked", "billing_data_missing");
    return;
  }
  if (i.state === "issued") {
    await finish("sent", undefined, i.document_id);
    return;
  }
  if (
    i.state === "review" ||
    p.state !== "paid" ||
    i.billing.country !== "Portugal" ||
    p.vat_percent !== 23
  ) {
    await finish("review", "billing_requires_review");
    return;
  }
  const api = async (path: string, method = "GET", body?: unknown) => {
    const url = `https://${account}.app.invoicexpress.com/${path}?api_key=${encodeURIComponent(key)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await send(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`invoicexpress_${res.status}`);
      return res.status === 204 ? {} : await res.json();
    } finally {
      clearTimeout(timer);
    }
  };
  // Validate the selected tax rather than trusting InvoiceXpress's fallback to its default tax.
  try {
    const taxes = await api("taxes.json");
    if (
      !Array.isArray(taxes.taxes) ||
      !taxes.taxes.some(
        (t: any) => t.name === tax && Number(t.value) === p.vat_percent,
      )
    ) {
      await finish("blocked", "invoice_tax_not_verified");
      return;
    }
  } catch {
    await finish("blocked", "invoice_tax_lookup_failed");
    return;
  }
  const stamp = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  const b = i.billing;
  const payload = job.payload || {
    invoice: {
      date: stamp,
      due_date: stamp,
      reference: `FCIA-${p.id}`,
      observations: `Curso de inteligência artificial · ${e.label}`,
      client: {
        name: b.name,
        code: `FCIA-${r.id}`,
        email: r.email,
        fiscal_id: b.tax_id,
        address: b.address,
        postal_code: b.postal_code,
        city: b.city,
        country: "Portugal",
      },
      items: [
        {
          name: `Curso IA · ${e.id}`,
          description: `14 horas de formação e acompanhamento individual · ${e.operations.schedule}`,
          unit_price: (p.net_cents / 100).toFixed(2),
          quantity: "1",
          unit: "service",
          tax: { name: tax },
        },
      ],
    },
  };
  const { data: ready, error } = await db.rpc("prepare_course_job", {
    job_id: job.id,
    job_lease: job.lease,
    frozen_payload: payload,
  });
  if (error || !ready) throw new Error("job_not_prepared");
  let id = i.document_id;
  const persist = async (values: unknown) => {
    const { error } = await db
      .from("course_invoices")
      .update(values)
      .eq("registration_id", r.id);
    if (error) throw new Error("invoice_persist_failed");
  };
  try {
    if (!id) {
      // No automatic retry after an ambiguous create: provider does not expose an idempotency key.
      const created = await api("invoice_receipts.json", "POST", payload);
      id = String(created.invoice_receipt?.id || created.id || "");
      if (!/^\d+$/.test(id)) throw new Error("invoice_missing_id");
      await persist({ document_id: id, updated_at: new Date().toISOString() });
    }
    const result = await api(`invoice_receipts/${id}.json`);
    const doc = result.invoice_receipt || result.invoice;
    if (
      !doc ||
      doc.reference !== `FCIA-${p.id}` ||
      Math.round(Number(doc.total) * 100) !== p.amount_cents
    )
      throw new Error("invoice_total_or_reference_mismatch");
    // Recheck payment immediately before finalizing a fiscal document.
    const { data: current, error: pe } = await db
      .from("course_payments")
      .select("state")
      .eq("id", p.id)
      .single();
    if (pe || current?.state !== "paid") throw new Error("payment_changed");
    if (doc.status === "draft")
      await api(`invoice_receipts/${id}/change-state.json`, "PUT", {
        invoice: { state: "finalized" },
      });
    else if (!["settled", "final"].includes(doc.status))
      throw new Error("invoice_unexpected_state");
    await persist({
      finalized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (!i.emailed_at) {
      await api(`invoice_receipts/${id}/email-document.json`, "PUT", {
        message: {
          client: { email: r.email, save: "0" },
          subject: `Fatura-recibo · Curso de inteligência artificial · ${e.label}`,
          body: "Olá. Enviamos a fatura-recibo da sua inscrição. Obrigado pela confiança. Frederico Carvalho",
          logo: "0",
        },
      });
    }
    await persist({
      state: "issued",
      emailed_at: i.emailed_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await finish("sent", undefined, id);
  } catch (err) {
    await persist({ state: "review", updated_at: new Date().toISOString() });
    await finish(
      "review",
      err instanceof Error && /^[a-z_0-9]+$/.test(err.message)
        ? err.message
        : "invoice_uncertain_verify_provider",
      id || undefined,
    );
  }
}
