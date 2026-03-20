import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: string[] = [];

    // 1. Low inventory alerts → notify admins
    const { data: lowStock } = await supabase
      .from("inventory")
      .select("id, name, stock, low_stock_threshold, emoji")
      .eq("available", true);

    const criticalItems = (lowStock ?? []).filter(i => i.stock <= i.low_stock_threshold);

    // 2. Get admin user IDs
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["super_admin", "ops_manager"]);

    const adminIds = [...new Set((adminRoles ?? []).map(r => r.user_id))];

    // Send low-stock notifications
    for (const item of criticalItems) {
      for (const adminId of adminIds) {
        await supabase.from("notifications").insert({
          user_id: adminId,
          type: "inventory",
          title: `${item.emoji} Low Stock: ${item.name}`,
          body: `Only ${item.stock} units left (threshold: ${item.low_stock_threshold})`,
          icon: "📦",
          action_url: "/admin",
        });
      }
      results.push(`Low stock alert: ${item.name} (${item.stock} left)`);
    }

    // 3. Booking spike detection (>5 bookings in last hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: recentBookings, count: bookingCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact" })
      .gte("created_at", oneHourAgo);

    if ((bookingCount ?? 0) >= 5) {
      for (const adminId of adminIds) {
        await supabase.from("notifications").insert({
          user_id: adminId,
          type: "alert",
          title: "🔥 Booking Spike Detected!",
          body: `${bookingCount} bookings in the last hour. Demand is surging!`,
          icon: "🔥",
          action_url: "/admin",
        });
      }
      results.push(`Booking spike: ${bookingCount} in last hour`);
    }

    // 4. Revenue milestone checks
    const { data: allBookings } = await supabase
      .from("bookings")
      .select("total");

    const totalRevenue = (allBookings ?? []).reduce((s, b) => s + Number(b.total), 0);
    const milestones = [100000, 500000, 1000000, 5000000];

    for (const milestone of milestones) {
      if (totalRevenue >= milestone) {
        // Check if milestone notification already sent (use audit_logs)
        const milestoneKey = `revenue_milestone_${milestone}`;
        const { data: existing } = await supabase
          .from("audit_logs")
          .select("id")
          .eq("action", milestoneKey)
          .limit(1);

        if (!existing?.length) {
          // Log milestone
          await supabase.from("audit_logs").insert({
            action: milestoneKey,
            entity_type: "system",
            details: { revenue: totalRevenue, milestone },
          });

          const formatted = milestone >= 100000
            ? `₹${(milestone / 100000).toFixed(0)}L`
            : `₹${milestone.toLocaleString()}`;

          for (const adminId of adminIds) {
            await supabase.from("notifications").insert({
              user_id: adminId,
              type: "achievement",
              title: `🏆 Revenue Milestone: ${formatted}!`,
              body: `Total platform revenue crossed ${formatted}. Congratulations!`,
              icon: "🏆",
              action_url: "/admin",
            });
          }
          results.push(`Revenue milestone reached: ${formatted}`);
        }
      }
    }

    // 5. High cancellation rate alert
    const { data: recentStatuses } = await supabase
      .from("bookings")
      .select("status")
      .gte("created_at", new Date(Date.now() - 86400000).toISOString());

    const total = (recentStatuses ?? []).length;
    const cancelled = (recentStatuses ?? []).filter(b => b.status === "cancelled").length;
    const cancelRate = total > 0 ? (cancelled / total) * 100 : 0;

    if (cancelRate > 20 && total >= 5) {
      for (const adminId of adminIds) {
        await supabase.from("notifications").insert({
          user_id: adminId,
          type: "warning",
          title: "⚠️ High Cancellation Rate",
          body: `${cancelRate.toFixed(0)}% of bookings cancelled today (${cancelled}/${total})`,
          icon: "⚠️",
          action_url: "/admin",
        });
      }
      results.push(`High cancellation rate: ${cancelRate.toFixed(0)}%`);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-notifications error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
