import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, payout_method, account_details } = await req.json();

    if (!amount || !payout_method || !account_details) {
      return new Response(JSON.stringify({ error: "amount, payout_method, and account_details are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate payout method
    if (!["upi", "bank_transfer"].includes(payout_method)) {
      return new Response(JSON.stringify({ error: "payout_method must be 'upi' or 'bank_transfer'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate account details
    if (payout_method === "upi" && !account_details.upi_id) {
      return new Response(JSON.stringify({ error: "UPI ID is required for UPI payouts" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (payout_method === "bank_transfer" && (!account_details.account_number || !account_details.ifsc || !account_details.account_holder_name)) {
      return new Response(JSON.stringify({ error: "account_number, ifsc, and account_holder_name are required for bank transfers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check rider's available balance
    const { data: pendingEarnings } = await supabase
      .from("rider_earnings")
      .select("id, total_earned")
      .eq("rider_id", user.id)
      .eq("status", "pending");

    const availableBalance = (pendingEarnings || []).reduce(
      (sum: number, e: { total_earned: number }) => sum + Number(e.total_earned || 0), 0
    );

    if (amount > availableBalance) {
      return new Response(JSON.stringify({
        error: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}, Requested: ₹${amount}`,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (amount < 10) {
      return new Response(JSON.stringify({ error: "Minimum cashout amount is ₹10" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create payout request
    const { data: payout, error: payoutError } = await supabase
      .from("rider_payouts")
      .insert({
        rider_id: user.id,
        amount,
        payout_method,
        account_details,
        status: "requested",
      })
      .select()
      .single();

    if (payoutError) {
      console.error("Failed to create payout:", payoutError);
      return new Response(JSON.stringify({ error: "Failed to create payout request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark matching earnings as 'processing' up to the payout amount
    let remaining = amount;
    const earningIds: string[] = [];
    for (const earning of (pendingEarnings || [])) {
      if (remaining <= 0) break;
      earningIds.push(earning.id);
      remaining -= Number(earning.total_earned);
    }

    if (earningIds.length > 0) {
      await supabase
        .from("rider_earnings")
        .update({ status: "processing" })
        .in("id", earningIds);
    }

    // Note: Actual RazorpayX payout API integration will go here
    // once the account is activated. For now, the payout is recorded
    // and admin can process it manually from the admin panel.

    return new Response(JSON.stringify({
      success: true,
      message: "Cashout request submitted successfully. It will be processed within 24-48 hours.",
      payout_id: payout.id,
      amount,
      status: "requested",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
