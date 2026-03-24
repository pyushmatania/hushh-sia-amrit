import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    if (!TELEGRAM_API_KEY)
      throw new Error("TELEGRAM_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      event_type,
      data: eventData,
      chat_id,
      use_admin_chat = false,
      use_group_chat = false,
    } = body;

    // Get config
    const { data: state } = await supabase
      .from("telegram_bot_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (!state?.notifications_enabled) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let targetChatId = chat_id || null;

    if (!targetChatId) {
      if (use_group_chat) targetChatId = state.group_chat_id;
      else if (use_admin_chat) targetChatId = state.admin_chat_id;
      else targetChatId = state.group_chat_id || state.admin_chat_id;
    }

    // Fallback: auto-detect latest customer chat from polled messages
    if (!targetChatId) {
      const { data: latestMessage } = await supabase
        .from("telegram_messages")
        .select("chat_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestMessage?.chat_id) {
        targetChatId = String(latestMessage.chat_id);

        // Persist as admin chat for future sends
        await supabase
          .from("telegram_bot_state")
          .update({ admin_chat_id: targetChatId })
          .eq("id", 1);
      }
    }

    if (!targetChatId) {
      return new Response(
        JSON.stringify({
          error: "No chat_id configured",
          hint: "Send a message to the bot once, then run Poll. Or set Admin Chat ID in Telegram config.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let message = "";

    // Booking notification
    if (event_type === "new_booking" && state.booking_alerts) {
      const b = eventData;
      message = `🎫 <b>New Booking!</b>\n\n📋 ID: <code>${b.booking_id}</code>\n👥 Guests: ${b.guests}\n📅 Date: ${b.date}\n⏰ Slot: ${b.slot}\n💰 Total: ₹${b.total}\n📍 Status: ${b.status}`;
    }

    // Booking cancelled
    else if (event_type === "booking_cancelled" && state.booking_alerts) {
      const b = eventData;
      message = `❌ <b>Booking Cancelled</b>\n\n📋 ID: <code>${b.booking_id}</code>\n📅 Date: ${b.date}\n💰 Refund: ₹${b.total}`;
    }

    // New order
    else if (event_type === "new_order" && state.order_alerts) {
      const o = eventData;
      message = `🛒 <b>New Order!</b>\n\n🆔 Order: <code>${o.id?.slice(0, 8)}</code>\n💰 Total: ₹${o.total}\n📍 Property: ${o.property_id}\n📦 Status: ${o.status}`;
    }

    // Order status update
    else if (event_type === "order_status" && state.order_alerts) {
      const o = eventData;
      const emoji =
        o.status === "completed"
          ? "✅"
          : o.status === "preparing"
          ? "👨‍🍳"
          : o.status === "ready"
          ? "🔔"
          : "📦";
      message = `${emoji} <b>Order Updated</b>\n\n🆔 <code>${o.id?.slice(0, 8)}</code> → ${o.status.toUpperCase()}`;
    }

    // Low inventory alert
    else if (event_type === "low_inventory") {
      const items = eventData.items || [];
      const lines = items.map(
        (i: any) => `⚠️ ${i.emoji} <b>${i.name}</b> — ${i.stock} left`
      );
      message = `📦 <b>Low Inventory Alert!</b>\n\n${lines.join("\n")}`;
    }

    // Daily summary
    else if (event_type === "daily_summary" && state.daily_summary) {
      const d = eventData;
      message = `📊 <b>Daily Summary — ${d.date}</b>\n\n📅 Bookings: ${d.booking_count}\n💰 Revenue: ₹${d.revenue?.toLocaleString()}\n🛒 Orders: ${d.order_count}\n👥 New Users: ${d.new_users}\n⭐ Avg Rating: ${d.avg_rating || "N/A"}`;
    }

    // Custom message
    else if (event_type === "custom") {
      message = eventData.text || "No message provided";
    }

    if (!message) {
      return new Response(
        JSON.stringify({ skipped: true, reason: `Event ${event_type} not enabled or unknown` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via gateway
    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();

    // Log
    await supabase.from("telegram_sent_log").insert({
      chat_id: String(targetChatId),
      message_type: event_type,
      message_text: message,
      status: response.ok ? "sent" : "failed",
      error: response.ok ? null : JSON.stringify(result),
    });

    return new Response(
      JSON.stringify({ success: response.ok, message_id: result.result?.message_id }),
      { status: response.ok ? 200 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("telegram-notify error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
