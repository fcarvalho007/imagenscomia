import { authorizedAdmin } from "./admin-auth.ts";
// Delivery is privileged: neither the public anon key nor a caller-supplied email authorizes it.
export async function authorizedDelivery(req: Request, db: any, env: (key: string) => string | undefined) {
  const secret = env("CRON_SECRET");
  if (secret && req.headers.get("x-cron-secret") === secret) return true;
  return authorizedAdmin(req, db, env("SUPABASE_SERVICE_ROLE_KEY"));
}
