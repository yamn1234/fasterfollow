import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FAWATERAK_API_URL = "https://app.fawaterk.com/api/v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FAWATERAK_API_KEY");
    if (!apiKey) {
      throw new Error("Fawaterak API key not configured");
    }

    const { amount, userId } = await req.json();

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

    console.log(`Creating Fawaterak payment for user ${userId}, amount: $${amount}`);

    // Get Supabase project URL for callback
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user email for the invoice
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const customerEmail = authUser?.user?.email || "customer@example.com";
    const customerName = authUser?.user?.user_metadata?.full_name || "Customer";

    // Get user's current balance for transaction record
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("user_id", userId)
      .single();

    const currentBalance = profile?.balance || 0;

    // Step 1: Get available payment methods
    const methodsRes = await fetch(`${FAWATERAK_API_URL}/getPaymentmethods`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!methodsRes.ok) {
      const errText = await methodsRes.text();
      console.error("Fawaterak getPaymentmethods error:", errText);
      throw new Error("Failed to get payment methods from Fawaterak");
    }

    const methodsData = await methodsRes.json();
    console.log("Payment methods:", JSON.stringify(methodsData));

    // Find Visa/card payment method (usually PaymentMethodId = 2 for cards)
    // We'll use the first available method or specifically look for card/visa
    let paymentMethodId = 2; // Default to card payment
    if (methodsData?.data && Array.isArray(methodsData.data)) {
      const cardMethod = methodsData.data.find(
        (m: any) => m.payment_id === 2 || m.name_en?.toLowerCase().includes("visa") || m.name_en?.toLowerCase().includes("card")
      );
      if (cardMethod) {
        paymentMethodId = cardMethod.payment_id;
      }
    }

    // Callback URL for webhook
    const webhookUrl = `${supabaseUrl}/functions/v1/fawaterak-webhook`;

    // Step 2: Execute payment
    const paymentRes = await fetch(`${FAWATERAK_API_URL}/invoiceInitPay`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_method_id: paymentMethodId,
        cartTotal: amount.toString(),
        currency: "USD",
        customer: {
          first_name: customerName.split(" ")[0] || "Customer",
          last_name: customerName.split(" ").slice(1).join(" ") || "User",
          email: customerEmail,
          phone: "0500000000",
          address: "Digital Product",
        },
        redirectionUrls: {
          successUrl: `${supabaseUrl}/functions/v1/fawaterak-webhook?status=success&userId=${userId}`,
          failUrl: `${supabaseUrl}/functions/v1/fawaterak-webhook?status=fail&userId=${userId}`,
          pendingUrl: `${supabaseUrl}/functions/v1/fawaterak-webhook?status=pending&userId=${userId}`,
        },
        cartItems: [
          {
            name: "Account Balance Top-up",
            price: amount.toString(),
            quantity: "1",
          },
        ],
      }),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok || !paymentData?.data) {
      console.error("Fawaterak payment error:", JSON.stringify(paymentData));
      return new Response(
        JSON.stringify({ error: "Failed to create payment", details: paymentData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fawaterak payment created:", JSON.stringify(paymentData.data));

    const invoiceId = paymentData.data.invoice_id || paymentData.data.invoiceId;
    const paymentUrl = paymentData.data.payment_data?.redirectTo || 
                       paymentData.data.payment_data?.redirect_to ||
                       paymentData.data.redirectTo ||
                       paymentData.data.redirect_to;

    if (!paymentUrl) {
      console.error("No redirect URL in response:", JSON.stringify(paymentData));
      throw new Error("No payment URL received from Fawaterak");
    }

    // Create pending transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "deposit",
      amount: amount,
      balance_before: currentBalance,
      balance_after: currentBalance,
      description: `Fawaterak deposit - Invoice: ${invoiceId}`,
      payment_method: "fawaterak",
      payment_reference: String(invoiceId),
    });

    return new Response(
      JSON.stringify({
        paymentUrl,
        invoiceId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating Fawaterak payment:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
