import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CHAPA_SECRET_KEY = Deno.env.get("CHAPA_SECRET_KEY");
    if (!CHAPA_SECRET_KEY) throw new Error("CHAPA_SECRET_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Get user profile for tenant
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id, full_name")
      .eq("user_id", userId)
      .single();

    if (!profile?.tenant_id) {
      return new Response(JSON.stringify({ error: "No tenant found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plan, amount, callback_url, return_url } = await req.json();
    const tx_ref = `ethiocare-${profile.tenant_id}-${Date.now()}`;

    // Get user email from claims
    const email = claimsData.claims.email;

    // Initialize Chapa payment
    const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount || 299,
        currency: "ETB",
        email,
        first_name: profile.full_name?.split(" ")[0] || "User",
        last_name: profile.full_name?.split(" ").slice(1).join(" ") || "",
        tx_ref,
        callback_url: callback_url || `${Deno.env.get("SUPABASE_URL")}/functions/v1/chapa-webhook`,
        return_url: return_url || "",
        customization: {
          title: "EthioCare Subscription",
          description: `${plan || "premium"} plan subscription`,
        },
      }),
    });

    const chapaData = await chapaRes.json();

    if (chapaData.status !== "success") {
      throw new Error(chapaData.message || "Chapa initialization failed");
    }

    // Create pending subscription
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseAdmin.from("subscriptions").insert({
      tenant_id: profile.tenant_id,
      plan: plan || "premium",
      status: "pending",
      chapa_tx_ref: tx_ref,
      amount: amount || 299,
      currency: "ETB",
    });

    return new Response(
      JSON.stringify({
        checkout_url: chapaData.data.checkout_url,
        tx_ref,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
