import { createClient } from "npm:@supabase/supabase-js@2";

// TEMPORARY one-off maintenance action. Deleted immediately after use.
const GUARD = "b6f4a1c7-2d90-4f18-9c3e-7a51d0e4c8b2";
const TARGET_EMAIL = "fredericodigital@gmail.com";

Deno.serve(async (req) => {
  if (req.headers.get("x-maintenance-guard") !== GUARD) {
    return new Response("forbidden", { status: 403 });
  }
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return new Response(JSON.stringify({ step: "list", error: listError.message }), { status: 500 });
  const user = list.users.find((u) => u.email?.toLowerCase() === TARGET_EMAIL);
  if (!user) return new Response(JSON.stringify({ step: "find", error: "not_found" }), { status: 404 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.p !== "string" || body.p.length < 8) {
    return new Response(JSON.stringify({ step: "input", error: "invalid" }), { status: 400 });
  }
  const { error } = await admin.auth.admin.updateUserById(user.id, { password: body.p });
  if (error) return new Response(JSON.stringify({ step: "update", error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true, id: user.id }), {
    headers: { "Content-Type": "application/json" },
  });
});
