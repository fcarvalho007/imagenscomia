// Signed server-to-server diagnostics only: no registration, provider request or message.
export async function courseDiagnostics(db: any, env: (key: string) => string | undefined) {
  const { data, error } = await db.from("course_editions").select("id,label,early_until,early_net_cents,net_cents,vat_percent,sales_enabled,automation_enabled,sms_enabled,invoicing_enabled").order("starts_at");
  if (error || !data || data.length < 1) throw new Error("course_schema_unavailable");
  const checks = {
    payment_enabled: env("COURSE_PAYMENTS_ENABLED") === "true",
    payment_environment: env("COURSE_PAYMENT_ENV") === "production" ? "production" : "sandbox",
    payment_configured: Boolean(env("COURSE_EUPAGO_API_KEY") && env("COURSE_EUPAGO_WEBHOOK_KEY")),
    email_enabled: env("COURSE_AUTOMATIONS_ENABLED") === "true",
    email_configured: Boolean(env("RESEND_API_KEY") && env("COURSE_EMAIL_FROM") && env("COURSE_EMAIL_REPLY_TO")),
    invoice_enabled: env("COURSE_INVOICING_ENABLED") === "true",
    invoice_configured: Boolean(env("INVOICEEXPRESS_API_KEY") && env("COURSE_INVOICEEXPRESS_ACCOUNT") && env("COURSE_INVOICEEXPRESS_TAX_NAME")),
    sms_enabled: env("COURSE_SMS_ENABLED") === "true",
    sms_configured: Boolean(env("SMSONLINE_API_KEY") && env("COURSE_SMS_FROM")),
    worker_configured: (env("COURSE_CRON_SECRET") || "").length >= 32,
  };
  const editions = data.map((e: any) => {
    const net = e.early_until && Date.parse(e.early_until) > Date.now() ? e.early_net_cents : e.net_cents;
    return { id: e.id, label: e.label, net_cents: net, amount_cents: Math.round(net * (100 + e.vat_percent) / 100), vat_percent: e.vat_percent, sales_enabled: e.sales_enabled };
  });
  return { accepted: true, mode: "read_only", version: "0.6.0", checks, editions };
}
