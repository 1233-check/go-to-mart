import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function toBase64(str: string): string {
  try {
    return btoa(str);
  } catch {
    // Fallback for Deno
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const binString = Array.from(data, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Debug: log that function was called
    console.log("razorpay-create-order called");
    console.log("RAZORPAY_KEY_ID present:", !!RAZORPAY_KEY_ID);
    console.log("RAZORPAY_KEY_SECRET present:", !!RAZORPAY_KEY_SECRET);
    console.log("SUPABASE_URL:", SUPABASE_URL);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!SUPABASE_URL) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL in Deno environment" }), { status: 500 });
    }
    const safeKey = SUPABASE_SERVICE_ROLE_KEY || Deno.env.get("SUPABASE_ANON_KEY") || "dummy";
    const supabase = createClient(SUPABASE_URL, safeKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token", env_check: !!SUPABASE_URL }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.id);

    const { amount, order_id, currency = "INR", receipt } = await req.json();

    if (!amount || !order_id) {
      return new Response(JSON.stringify({ error: "amount and order_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ 
        error: "Razorpay API keys not configured",
        debug: { key_id_set: !!RAZORPAY_KEY_ID, secret_set: !!RAZORPAY_KEY_SECRET }
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountInPaise = Math.round(amount * 100);
    // Create Razorpay order
    const authString = toBase64(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const shortReceipt = receipt || order_id.substring(0, 40);
    const razorpayBody = JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: shortReceipt,
      notes: { order_id, customer_id: user.id },
    });

    console.log("Razorpay request body:", razorpayBody);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: razorpayBody,
    });

    const razorpayData = await razorpayResponse.json();
    console.log("Razorpay response status:", razorpayResponse.status);
    console.log("Razorpay response:", JSON.stringify(razorpayData));

    if (!razorpayResponse.ok) {
      return new Response(JSON.stringify({ 
        error: "Failed to create Razorpay order", 
        razorpay_error: razorpayData,
        status_code: razorpayResponse.status 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store payment record (non-blocking — don't fail if payments table doesn't exist)
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id,
      customer_id: user.id,
      razorpay_order_id: razorpayData.id,
      amount,
      currency,
      status: "created",
    });
    
    if (paymentError) {
      console.error("Payment record insert failed (non-fatal):", paymentError);
    }

    // Link razorpay order to our order
    const { error: updateError } = await supabase.from("orders").update({
      razorpay_order_id: razorpayData.id,
    }).eq("id", order_id);

    if (updateError) {
      console.error("Order update failed (non-fatal):", updateError);
    }

    return new Response(JSON.stringify({
      razorpay_order_id: razorpayData.id,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      key_id: RAZORPAY_KEY_ID,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
