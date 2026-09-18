import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { uuid } from "../_shared/course/contract.ts";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, x-course-access, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST")
    return new Response("{}", { status: 405, headers });
  const token = req.headers.get("x-course-access");
  if (!uuid(token))
    return new Response(JSON.stringify({ error: "Access unavailable" }), {
      status: 403,
      headers,
    });
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await db.rpc("read_course_resources", {
    access_token: token,
  });
  return new Response(
    JSON.stringify(error ? { error: "Access unavailable" } : data),
    { status: error ? 403 : 200, headers },
  );
});
