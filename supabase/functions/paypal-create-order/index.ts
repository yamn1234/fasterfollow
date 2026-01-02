import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYPAL_API_URL = "https://api-m.paypal.com"; // Live mode

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("PayPal auth error:", error);
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, userId, returnUrl, cancelUrl } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating PayPal order for user ${userId}, amount: $${amount}`);

    const accessToken = await getPayPalAccessToken();

    // Create PayPal order with guest checkout enabled
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `${userId}-${Date.now()}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            description: "Account Balance Top-up",
          },
        ],
        application_context: {
          brand_name: "FasterFollow",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error("PayPal order creation error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create PayPal order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = await orderResponse.json();
    console.log("PayPal order created:", orderData.id);

    // Store pending transaction in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's current balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", userId)
      .single();

    const currentBalance = profile?.balance || 0;

    // Create pending transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      amount: amount,
      balance_before: currentBalance,
      balance_after: currentBalance, // Will be updated on capture
      description: `PayPal deposit - Order: ${orderData.id}`,
      payment_method: "paypal",
      payment_reference: orderData.id,
    });

    // Find approval URL
    const approvalUrl = orderData.links?.find((link: any) => link.rel === "payer-action")?.href 
      || orderData.links?.find((link: any) => link.rel === "approve")?.href;

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        approvalUrl: approvalUrl,
        status: orderData.status,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating PayPal order:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
