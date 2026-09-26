// Shared CORS policy for the course admin endpoints.
// The browser client adds client-info headers that change between SDK
// versions, so the allow-list is a wildcard plus the explicit names required
// by browsers that ignore the wildcard for `authorization`.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "*, authorization, apikey, content-type, x-client-info, x-supabase-api-version, x-region",
  "Access-Control-Max-Age": "86400",
};

// Structured, privacy-safe trace: outcome codes only, never contacts or secrets.
export const trace = (fn: string, fields: Record<string, string | number | boolean | null>) => {
  console.log(JSON.stringify({ fn, ...fields }));
};
