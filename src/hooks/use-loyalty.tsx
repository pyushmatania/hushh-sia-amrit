import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { mockLoyaltyTransactions } from "@/data/mock-users";
import { useDataMode } from "./use-data-mode";

export interface LoyaltyTransaction {
  id: string;
  type: "earn" | "redeem";
  title: string;
  points: number;
  icon: string;
  created_at: string;
}

export interface LoyaltyData {
  points: number;
  tier: string;
  transactions: LoyaltyTransaction[];
  loading: boolean;
  awardPoints: (points: number, title: string, icon?: string) => Promise<void>;
  redeemPoints: (points: number, title: string, icon?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useLoyalty(): LoyaltyData {
  const { user } = useAuth();
  const { isRealMode } = useDataMode();
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState("Silver");
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      if (isRealMode) {
        setPoints(0);
        setTier("Silver");
        setTransactions([]);
      } else {
        setPoints(320);
        setTier("Gold");
        setTransactions(mockLoyaltyTransactions);
      }
      setLoading(false);
      return;
    }

    const [profileRes, txRes] = await Promise.all([
      supabase.from("profiles").select("loyalty_points, tier").eq("user_id", user.id).maybeSingle(),
      supabase.from("loyalty_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);

    if (profileRes.data) {
      setPoints(profileRes.data.loyalty_points);
      setTier(profileRes.data.tier);
    }

    if (txRes.data) {
      setTransactions(
        txRes.data.map((t: any) => ({
          id: t.id,
          type: t.type as "earn" | "redeem",
          title: t.title,
          points: t.points,
          icon: t.icon,
          created_at: t.created_at,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const awardPoints = useCallback(async (pts: number, title: string, icon = "⭐") => {
    if (!user) return;
    await supabase.rpc("award_loyalty_points", {
      _user_id: user.id,
      _points: pts,
      _title: title,
      _icon: icon,
    });
    await refresh();
  }, [user, refresh]);

  const redeemPoints = useCallback(async (pts: number, title: string, icon = "🎁"): Promise<boolean> => {
    if (!user) {
      // Guest mode — simulate redeem
      if (pts > points) return false;
      setPoints(p => p - pts);
      setTransactions(prev => [
        { id: `mock-${Date.now()}`, type: "redeem", title, points: -pts, icon, created_at: new Date().toISOString() },
        ...prev,
      ]);
      return true;
    }
    const { data } = await supabase.rpc("redeem_loyalty_points", {
      _user_id: user.id,
      _points: pts,
      _title: title,
      _icon: icon,
    });
    await refresh();
    return data === true;
  }, [user, refresh, points]);

  return { points, tier, transactions, loading, awardPoints, redeemPoints, refresh };
}
