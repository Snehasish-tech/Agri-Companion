import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Fetch from data.gov.in API (server-side, no CORS issues)
    const apiUrl =
      "https://api.data.gov.in/resource/9ef2731d-91f2-4fd2-a055-14f777e43997";
    const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

    const url = `${apiUrl}?api-key=${apiKey}&format=json&limit=1000&offset=0`;

    console.log(`🔄 Fetching market prices from: ${apiUrl}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Agri-Companion/1.0",
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ API returned status ${response.status}`);
      return new Response(
        JSON.stringify({ records: [], error: `HTTP ${response.status}` }),
        {
          status: 200, // Still return 200 so client doesn't error
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    console.log(
      `✅ Got ${data.records?.length || 0} price records from API`
    );

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Market prices error: ${errorMsg}`);

    // Return empty array but with 200 status so client can fallback gracefully
    return new Response(JSON.stringify({ records: [], error: errorMsg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
