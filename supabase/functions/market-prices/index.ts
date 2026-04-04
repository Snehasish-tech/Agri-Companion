export {};

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
    
    const url = `https://api.data.gov.in/resource/10f1ae35-d807-43c1-a1cc-09eab17dc78e?api-key=${apiKey}&format=json&limit=100&offset=0`;

    console.log(`🔄 Fetching market prices from data.gov.in...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Agri-Companion/1.0",
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ API returned status ${response.status}`);
      return new Response(
        JSON.stringify({ records: [], error: `HTTP ${response.status}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    let records: any[] = [];
    
    if (data.records && Array.isArray(data.records)) {
      records = data.records;
    } else if (data.results && Array.isArray(data.results)) {
      records = data.results;
    }
    
    console.log(`✅ Got ${records.length} price records from API`);

    return new Response(JSON.stringify({ records, total: records.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Market prices error: ${errorMsg}`);

    return new Response(JSON.stringify({ records: [], error: errorMsg }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
