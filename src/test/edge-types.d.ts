// Vitest type bridge for the pure payment helper imported from the Deno function.
// Production uses the Deno runtime and the pinned URL dependency.
declare module "https://esm.sh/@supabase/supabase-js@2.95.3" {
  export type { SupabaseClient } from "@supabase/supabase-js";
}
declare namespace Deno {
  const env: { get(name: string): string | undefined };
}
