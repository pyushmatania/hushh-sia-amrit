import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  avgPerBooking: number;
  uniqueGuests: number;
  weeklyBookings: { name: string; bookings: number; revenue: number }[];
  monthlyRevenue: { name: string; revenue: number }[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  slotOccupancy: { name: string; occupied: number }[];
  topListings: { name: string; bookings: number; revenue: number }[];
  loading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Stays: "hsl(270, 80%, 65%)",
  Experiences: "hsl(160, 60%, 42%)",
  Party: "hsl(43, 96%, 56%)",
  Dining: "hsl(320, 80%, 65%)",
  Bonfire: "hsl(20, 90%, 55%)",
  Pool: "hsl(200, 80%, 55%)",
  Movie: "hsl(280, 60%, 55%)",
  Stargazing: "hsl(230, 70%, 60%)",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function useHostAnalytics(): AnalyticsData {
  const { user } = useAuth();
  const [data, setData] = useState<Omit<AnalyticsData, "loading">>({
    totalRevenue: 0,
    totalBookings: 0,
    avgPerBooking: 0,
    uniqueGuests: 0,
    weeklyBookings: [],
    monthlyRevenue: [],
    categoryBreakdown: [],
    slotOccupancy: [],
    topListings: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    // Get host's listing IDs
    const { data: listings } = await supabase
      .from("host_listings")
      .select("id, name, category")
      .eq("user_id", user.id);

    if (!listings || listings.length === 0) {
      setLoading(false);
      return;
    }

    const listingIds = listings.map((l) => l.id);

    // Get all bookings for host's listings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .in("property_id", listingIds)
      .order("created_at", { ascending: false });

    const allBookings = bookings || [];

    // Summary stats
    const totalRevenue = allBookings.reduce((sum, b) => sum + Number(b.total), 0);
    const totalBookings = allBookings.length;
    const avgPerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    const uniqueGuests = new Set(allBookings.map((b) => b.user_id)).size;

    // Weekly bookings (last 7 days)
    const now = new Date();
    const weeklyMap: Record<string, { bookings: number; revenue: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      weeklyMap[DAY_NAMES[d.getDay()]] = { bookings: 0, revenue: 0 };
    }
    allBookings.forEach((b) => {
      const d = new Date(b.created_at);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        const day = DAY_NAMES[d.getDay()];
        if (weeklyMap[day]) {
          weeklyMap[day].bookings += 1;
          weeklyMap[day].revenue += Number(b.total);
        }
      }
    });
    const weeklyBookings = Object.entries(weeklyMap).map(([name, v]) => ({ name, ...v }));

    // Monthly revenue (last 6 months)
    const monthlyMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyMap[MONTH_NAMES[d.getMonth()]] = 0;
    }
    allBookings.forEach((b) => {
      const d = new Date(b.created_at);
      const monthKey = MONTH_NAMES[d.getMonth()];
      if (monthlyMap[monthKey] !== undefined) {
        monthlyMap[monthKey] += Number(b.total);
      }
    });
    const monthlyRevenue = Object.entries(monthlyMap).map(([name, revenue]) => ({ name, revenue }));

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    allBookings.forEach((b) => {
      const listing = listings.find((l) => l.id === b.property_id);
      const cat = listing?.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const total = Object.values(categoryMap).reduce((s, v) => s + v, 0) || 1;
    const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[name] || "hsl(0, 0%, 50%)",
    }));

    // Slot occupancy (parse slot times from bookings)
    const slotMap: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    allBookings.forEach((b) => {
      const slot = (b.slot || "").toLowerCase();
      if (slot.includes("morning") || slot.includes("sunrise")) slotMap.Morning += 1;
      else if (slot.includes("afternoon") || slot.includes("lunch")) slotMap.Afternoon += 1;
      else if (slot.includes("evening") || slot.includes("sunset")) slotMap.Evening += 1;
      else if (slot.includes("night") || slot.includes("starlight")) slotMap.Night += 1;
      else slotMap.Evening += 1; // default
    });
    const maxSlot = Math.max(...Object.values(slotMap), 1);
    const slotOccupancy = Object.entries(slotMap).map(([name, count]) => ({
      name,
      occupied: Math.round((count / maxSlot) * 100),
    }));

    // Top listings
    const listingMap: Record<string, { name: string; bookings: number; revenue: number }> = {};
    allBookings.forEach((b) => {
      const listing = listings.find((l) => l.id === b.property_id);
      const key = b.property_id;
      if (!listingMap[key]) {
        listingMap[key] = { name: listing?.name || "Unknown", bookings: 0, revenue: 0 };
      }
      listingMap[key].bookings += 1;
      listingMap[key].revenue += Number(b.total);
    });
    const topListings = Object.values(listingMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setData({
      totalRevenue,
      totalBookings,
      avgPerBooking,
      uniqueGuests,
      weeklyBookings,
      monthlyRevenue,
      categoryBreakdown,
      slotOccupancy,
      topListings,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return { ...data, loading };
}
