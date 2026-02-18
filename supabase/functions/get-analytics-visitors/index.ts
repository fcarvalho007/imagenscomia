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
    const projectId = Deno.env.get("SUPABASE_PROJECT_ID") ?? "bacfa751-bc77-4ced-ab7c-bb62e7ceb144";
    const startDate = "2026-02-08";
    const endDate = new Date().toISOString().split("T")[0];

    const analyticsUrl = `https://api.lovable.dev/projects/${projectId}/analytics?startdate=${startDate}&enddate=${endDate}&granularity=daily`;

    const response = await fetch(analyticsUrl, {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Analytics API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Failed to fetch analytics", status: response.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Extract visitors for route "/" only from breakdown
    let landingPageVisitors = 0;
    if (data?.breakdown?.page) {
      const pages = data.breakdown.page as Array<{ page?: string; value?: string; visitors?: number; count?: number }>;
      const landingEntry = pages.find((p) => p.page === "/" || p.value === "/");
      if (landingEntry) {
        landingPageVisitors = landingEntry.visitors ?? landingEntry.count ?? 0;
      }
    }

    // Fallback: total visitors if no page breakdown available
    if (landingPageVisitors === 0 && data?.visitors?.total) {
      landingPageVisitors = data.visitors.total;
    }

    return new Response(
      JSON.stringify({ visitors: landingPageVisitors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
