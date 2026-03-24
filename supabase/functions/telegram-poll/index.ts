import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
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

    // --- AI Business Query Handler ---
    const handleAIQuery = async (question: string): Promise<string> => {
      try {
        // Gather business context from database
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);
        const todayIST = istNow.toISOString().split("T")[0];

        // Last 7 days
        const weekAgo = new Date(istNow);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoIST = weekAgo.toISOString().split("T")[0];

        // Last 30 days
        const monthAgo = new Date(istNow);
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthAgoIST = monthAgo.toISOString().split("T")[0];

        // Fetch data in parallel
        const [
          { data: recentBookings },
          { data: recentOrders },
          { data: inventory },
          { count: totalUsers },
          { data: recentReviews },
          { data: listings },
          { data: todayBookings },
        ] = await Promise.all([
          supabase.from("bookings").select("booking_id, date, guests, slot, total, status, property_id, created_at").gte("date", weekAgoIST).order("created_at", { ascending: false }).limit(50),
          supabase.from("orders").select("id, total, status, property_id, created_at").gte("created_at", `${weekAgoIST}T00:00:00`).order("created_at", { ascending: false }).limit(50),
          supabase.from("inventory").select("name, emoji, stock, low_stock_threshold, unit_price, available, category").eq("available", true).limit(50),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("reviews").select("rating, content, property_id, created_at").gte("created_at", `${monthAgoIST}T00:00:00`).order("created_at", { ascending: false }).limit(20),
          supabase.from("host_listings").select("name, status, base_price, capacity, category, rating, review_count").eq("status", "published").limit(20),
          supabase.from("bookings").select("total, status, guests").eq("date", todayIST),
        ]);

        // Calculate summaries
        const weekBookings = recentBookings || [];
        const weekRevenue = weekBookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + Number(b.total), 0);
        const weekOrders = recentOrders || [];
        const weekOrderRevenue = weekOrders.reduce((s, o) => s + Number(o.total), 0);
        const todayRev = (todayBookings || []).filter(b => b.status !== "cancelled").reduce((s, b) => s + Number(b.total), 0);
        const todayOrderRev = weekOrders.filter(o => o.created_at >= `${todayIST}T00:00:00`).reduce((s, o) => s + Number(o.total), 0);
        const lowStockItems = (inventory || []).filter(i => i.stock <= i.low_stock_threshold);
        const avgRating = (recentReviews || []).length > 0 ? ((recentReviews || []).reduce((s, r) => s + r.rating, 0) / (recentReviews || []).length).toFixed(1) : "N/A";

        const context = `
BUSINESS DATA (as of ${todayIST}, IST timezone):

TODAY:
- Bookings today: ${(todayBookings || []).length} (Revenue: ₹${todayRev.toLocaleString("en-IN")})
- Orders today: ${weekOrders.filter(o => o.created_at >= `${todayIST}T00:00:00`).length} (Revenue: ₹${todayOrderRev.toLocaleString("en-IN")})
- Total today: ₹${(todayRev + todayOrderRev).toLocaleString("en-IN")}

LAST 7 DAYS:
- Bookings: ${weekBookings.length} (Revenue: ₹${weekRevenue.toLocaleString("en-IN")})
- Orders: ${weekOrders.length} (Revenue: ₹${weekOrderRevenue.toLocaleString("en-IN")})
- Combined revenue: ₹${(weekRevenue + weekOrderRevenue).toLocaleString("en-IN")}
- Cancelled bookings: ${weekBookings.filter(b => b.status === "cancelled").length}

PROPERTIES:
${(listings || []).map(l => `- ${l.name}: ₹${l.base_price}/slot, capacity ${l.capacity}, rating ${l.rating} (${l.review_count} reviews)`).join("\n")}

INVENTORY (${(inventory || []).length} items):
- Low stock alerts: ${lowStockItems.length > 0 ? lowStockItems.map(i => `${i.emoji} ${i.name}: ${i.stock} left`).join(", ") : "None"}

USERS: ${totalUsers || 0} registered
REVIEWS: Avg rating ${avgRating} from ${(recentReviews || []).length} recent reviews

RECENT BOOKINGS:
${weekBookings.slice(0, 10).map(b => `- ${b.booking_id}: ${b.date}, ${b.guests} guests, ₹${b.total}, ${b.status}`).join("\n")}
`;

        const aiResponse = await fetch(AI_GATEWAY_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are the AI business assistant for Hushh Jeypore, a premium hospitality venue. You answer the admin's questions about business performance using ONLY the provided data. Keep answers concise, use emojis, format for Telegram (HTML tags: <b>bold</b>, <i>italic</i>, <code>code</code>). Use ₹ for currency. If the data doesn't cover the question, say so honestly. Never make up numbers.`,
              },
              {
                role: "user",
                content: `${context}\n\nADMIN QUESTION: ${question}`,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error("AI gateway error:", aiResponse.status, errText);
          if (aiResponse.status === 429) return "⏳ AI is busy right now. Try again in a moment.";
          if (aiResponse.status === 402) return "⚠️ AI credits exhausted. Contact admin to top up.";
          return "❌ AI is temporarily unavailable. Use /help for standard commands.";
        }

        const aiData = await aiResponse.json();
        const reply = aiData.choices?.[0]?.message?.content;
        if (!reply) return "🤔 I couldn't generate a response. Try rephrasing your question.";

        return reply;
      } catch (err) {
        console.error("AI query error:", err);
        return "❌ Error processing your question. Try a /command instead.";
      }
    };

    // Command handlers
    const handleCommand = async (
      chatId: number,
      command: string,
      fullText: string
    ): Promise<string> => {
      const parts = fullText.trim().split(/\s+/);
      const cmd = parts[0].split("@")[0].toLowerCase();
      const args = parts.slice(1).join(" ");
      const isAdmin = state.admin_chat_id && String(chatId) === String(state.admin_chat_id);

      if (cmd === "/start") {
        let msg = `🏡 <b>Welcome to Hushh Jeypore Bot!</b>\n\nYour chat ID: <code>${chatId}</code>\n\nType /help to see all commands.`;
        if (isAdmin) {
          msg += `\n\n🔑 <b>Admin mode active!</b>\nYou can also ask me anything in plain text — I'll use AI to answer from your live business data.`;
        }
        return msg;
      }

      if (cmd === "/help") {
        let msg = `📋 <b>Available Commands</b>\n\n📊 <b>Quick Info</b>\n/bookings — Today's bookings\n/revenue — Revenue stats\n/availability — Listings\n/menu — Menu items\n/status — System status\n/mychatid — Your chat ID`;
        if (isAdmin) {
          msg += `\n\n🔐 <b>Admin Commands</b>\n/alerts — 🚨 Critical alerts dashboard\n/staff — 👥 Staff overview\n/top — 🏆 Top customers\n/expenses — 💸 Expense summary\n/lowstock — 📦 Low inventory\n/tasks — ✅ Pending tasks\n/reviews — ⭐ Recent reviews\n/report — 📈 Full business report\n/confirm <id> — ✅ Confirm booking\n/cancel <id> — ❌ Cancel booking\n/broadcast <msg> — 📢 Send to group\n\n💡 Or just type any question!\n<i>"What was last week's revenue?"</i>`;
        }
        return msg;
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

      // ===== ADMIN-ONLY COMMANDS =====
      if (!isAdmin) return `❓ Unknown command. Type /help for available commands.`;

      // /alerts — Critical alerts dashboard
      if (cmd === "/alerts") {
        const [
          { data: lowStock },
          { count: pendingOrders },
          { data: pendingTasks },
          { data: pendingLeaves },
          { count: unconfirmedBookings },
        ] = await Promise.all([
          supabase.from("inventory").select("name, emoji, stock, low_stock_threshold").eq("available", true).filter("stock", "lte", "low_stock_threshold"),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("staff_tasks").select("title, priority").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
          supabase.from("staff_leaves").select("staff_id, leave_type, start_date, end_date").eq("status", "pending").limit(5),
          supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "upcoming").eq("payment_status", "unpaid"),
        ]);

        let msg = `🚨 <b>Alerts Dashboard</b>\n━━━━━━━━━━━━━━━━━\n\n`;

        const hasAlerts = (lowStock?.length || 0) + (pendingOrders || 0) + (pendingTasks?.length || 0) + (pendingLeaves?.length || 0) + (unconfirmedBookings || 0);
        if (!hasAlerts) return `✅ <b>All Clear!</b>\nNo critical alerts right now. 🎉`;

        if (pendingOrders) msg += `🛒 <b>${pendingOrders} pending orders</b> need attention\n\n`;
        if (unconfirmedBookings) msg += `💳 <b>${unconfirmedBookings} unpaid bookings</b> awaiting payment\n\n`;

        if (lowStock?.length) {
          msg += `📦 <b>Low Stock (${lowStock.length})</b>\n`;
          lowStock.forEach((i: any) => { msg += `  ⚠️ ${i.emoji} ${i.name}: <b>${i.stock}</b> left (min: ${i.low_stock_threshold})\n`; });
          msg += `\n`;
        }

        if (pendingTasks?.length) {
          msg += `✅ <b>Pending Tasks (${pendingTasks.length})</b>\n`;
          pendingTasks.forEach((t: any) => {
            const pri = t.priority === "high" ? "🔴" : t.priority === "medium" ? "🟡" : "🟢";
            msg += `  ${pri} ${t.title}\n`;
          });
          msg += `\n`;
        }

        if (pendingLeaves?.length) {
          msg += `🏖️ <b>Leave Requests (${pendingLeaves.length})</b>\n`;
          pendingLeaves.forEach((l: any) => { msg += `  📋 ${l.leave_type}: ${l.start_date} → ${l.end_date}\n`; });
        }

        return msg;
      }

      // /staff — Staff overview
      if (cmd === "/staff") {
        const today = new Date().toISOString().split("T")[0];
        const [{ data: members }, { data: attendance }] = await Promise.all([
          supabase.from("staff_members").select("id, name, role, department, status").eq("status", "active"),
          supabase.from("staff_attendance").select("staff_id, status, check_in").eq("date", today),
        ]);

        if (!members?.length) return `👥 No active staff members found.`;

        const attendanceMap = new Map((attendance || []).map((a: any) => [a.staff_id, a]));
        let present = 0, absent = 0, late = 0;

        let msg = `👥 <b>Staff Overview</b> (${today})\n━━━━━━━━━━━━━━━━━\n\n`;
        members.forEach((m: any) => {
          const att = attendanceMap.get(m.id);
          let status = "⬜ Not marked";
          if (att) {
            if (att.status === "present") { status = "🟢 Present"; present++; }
            else if (att.status === "absent") { status = "🔴 Absent"; absent++; }
            else if (att.status === "late") { status = "🟡 Late"; late++; }
            else { status = `⬜ ${att.status}`; }
          }
          msg += `${status} <b>${m.name}</b> — ${m.role}\n`;
        });
        msg += `\n📊 Present: ${present} | Absent: ${absent} | Late: ${late} | Total: ${members.length}`;
        return msg;
      }

      // /top — Top customers
      if (cmd === "/top") {
        const { data: bookings } = await supabase.from("bookings").select("user_id, total, status").neq("status", "cancelled");
        if (!bookings?.length) return `🏆 No bookings data for leaderboard.`;

        const userTotals = new Map<string, { count: number; revenue: number }>();
        bookings.forEach((b: any) => {
          const cur = userTotals.get(b.user_id) || { count: 0, revenue: 0 };
          cur.count++;
          cur.revenue += Number(b.total);
          userTotals.set(b.user_id, cur);
        });

        const sorted = [...userTotals.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10);
        const userIds = sorted.map(([id]) => id);
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, tier").in("user_id", userIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        let msg = `🏆 <b>Top Customers</b>\n━━━━━━━━━━━━━━━━━\n\n`;
        sorted.forEach(([uid, data], i) => {
          const p = profileMap.get(uid);
          const name = p?.display_name || uid.slice(0, 8);
          const tier = p?.tier ? ` [${p.tier}]` : "";
          msg += `${medals[i]} <b>${name}</b>${tier}\n   ₹${data.revenue.toLocaleString("en-IN")} · ${data.count} bookings\n\n`;
        });
        return msg;
      }

      // /expenses — Expense summary
      if (cmd === "/expenses") {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);
        const thisMonth = istNow.toISOString().slice(0, 7);

        const { data: expenses } = await supabase.from("expenses").select("title, amount, category, date").gte("date", `${thisMonth}-01`).order("date", { ascending: false }).limit(20);
        if (!expenses?.length) return `💸 No expenses recorded this month.`;

        const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
        const byCategory = new Map<string, number>();
        expenses.forEach((e: any) => { byCategory.set(e.category, (byCategory.get(e.category) || 0) + Number(e.amount)); });

        let msg = `💸 <b>Expenses — ${thisMonth}</b>\n━━━━━━━━━━━━━━━━━\n\n`;
        msg += `💰 <b>Total: ₹${total.toLocaleString("en-IN")}</b>\n\n`;
        msg += `📊 <b>By Category</b>\n`;
        [...byCategory.entries()].sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
          msg += `  • ${cat}: ₹${amt.toLocaleString("en-IN")}\n`;
        });
        msg += `\n📝 <b>Recent</b>\n`;
        expenses.slice(0, 5).forEach((e: any) => { msg += `  • ${e.title} — ₹${Number(e.amount).toLocaleString("en-IN")} (${e.date})\n`; });
        return msg;
      }

      // /lowstock — Low inventory
      if (cmd === "/lowstock") {
        const { data: items } = await supabase.from("inventory").select("name, emoji, stock, low_stock_threshold, unit_price, category").eq("available", true).filter("stock", "lte", "low_stock_threshold");
        if (!items?.length) return `✅ <b>All stocked up!</b>\nNo low inventory items. 🎉`;

        let msg = `📦 <b>Low Stock Items (${items.length})</b>\n━━━━━━━━━━━━━━━━━\n\n`;
        items.forEach((i: any) => {
          const urgency = i.stock === 0 ? "🔴" : i.stock <= i.low_stock_threshold / 2 ? "🟠" : "🟡";
          msg += `${urgency} ${i.emoji} <b>${i.name}</b>\n   Stock: ${i.stock} / Min: ${i.low_stock_threshold} · ₹${i.unit_price}\n\n`;
        });
        return msg;
      }

      // /tasks — Pending tasks
      if (cmd === "/tasks") {
        const { data: tasks } = await supabase.from("staff_tasks").select("title, priority, status, due_date, description").in("status", ["pending", "in_progress"]).order("priority").limit(15);
        if (!tasks?.length) return `✅ <b>No pending tasks!</b> Everything is done. 🎉`;

        let msg = `✅ <b>Active Tasks (${tasks.length})</b>\n━━━━━━━━━━━━━━━━━\n\n`;
        tasks.forEach((t: any) => {
          const pri = t.priority === "high" ? "🔴" : t.priority === "medium" ? "🟡" : "🟢";
          const st = t.status === "in_progress" ? "🔄" : "⏳";
          msg += `${pri}${st} <b>${t.title}</b>\n`;
          if (t.due_date) msg += `   📅 Due: ${t.due_date}\n`;
          msg += `\n`;
        });
        return msg;
      }

      // /reviews — Recent reviews
      if (cmd === "/reviews") {
        const { data: reviews } = await supabase.from("reviews").select("rating, content, property_id, created_at").order("created_at", { ascending: false }).limit(10);
        if (!reviews?.length) return `⭐ No reviews yet.`;

        const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
        let msg = `⭐ <b>Recent Reviews</b> (Avg: ${avg})\n━━━━━━━━━━━━━━━━━\n\n`;
        reviews.slice(0, 5).forEach((r: any) => {
          const stars = "⭐".repeat(Math.min(r.rating, 5));
          const snippet = r.content?.slice(0, 80) || "No comment";
          msg += `${stars}\n<i>"${snippet}${r.content?.length > 80 ? "..." : ""}"</i>\n\n`;
        });
        return msg;
      }

      // /report — Full business report
      if (cmd === "/report") {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);
        const todayIST = istNow.toISOString().split("T")[0];
        const weekAgo = new Date(istNow);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoIST = weekAgo.toISOString().split("T")[0];

        const [
          { data: weekBookings },
          { data: weekOrders },
          { count: totalUsers },
          { data: lowStock },
          { data: weekReviews },
        ] = await Promise.all([
          supabase.from("bookings").select("total, status, guests").gte("date", weekAgoIST),
          supabase.from("orders").select("total, status").gte("created_at", `${weekAgoIST}T00:00:00`),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("inventory").select("name").eq("available", true).filter("stock", "lte", "low_stock_threshold"),
          supabase.from("reviews").select("rating").gte("created_at", `${weekAgoIST}T00:00:00`),
        ]);

        const bk = weekBookings || [];
        const confirmed = bk.filter(b => b.status !== "cancelled");
        const bkRev = confirmed.reduce((s, b) => s + Number(b.total), 0);
        const totalGuests = confirmed.reduce((s, b) => s + b.guests, 0);
        const ord = weekOrders || [];
        const ordRev = ord.reduce((s, o) => s + Number(o.total), 0);
        const avgRev = confirmed.length > 0 ? Math.round(bkRev / confirmed.length) : 0;
        const rv = weekReviews || [];
        const avgRating = rv.length ? (rv.reduce((s, r) => s + r.rating, 0) / rv.length).toFixed(1) : "N/A";

        let msg = `📈 <b>Weekly Business Report</b>\n📅 ${weekAgoIST} → ${todayIST}\n━━━━━━━━━━━━━━━━━\n\n`;
        msg += `💰 <b>Revenue</b>\n`;
        msg += `  📅 Bookings: ₹${bkRev.toLocaleString("en-IN")}\n`;
        msg += `  🛒 Orders: ₹${ordRev.toLocaleString("en-IN")}\n`;
        msg += `  💎 Total: <b>₹${(bkRev + ordRev).toLocaleString("en-IN")}</b>\n\n`;
        msg += `📋 <b>Bookings</b>\n`;
        msg += `  ✅ Confirmed: ${confirmed.length}\n`;
        msg += `  ❌ Cancelled: ${bk.length - confirmed.length}\n`;
        msg += `  👥 Total guests: ${totalGuests}\n`;
        msg += `  💵 Avg booking: ₹${avgRev.toLocaleString("en-IN")}\n\n`;
        msg += `📦 Orders: ${ord.length}\n`;
        msg += `👤 Total users: ${totalUsers || 0}\n`;
        msg += `⭐ Avg rating: ${avgRating} (${rv.length} reviews)\n`;
        msg += `⚠️ Low stock items: ${lowStock?.length || 0}\n`;
        msg += `\n🕘 <i>Generated ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</i>`;
        return msg;
      }

      // /confirm <booking_id> — Confirm a booking
      if (cmd === "/confirm") {
        if (!args) return `⚠️ Usage: /confirm <booking_id>\nExample: /confirm HJ-2024-001`;
        const { data: booking, error: bErr } = await supabase.from("bookings").select("booking_id, status, date, guests, total").eq("booking_id", args.toUpperCase()).maybeSingle();
        if (bErr || !booking) return `❌ Booking <code>${args}</code> not found.`;
        if (booking.status === "confirmed") return `✅ Booking <code>${booking.booking_id}</code> is already confirmed.`;

        const { error: uErr } = await supabase.from("bookings").update({ status: "confirmed" }).eq("booking_id", args.toUpperCase());
        if (uErr) return `❌ Failed to confirm: ${uErr.message}`;

        await supabase.from("audit_logs").insert({ action: "booking_confirmed_via_telegram", entity_type: "booking", entity_id: booking.booking_id, details: { confirmed_by: "admin_telegram", chat_id: chatId } });
        return `✅ <b>Booking Confirmed!</b>\n\n📋 ID: <code>${booking.booking_id}</code>\n📅 Date: ${booking.date}\n👥 Guests: ${booking.guests}\n💰 Total: ₹${booking.total}`;
      }

      // /cancel <booking_id> — Cancel a booking
      if (cmd === "/cancel") {
        if (!args) return `⚠️ Usage: /cancel <booking_id>\nExample: /cancel HJ-2024-001`;
        const { data: booking, error: bErr } = await supabase.from("bookings").select("booking_id, status, date, total").eq("booking_id", args.toUpperCase()).maybeSingle();
        if (bErr || !booking) return `❌ Booking <code>${args}</code> not found.`;
        if (booking.status === "cancelled") return `⚠️ Booking <code>${booking.booking_id}</code> is already cancelled.`;

        const { error: uErr } = await supabase.from("bookings").update({ status: "cancelled" }).eq("booking_id", args.toUpperCase());
        if (uErr) return `❌ Failed to cancel: ${uErr.message}`;

        await supabase.from("audit_logs").insert({ action: "booking_cancelled_via_telegram", entity_type: "booking", entity_id: booking.booking_id, details: { cancelled_by: "admin_telegram", chat_id: chatId } });
        return `❌ <b>Booking Cancelled</b>\n\n📋 ID: <code>${booking.booking_id}</code>\n📅 Date: ${booking.date}\n💰 Refund: ₹${booking.total}`;
      }

      // /broadcast <message> — Send to group chat
      if (cmd === "/broadcast") {
        if (!args) return `⚠️ Usage: /broadcast <message>\nExample: /broadcast Happy Diwali! 🪔 Special offers inside.`;
        const groupId = state.group_chat_id;
        if (!groupId) return `⚠️ No group chat configured. Set Group Chat ID in admin settings.`;

        await fetch(`${GATEWAY_URL}/sendMessage`, {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": TELEGRAM_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: groupId, text: `📢 <b>Announcement</b>\n\n${args}`, parse_mode: "HTML" }),
        });

        await supabase.from("telegram_sent_log").insert({ chat_id: groupId, message_type: "broadcast", message_text: args, status: "sent" });
        return `📢 <b>Broadcast sent!</b>\nMessage delivered to group chat.`;
      }

      return `❓ Unknown command. Type /help for all commands.`;
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
          const reply = await handleCommand(chatId, text, text);
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
        // AI-powered reply for admin messages (non-command)
        else if (
          state.admin_chat_id &&
          String(chatId) === String(state.admin_chat_id) &&
          text.trim().length > 2
        ) {
          const aiReply = await handleAIQuery(text);
          await fetch(`${GATEWAY_URL}/sendMessage`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": TELEGRAM_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: aiReply,
              parse_mode: "HTML",
            }),
          });

          await supabase
            .from("telegram_messages")
            .update({ replied: true, reply_text: aiReply })
            .eq("update_id", update.update_id);
        }
        // Auto-reply for non-admin messages
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
