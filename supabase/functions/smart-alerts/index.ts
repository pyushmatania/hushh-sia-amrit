import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [bookingsRes, ordersRes, inventoryRes, listingsRes] = await Promise.all([
      supabase.from("bookings").select("total, status, date, slot, created_at"),
      supabase.from("orders").select("total, status, created_at"),
      supabase.from("inventory").select("name, stock, low_stock_threshold, emoji, available"),
      supabase.from("host_listings").select("id, name, status"),
    ]);

    const bookings = bookingsRes.data ?? [];
    const orders = ordersRes.data ?? [];
    const inventory = inventoryRes.data ?? [];
    const listings = listingsRes.data ?? [];

    const alerts: any[] = [];

    // 1. Low bookings today
    const todayBookings = bookings.filter(b => b.date === today).length;
    if (todayBookings < 3) {
      alerts.push({
        id: "low-bookings", type: "warning", severity: "high",
        title: "Low bookings today",
        description: `Only ${todayBookings} booking(s) today. Consider a flash deal.`,
        action: "Create Flash Campaign",
        actionTarget: "campaigns",
      });
    }

    // 2. High evening demand
    const eveningBookings = bookings.filter(b => b.slot?.match(/[7-9]|10|11/)).length;
    const totalBookings = bookings.length || 1;
    if (eveningBookings / totalBookings > 0.4) {
      alerts.push({
        id: "evening-demand", type: "opportunity", severity: "medium",
        title: "High evening demand",
        description: `${Math.round((eveningBookings / totalBookings) * 100)}% bookings are evening slots. Consider premium pricing.`,
        action: "View Analytics",
        actionTarget: "analytics",
      });
    }

    // 3. Low inventory alerts
    const lowStock = inventory.filter(i => i.stock <= i.low_stock_threshold && i.available);
    if (lowStock.length > 0) {
      alerts.push({
        id: "low-inventory", type: "action", severity: "high",
        title: `${lowStock.length} item(s) running low`,
        description: lowStock.map(i => `${i.emoji} ${i.name}: ${i.stock} left`).join(", "),
        action: "Manage Inventory",
        actionTarget: "orders",
      });
    }

    // 4. Pending orders
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    if (pendingOrders > 0) {
      alerts.push({
        id: "pending-orders", type: "action", severity: pendingOrders > 5 ? "high" : "medium",
        title: `${pendingOrders} pending order(s)`,
        description: "Kitchen orders awaiting preparation.",
        action: "View Orders",
        actionTarget: "orders",
      });
    }

    // 5. Cancellation rate
    const cancelledCount = bookings.filter(b => b.status === "cancelled").length;
    const cancelRate = totalBookings > 1 ? cancelledCount / totalBookings : 0;
    if (cancelRate > 0.15) {
      alerts.push({
        id: "high-cancellations", type: "warning", severity: "high",
        title: "High cancellation rate",
        description: `${Math.round(cancelRate * 100)}% cancellation rate. Investigate causes.`,
        action: "View Bookings",
        actionTarget: "bookings",
      });
    }

    // 6. Revenue insight
    const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
    const orderRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    alerts.push({
      id: "revenue-snapshot", type: "insight", severity: "info",
      title: "Revenue snapshot",
      description: `Bookings: ₹${totalRevenue.toLocaleString()} | Orders: ₹${orderRevenue.toLocaleString()} | Total: ₹${(totalRevenue + orderRevenue).toLocaleString()}`,
    });

    // 7. Paused listings
    const pausedCount = listings.filter(l => l.status === "paused").length;
    if (pausedCount > 0) {
      alerts.push({
        id: "paused-listings", type: "action", severity: "low",
        title: `${pausedCount} listing(s) paused`,
        description: "Reactivate to maximize revenue potential.",
        action: "Manage Properties",
        actionTarget: "properties",
      });
    }

    // Predictions
    const dayMap = new Map<string, number>();
    bookings.forEach(b => {
      const day = new Date(b.created_at).toLocaleDateString("en", { weekday: "long" });
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    const sortedDays = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1]);

    const slotMap = new Map<string, number>();
    bookings.forEach(b => { if (b.slot) slotMap.set(b.slot, (slotMap.get(b.slot) || 0) + 1); });
    const sortedSlots = Array.from(slotMap.entries()).sort((a, b) => b[1] - a[1]);

    const predictions = {
      peakDay: sortedDays[0]?.[0] || "N/A",
      peakDayBookings: sortedDays[0]?.[1] || 0,
      slowDay: sortedDays[sortedDays.length - 1]?.[0] || "N/A",
      peakSlot: sortedSlots[0]?.[0] || "N/A",
      avgBookingValue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
      weeklyTrend: bookings.filter(b => b.created_at >= weekAgo).length,
    };

    return new Response(JSON.stringify({ alerts, predictions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smart-alerts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
