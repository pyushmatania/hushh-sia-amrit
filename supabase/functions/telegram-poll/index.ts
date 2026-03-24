import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
const MAX_RUNTIME_MS = 55_000;
const MIN_REMAINING_MS = 5_000;

Deno.serve(async () => {
  const startTime = Date.now();

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

    // Read config
    const { data: state, error: stateErr } = await supabase
      .from("telegram_bot_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (stateErr || !state) {
      return new Response(
        JSON.stringify({ error: stateErr?.message || "No state found" }),
        { status: 500 }
      );
    }

    let currentOffset = state.update_offset;
    let totalProcessed = 0;

    // Command handlers
    const handleCommand = async (
      chatId: number,
      command: string
    ): Promise<string> => {
      const cmd = command.split("@")[0].toLowerCase();

      if (cmd === "/start") {
        return `🏡 <b>Welcome to Hushh Jeypore Bot!</b>\n\nI can help you with:\n/bookings — Today's bookings\n/revenue — Revenue summary\n/availability — Check availability\n/menu — View our menu\n/help — All commands\n\nYour chat ID: <code>${chatId}</code>\nSave this to configure notifications!`;
      }

      if (cmd === "/help") {
        return `📋 <b>Available Commands</b>\n\n/bookings — Today's bookings summary\n/revenue — Revenue stats\n/availability — Property availability\n/menu — Current menu items\n/status — System status\n/mychatid — Get your chat ID`;
      }

      if (cmd === "/mychatid") {
        return `🆔 Your Chat ID: <code>${chatId}</code>\n\nUse this in admin settings to receive notifications.`;
      }

      if (cmd === "/bookings") {
        const today = new Date().toISOString().split("T")[0];
        const { data: bookings, count } = await supabase
          .from("bookings")
          .select("booking_id, property_id, guests, slot, status, total", {
            count: "exact",
          })
          .eq("date", today);

        if (!bookings?.length) return `📅 No bookings for today (${today})`;

        const lines = bookings.slice(0, 10).map(
          (b) =>
            `• <b>${b.booking_id}</b> — ${b.guests} guests, ${b.slot}, ₹${b.total} [${b.status}]`
        );
        return `📅 <b>Today's Bookings (${count})</b>\n\n${lines.join("\n")}`;
      }

      if (cmd === "/revenue") {
        const today = new Date().toISOString().split("T")[0];
        const { data: todayBookings } = await supabase
          .from("bookings")
          .select("total")
          .eq("date", today);

        const todayRev = todayBookings?.reduce((s, b) => s + Number(b.total), 0) || 0;

        const { data: orders } = await supabase
          .from("orders")
          .select("total, created_at")
          .gte("created_at", `${today}T00:00:00`);

        const orderRev = orders?.reduce((s, o) => s + Number(o.total), 0) || 0;

        return `💰 <b>Revenue Summary</b>\n\n📅 Today: ₹${todayRev.toLocaleString()}\n🛒 Orders today: ₹${orderRev.toLocaleString()}\n📊 Combined: ₹${(todayRev + orderRev).toLocaleString()}`;
      }

      if (cmd === "/availability") {
        const { data: listings } = await supabase
          .from("host_listings")
          .select("name, status, capacity")
          .eq("status", "published")
          .limit(10);

        if (!listings?.length) return "🏠 No active listings found";

        const lines = listings.map(
          (l) => `• <b>${l.name}</b> — ${l.capacity} guests max`
        );
        return `🏠 <b>Active Listings</b>\n\n${lines.join("\n")}`;
      }

      if (cmd === "/menu") {
        const { data: items } = await supabase
          .from("inventory")
          .select("name, emoji, unit_price, stock, available")
          .eq("available", true)
          .eq("category", "food")
          .order("sort_order")
          .limit(15);

        if (!items?.length) return "🍽️ No menu items available";

        const lines = items.map(
          (i) => `${i.emoji} <b>${i.name}</b> — ₹${i.unit_price} (${i.stock} left)`
        );
        return `🍽️ <b>Menu</b>\n\n${lines.join("\n")}`;
      }

      if (cmd === "/status") {
        const { count: bookingCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "upcoming");

        const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        return `🟢 <b>System Status</b>\n\n📋 Upcoming bookings: ${bookingCount || 0}\n🛒 Pending orders: ${orderCount || 0}\n⏰ Last poll: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;
      }

      return `❓ Unknown command. Type /help for available commands.`;
    };

    // Polling loop
    while (true) {
      const elapsed = Date.now() - startTime;
      const remainingMs = MAX_RUNTIME_MS - elapsed;
      if (remainingMs < MIN_REMAINING_MS) break;

      const timeout = Math.min(50, Math.floor(remainingMs / 1000) - 5);
      if (timeout < 1) break;

      const response = await fetch(`${GATEWAY_URL}/getUpdates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TELEGRAM_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offset: currentOffset,
          timeout,
          allowed_updates: ["message"],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return new Response(JSON.stringify({ error: data }), { status: 502 });
      }

      const updates = data.result ?? [];
      if (updates.length === 0) continue;

      // Process each update
      for (const update of updates) {
        if (!update.message) continue;

        const msg = update.message;
        const chatId = msg.chat.id;
        const text = msg.text || "";
        const isCommand = text.startsWith("/");

        // Store message
        await supabase.from("telegram_messages").upsert(
          {
            update_id: update.update_id,
            chat_id: chatId,
            from_username: msg.from?.username || "",
            from_first_name: msg.from?.first_name || "",
            message_text: text,
            message_type: msg.photo ? "photo" : msg.document ? "document" : "text",
            is_command: isCommand,
            raw_update: update,
          },
          { onConflict: "update_id" }
        );

        // Handle commands
        if (isCommand) {
          const reply = await handleCommand(chatId, text);
          await fetch(`${GATEWAY_URL}/sendMessage`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": TELEGRAM_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: reply,
              parse_mode: "HTML",
            }),
          });

          await supabase
            .from("telegram_messages")
            .update({ replied: true, reply_text: reply })
            .eq("update_id", update.update_id);
        }
        // Auto-reply for non-command messages
        else if (state.auto_reply_enabled && state.auto_reply_message) {
          await fetch(`${GATEWAY_URL}/sendMessage`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": TELEGRAM_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: state.auto_reply_message,
              parse_mode: "HTML",
            }),
          });

          await supabase
            .from("telegram_messages")
            .update({ replied: true, reply_text: state.auto_reply_message })
            .eq("update_id", update.update_id);
        }

        totalProcessed++;
      }

      // Advance offset
      const newOffset =
        Math.max(...updates.map((u: any) => u.update_id)) + 1;

      await supabase
        .from("telegram_bot_state")
        .update({
          update_offset: newOffset,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      currentOffset = newOffset;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed: totalProcessed,
        finalOffset: currentOffset,
      })
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("telegram-poll error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
