import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get admin chat id
    const { data: state } = await supabase
      .from("telegram_bot_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (!state?.daily_summary || !state?.notifications_enabled) {
      return new Response(JSON.stringify({ skipped: true, reason: "Daily summary disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let adminChatId = state.admin_chat_id;

    // Fallback: auto-detect latest chat from polled messages
    if (!adminChatId) {
      const { data: latestMessage } = await supabase
        .from("telegram_messages")
        .select("chat_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestMessage?.chat_id) {
        adminChatId = String(latestMessage.chat_id);
        await supabase
          .from("telegram_bot_state")
          .update({ admin_chat_id: adminChatId })
          .eq("id", 1);
      }
    }

    if (!adminChatId) {
      return new Response(JSON.stringify({ error: "No admin_chat_id configured", hint: "Send a message to the bot and run Poll once, or set Admin Chat ID in config." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Today's date range (IST = UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const todayIST = istNow.toISOString().split("T")[0];

    // Yesterday for comparison
    const yesterday = new Date(istNow);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIST = yesterday.toISOString().split("T")[0];

    // Today's bookings
    const { data: todayBookings } = await supabase
      .from("bookings")
      .select("total, status, user_id")
      .gte("created_at", `${todayIST}T00:00:00+05:30`)
      .lt("created_at", `${todayIST}T23:59:59+05:30`);

    const bookings = todayBookings || [];
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status !== "cancelled").length;
    const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;
    const bookingRevenue = bookings
      .filter(b => b.status !== "cancelled")
      .reduce((s, b) => s + Number(b.total), 0);
    const uniqueGuests = new Set(bookings.map(b => b.user_id)).size;

    // Today's orders
    const { data: todayOrders } = await supabase
      .from("orders")
      .select("total, status")
      .gte("created_at", `${todayIST}T00:00:00+05:30`)
      .lt("created_at", `${todayIST}T23:59:59+05:30`);

    const orders = todayOrders || [];
    const totalOrders = orders.length;
    const orderRevenue = orders.reduce((s, o) => s + Number(o.total), 0);

    // New users today
    const { count: newUsers } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", `${todayIST}T00:00:00+05:30`)
      .lt("created_at", `${todayIST}T23:59:59+05:30`);

    // Today's reviews
    const { data: todayReviews } = await supabase
      .from("reviews")
      .select("rating")
      .gte("created_at", `${todayIST}T00:00:00+05:30`)
      .lt("created_at", `${todayIST}T23:59:59+05:30`);

    const reviews = todayReviews || [];
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "N/A";

    // Low inventory items
    const { data: lowStock } = await supabase
      .from("inventory")
      .select("name, stock, low_stock_threshold, emoji")
      .eq("available", true)
      .filter("stock", "lte", "low_stock_threshold");

    const totalRevenue = bookingRevenue + orderRevenue;

    const fmt = (v: number) => {
      if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
      if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
      return `₹${v.toLocaleString("en-IN")}`;
    };

    // Build message
    let message = `📊 <b>Daily Summary — ${todayIST}</b>\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;

    message += `💰 <b>Revenue</b>\n`;
    message += `  📅 Bookings: ${fmt(bookingRevenue)}\n`;
    message += `  🛒 Orders: ${fmt(orderRevenue)}\n`;
    message += `  💎 Total: <b>${fmt(totalRevenue)}</b>\n\n`;

    message += `📋 <b>Bookings</b>\n`;
    message += `  ✅ Confirmed: ${confirmedBookings}\n`;
    message += `  ❌ Cancelled: ${cancelledBookings}\n`;
    message += `  📊 Total: ${totalBookings}\n\n`;

    message += `📦 <b>Orders:</b> ${totalOrders}\n`;
    message += `👥 <b>New Users:</b> ${newUsers || 0}\n`;
    message += `👤 <b>Unique Guests:</b> ${uniqueGuests}\n`;
    message += `⭐ <b>Avg Rating:</b> ${avgRating} (${reviews.length} reviews)\n`;

    if (lowStock && lowStock.length > 0) {
      message += `\n⚠️ <b>Low Stock Alert</b>\n`;
      lowStock.forEach((item: any) => {
        message += `  ${item.emoji} ${item.name}: ${item.stock} left\n`;
      });
    }

    message += `\n🕘 <i>Generated at 9:00 PM IST</i>`;

    // Send to admin only
    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();

    // Log
    await supabase.from("telegram_sent_log").insert({
      chat_id: String(adminChatId),
      message_type: "daily_summary",
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
    console.error("telegram-daily-summary error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
