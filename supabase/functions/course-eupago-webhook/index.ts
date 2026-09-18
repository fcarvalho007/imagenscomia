import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { verifySignature, parsePayment } from "./verify.ts";
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
// Configure Eupago Realtime Webhooks 2.0: signed POST, encrypt=false, Paid + Refund + Expired + Cancel.
// Classic unauthenticated callbacks are deliberately not accepted for this course.
serve(async (req) => {
  if (req.method !== "POST") return reply(405, { error: "POST required" });
  const key = Deno.env.get("COURSE_EUPAGO_WEBHOOK_KEY");
  if (!key) return reply(503, { error: "Not configured" });
  if (Number(req.headers.get("content-length") || 0) > 20000)
    return reply(413, { error: "Too large" });
  const raw = await req.text();
  if (raw.length > 20000) return reply(413, { error: "Too large" });
  if (!(await verifySignature(raw, req.headers.get("x-signature") || "", key)))
    return reply(401, { error: "Invalid signature" });
  try {
    const payment = parsePayment(JSON.parse(raw));
    if (!payment) return reply(200, { received: true, ignored: true });
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await db.rpc("confirm_course_payment", payment);
    if (error) {
      console.error("Course reconciliation failed", error.code);
      return reply(409, { error: "Reconciliation required" });
    }
    return reply(200, { received: true });
  } catch {
    return reply(400, { error: "Invalid payload" });
  }
});
