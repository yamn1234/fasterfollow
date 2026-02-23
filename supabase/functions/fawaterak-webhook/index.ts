import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the frontend URL for redirects
    const siteUrl = Deno.env.get("SITE_URL") || "https://fasterfollow.net";

    // Handle GET redirect from Fawaterak (success/fail/pending redirects)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const status = url.searchParams.get("status");
      const userId = url.searchParams.get("userId");
      const invoiceId = url.searchParams.get("invoice_id") || url.searchParams.get("fawaterak_invoice_id");

      console.log(`Fawaterak redirect: status=${status}, userId=${userId}, invoiceId=${invoiceId}`);

      if (status === "success" && userId && invoiceId) {
        // Verify payment with Fawaterak API
        const apiKey = Deno.env.get("FAWATERAK_API_KEY");
        if (apiKey) {
          try {
            const verifyRes = await fetch(
              `https://app.fawaterk.com/api/v2/getInvoiceData/${invoiceId}`,
              {
                headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
              }
            );

            const verifyData = await verifyRes.json();
            console.log("Invoice verification:", JSON.stringify(verifyData));

            const invoiceStatus = verifyData?.data?.status;
            const statusText = verifyData?.data?.status_text;
            const isPaid = statusText === "paid" || invoiceStatus === "paid" || invoiceStatus === 1 || invoiceStatus === "1";
            
            if (isPaid) {
              // Get the transaction to find the original USD amount
              const { data: transaction } = await supabase
                .from("transactions")
                .select("*")
                .eq("payment_reference", String(invoiceId))
                .eq("user_id", userId)
                .eq("payment_method", "fawaterak")
                .single();

              if (transaction && transaction.balance_after === transaction.balance_before) {
                // Payment not yet processed - use the stored USD amount
                const depositAmount = transaction.amount;

                const { data: profile } = await supabase
                  .from("profiles")
                  .select("balance")
                  .eq("user_id", userId)
                  .single();

                const currentBalance = profile?.balance || 0;

                // Check bonus
                const { data: bonusEnabled } = await supabase
                  .from("site_settings")
                  .select("value")
                  .eq("key", "bonus_enabled")
                  .single();

                let bonusAmount = 0;
                if (bonusEnabled?.value === true || bonusEnabled?.value === "true") {
                  const { data: bonusRates } = await supabase
                    .from("bonus_settings")
                    .select("*")
                    .eq("is_active", true)
                    .order("min_amount", { ascending: false });

                  const applicableRate = bonusRates?.find(r => depositAmount >= r.min_amount);
                  if (applicableRate) {
                    bonusAmount = (depositAmount * applicableRate.bonus_percentage) / 100;
                  }
                }

                const totalCredit = depositAmount + bonusAmount;
                const newBalance = currentBalance + totalCredit;

                await supabase
                  .from("profiles")
                  .update({ balance: newBalance })
                  .eq("user_id", userId);

                await supabase
                  .from("transactions")
                  .update({
                    balance_after: newBalance,
                    description: `Fawaterak deposit completed - Invoice: ${invoiceId}`,
                  })
                  .eq("id", transaction.id);

                // Add bonus transaction if applicable
                if (bonusAmount > 0) {
                  await supabase.from("transactions").insert({
                    user_id: userId,
                    type: "bonus",
                    amount: bonusAmount,
                    balance_before: currentBalance + depositAmount,
                    balance_after: newBalance,
                    description: `مكافأة شحن ${applicableRate?.bonus_percentage}%`,
                    payment_method: "fawaterak",
                    payment_reference: String(invoiceId),
                  });
                }

                console.log(`Balance updated for user ${userId}: $${currentBalance} -> $${newBalance} (deposit: $${depositAmount}, bonus: $${bonusAmount})`);
              } else {
                console.log(`Payment already processed for invoice ${invoiceId}`);
              }
            }
          } catch (verifyError) {
            console.error("Error verifying Fawaterak payment:", verifyError);
          }
        }

        // Redirect to dashboard with success
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${siteUrl}/dashboard?tab=balance&payment=success`,
          },
        });
      }

      // Failed or pending
      const redirectStatus = status === "pending" ? "pending" : "failed";
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${siteUrl}/dashboard?tab=balance&payment=${redirectStatus}`,
        },
      });
    }

    // Handle POST webhook from Fawaterak
    if (req.method === "POST") {
      const body = await req.json();
      console.log("Fawaterak webhook received:", JSON.stringify(body));

      const invoiceId = body.invoice_id || body.InvoiceId;
      const statusText = body.payment_status || body.invoice_status || body.status_text || body.status;
      const isPaid = statusText === "paid" || body.status === 1 || body.status === "1";

      if (isPaid && invoiceId) {
        // Find the transaction
        const { data: transaction } = await supabase
          .from("transactions")
          .select("*")
          .eq("payment_reference", String(invoiceId))
          .eq("payment_method", "fawaterak")
          .single();

        if (transaction && transaction.balance_after === transaction.balance_before) {
          // Payment not yet processed
          const { data: profile } = await supabase
            .from("profiles")
            .select("balance")
            .eq("user_id", transaction.user_id)
            .single();

          const currentBalance = profile?.balance || 0;
          const newBalance = currentBalance + transaction.amount;

          await supabase
            .from("profiles")
            .update({ balance: newBalance })
            .eq("user_id", transaction.user_id);

          await supabase
            .from("transactions")
            .update({
              balance_after: newBalance,
              description: `Fawaterak deposit completed - Invoice: ${invoiceId}`,
            })
            .eq("id", transaction.id);

          console.log(`Webhook: Balance updated for user ${transaction.user_id}: $${currentBalance} -> $${newBalance}`);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error: unknown) {
    console.error("Fawaterak webhook error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
