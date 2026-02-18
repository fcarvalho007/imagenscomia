import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const projectId = "bacfa751-bc77-4ced-ab7c-bb62e7ceb144";
    const startDate = "2026-02-08";
    const endDate = new Date().toISOString().split("T")[0];

    // Try the Lovable analytics API
    const endpoints = [
      `https://api.lovable.dev/v1/projects/${projectId}/analytics?startdate=${startDate}&enddate=${endDate}&granularity=daily`,
      `https://api.lovable.dev/projects/${projectId}/analytics?startdate=${startDate}&enddate=${endDate}&granularity=daily`,
    ];

    for (const analyticsUrl of endpoints) {
      const response = await fetch(analyticsUrl, {
        headers: {
          "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        let landingPageVisitors = 0;
        if (data?.breakdown?.page) {
          const pages = data.breakdown.page as Array<{ page?: string; value?: string; visitors?: number; count?: number }>;
          const landingEntry = pages.find((p) => p.page === "/" || p.value === "/");
          if (landingEntry) {
            landingPageVisitors = landingEntry.visitors ?? landingEntry.count ?? 0;
          }
        }

        if (landingPageVisitors === 0 && data?.visitors?.total) {
          landingPageVisitors = data.visitors.total;
        }

        if (landingPageVisitors === 0 && typeof data?.visitors === "number") {
          landingPageVisitors = data.visitors;
        }

        return new Response(
          JSON.stringify({ visitors: landingPageVisitors, source: "api" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // consume body to avoid resource leak
      await response.text();
    }

    // API unavailable — return null so the frontend uses its own fallback
    console.info("Analytics API unavailable, returning null so frontend uses fallback");
    return new Response(
      JSON.stringify({ visitors: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ visitors: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
