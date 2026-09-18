import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { saveBilling } from "./billing.ts";
import { normalizeEvent } from "../_shared/course/contract.ts";
import { checkout, paymentStatus } from "./payment.ts";
const encoder = new TextEncoder();
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
serve(async (req) => {
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });
  const secret = Deno.env.get("COURSE_WP_BRIDGE_SECRET");
  if (!secret || secret.length < 32)
    return reply(503, { error: "Integration not configured" });
  if (Number(req.headers.get("content-length") || 0) > 10000)
    return reply(413, { error: "Too large" });
  const raw = await req.text();
  if (raw.length > 10000) return reply(413, { error: "Too large" });
  const stamp = req.headers.get("x-course-timestamp") || "";
  const signature = req.headers.get("x-course-signature") || "";
  if (
    !/^\d{10}$/.test(stamp) ||
    Math.abs(Date.now() / 1000 - Number(stamp)) > 300 ||
    !/^[0-9a-f]{64}$/.test(signature)
  )
    return reply(401, { error: "Unauthorized" });
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sig = Uint8Array.from(signature.match(/../g)!, (x) => parseInt(x, 16));
  if (
    !(await crypto.subtle.verify(
      "HMAC",
      key,
      sig,
      encoder.encode(stamp + "." + raw),
    ))
  )
    return reply(401, { error: "Unauthorized" });
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: "Invalid JSON" });
  }
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  try {
    if (body.kind === "checkout") {
      return reply(200, await checkout(db, body.data || {}));
    } else if (body.kind === "billing") {
      return reply(200,await saveBilling(db,body.data || {}));
    } else if (body.kind === "quote") {
      const { data, error } = await db.rpc("course_quote", {
        edition_id: body.data?.edition,
      });
      if (error) return reply(409, { error: "Edition unavailable" });
      return reply(200, { accepted: true, quote: data });
    } else if (body.kind === "status") {
      return reply(200, await paymentStatus(db, body.data?.request_id));
    } else if (body.kind === "event") {
      const value = normalizeEvent(body.data || {});
      const { error } = await db
        .from("course_events")
        .upsert(value, { onConflict: "id", ignoreDuplicates: true });
      if (error) {
        console.error("course event failed", error.code);
        return reply(503, { error: "Unable to save" });
      }
    } else return reply(400, { error: "Invalid request" });
    // Never expose existing customer data or tell an unauthenticated caller whether an email exists.
    return reply(200, { accepted: true });
  } catch {
    return reply(400, { error: "Invalid fields" });
  }
});
