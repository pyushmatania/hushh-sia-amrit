import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface ReferralCode {
  id: string;
  code: string;
  uses: number;
  reward_points: number;
  created_at: string;
}

export function useReferrals() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [totalReferred, setTotalReferred] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchReferral = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setReferralCode(data as ReferralCode);

      const { count } = await supabase
        .from("referral_uses")
        .select("*", { count: "exact", head: true })
        .eq("referrer_user_id", user.id);
      setTotalReferred(count || 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchReferral(); }, [fetchReferral]);

  const generateCode = useCallback(async () => {
    if (!user) return;
    const code = `HUSHH-${user.id.slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const { data } = await supabase
      .from("referral_codes")
      .insert({ user_id: user.id, code })
      .select()
      .maybeSingle();

    if (data) {
      setReferralCode(data as ReferralCode);
    }
  }, [user]);

  return { referralCode, totalReferred, loading, generateCode };
}
