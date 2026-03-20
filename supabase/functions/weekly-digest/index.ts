import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekAgoStr = weekAgo.toISOString();

    // Fetch this week's data
    const [bookingsRes, ordersRes, usersRes, reviewsRes] = await Promise.all([
      supabase.from("bookings").select("total, status, created_at").gte("created_at", weekAgoStr),
      supabase.from("orders").select("total, status, created_at").gte("created_at", weekAgoStr),
      supabase.from("profiles").select("id, created_at").gte("created_at", weekAgoStr),
      supabase.from("reviews").select("rating, created_at").gte("created_at", weekAgoStr),
    ]);

    const bookings = bookingsRes.data ?? [];
    const orders = ordersRes.data ?? [];
    const newUsers = usersRes.data ?? [];
    const reviews = reviewsRes.data ?? [];

    const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
    const orderRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const confirmedBookings = bookings.filter(b => b.status !== "cancelled").length;
    const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "N/A";

    const digest = {
      period: `${weekAgo.toLocaleDateString("en-IN")} – ${now.toLocaleDateString("en-IN")}`,
      metrics: {
        bookingRevenue: totalRevenue,
        orderRevenue,
        totalRevenue: totalRevenue + orderRevenue,
        totalBookings: bookings.length,
        confirmedBookings,
        cancelledBookings,
        cancellationRate: bookings.length > 0
          ? `${((cancelledBookings / bookings.length) * 100).toFixed(1)}%`
          : "0%",
        newUsers: newUsers.length,
        totalOrders: orders.length,
        avgRating,
        reviewCount: reviews.length,
      },
      highlights: [] as string[],
    };

    // Generate highlights
    if (totalRevenue > 100000) digest.highlights.push(`🎉 Booking revenue crossed ₹1L this week!`);
    if (cancelledBookings === 0) digest.highlights.push("✅ Zero cancellations this week!");
    if (newUsers.length > 10) digest.highlights.push(`👥 ${newUsers.length} new users joined!`);
    if (reviews.length > 0 && Number(avgRating) >= 4.5) digest.highlights.push(`⭐ Average rating ${avgRating}/5`);
    if (digest.highlights.length === 0) digest.highlights.push("📊 Steady week — keep pushing!");

    // Store digest as a notification for admins
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["super_admin", "ops_manager"]);

    const summaryText = `Weekly: ₹${(digest.metrics.totalRevenue / 1000).toFixed(1)}K revenue, ${digest.metrics.totalBookings} bookings, ${digest.metrics.newUsers} new users`;

    for (const admin of admins ?? []) {
      await supabase.from("notifications").insert({
        user_id: admin.user_id,
        type: "digest",
        title: "📊 Weekly Digest",
        body: summaryText,
        icon: "📊",
      });
    }

    return new Response(JSON.stringify(digest), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
