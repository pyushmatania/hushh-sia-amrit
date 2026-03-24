import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppConfig {
  extra_mattress_price: number;
  room_capacity: number;
  platform_fee: number;
  service_fee_percent: number;
  coupon_discount_percent: number;
  max_mattresses_per_room: number;
  cleaning_fee: number;
  gst_percent: number;
  free_cancel_hours: number;
  partial_refund_percent: number;
  partial_refund_hours: number;
  min_booking_advance_hours: number;
  check_in_time: string;
  check_out_time: string;
  support_phone: string;
  support_email: string;
  whatsapp_number: string;
  max_guests_per_booking: number;
  loyalty_points_per_booking: number;
  referral_reward_points: number;
  // Branding
  app_name: string;
  app_tagline: string;
  logo_url: string;
  favicon_url: string;
  // Social Links
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  twitter_url: string;
  // Legal
  terms_url: string;
  privacy_url: string;
  refund_policy_url: string;
  // Map
  map_default_lat: number;
  map_default_lng: number;
  map_default_zoom: number;
  // Spin Wheel
  spin_cooldown_hours: number;
  spin_max_points: number;
  spin_min_points: number;
  // Booking extras
  late_checkout_fee: number;
  early_checkin_fee: number;
  damage_deposit: number;
  // Notifications
  booking_reminder_hours: number;
  review_prompt_hours: number;
  // Splash
  splash_variant: string;
}

const defaults: AppConfig = {
  extra_mattress_price: 500,
  room_capacity: 2,
  platform_fee: 49,
  service_fee_percent: 10,
  coupon_discount_percent: 10,
  max_mattresses_per_room: 1,
  cleaning_fee: 199,
  gst_percent: 18,
  free_cancel_hours: 48,
  partial_refund_percent: 50,
  partial_refund_hours: 24,
  min_booking_advance_hours: 2,
  check_in_time: "14:00",
  check_out_time: "11:00",
  support_phone: "+91-9876543210",
  support_email: "help@hushh.in",
  whatsapp_number: "+919876543210",
  max_guests_per_booking: 50,
  loyalty_points_per_booking: 50,
  referral_reward_points: 100,
  app_name: "Hushh",
  app_tagline: "Your private getaway",
  logo_url: "",
  favicon_url: "",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  twitter_url: "",
  terms_url: "",
  privacy_url: "",
  refund_policy_url: "",
  map_default_lat: 18.8563,
  map_default_lng: 82.5716,
  map_default_zoom: 13,
  spin_cooldown_hours: 24,
  spin_max_points: 500,
  spin_min_points: 10,
  late_checkout_fee: 300,
  early_checkin_fee: 300,
  damage_deposit: 1000,
  booking_reminder_hours: 24,
  review_prompt_hours: 48,
  splash_variant: "1",
};

const stringKeys = new Set([
  "check_in_time", "check_out_time", "support_phone", "support_email", "whatsapp_number",
  "app_name", "app_tagline", "logo_url", "favicon_url",
  "instagram_url", "facebook_url", "youtube_url", "twitter_url",
  "terms_url", "privacy_url", "refund_policy_url",
]);

let cachedConfig: AppConfig | null = null;
let listeners: Array<() => void> = [];

const notify = () => listeners.forEach(l => l());

export async function loadAppConfig(): Promise<AppConfig> {
  const { data } = await (supabase as any).from("app_config").select("key, value");
  const config = { ...defaults };
  if (data) {
    for (const row of data as any[]) {
      if (row.key in config) {
        (config as any)[row.key] = stringKeys.has(row.key) ? row.value : (Number(row.value) || (defaults as any)[row.key]);
      }
    }
  }
  cachedConfig = config;
  notify();
  return config;
}

export async function updateAppConfig(key: string, value: string) {
  await (supabase as any).from("app_config").update({ value }).eq("key", key);
  if (cachedConfig && key in cachedConfig) {
    (cachedConfig as any)[key] = stringKeys.has(key) ? value : (Number(value) || value);
    notify();
  }
}

export function useAppConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>(cachedConfig || defaults);

  useEffect(() => {
    if (!cachedConfig) loadAppConfig();
    const handler = () => { if (cachedConfig) setConfig({ ...cachedConfig }); };
    listeners.push(handler);
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, []);

  return config;
}
