// Resolves the calling administrator from a verified Supabase JWT.
// Never trusts an identity supplied in the request body.
export type AdminIdentity = { id: string; email: string; emailVerified: boolean };

export async function resolveCourseAdmin(req: Request, db: any): Promise<AdminIdentity | null> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  try {
    const { data, error } = await db.auth.getUser(token);
    if (error || !data?.user) return null;
    const claims = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (claims.aal !== "aal2") return null;
    const { data: admin, error: roleError } = await db.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (roleError || admin !== true) return null;
    const email = String(data.user.email || "");
    if (!email) return null;
    return { id: data.user.id, email, emailVerified: Boolean(data.user.email_confirmed_at) };
  } catch {
    return null;
  }
}
