import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppConfig {
  extra_mattress_price: number;
  room_capacity: number;
  platform_fee: number;
  service_fee_percent: number;
  coupon_discount_percent: number;
  max_mattresses_per_room: number;
}

const defaults: AppConfig = {
  extra_mattress_price: 500,
  room_capacity: 2,
  platform_fee: 49,
  service_fee_percent: 10,
  coupon_discount_percent: 10,
  max_mattresses_per_room: 1,
};

let cachedConfig: AppConfig | null = null;
let listeners: Array<() => void> = [];

const notify = () => listeners.forEach(l => l());

export async function loadAppConfig(): Promise<AppConfig> {
  const { data } = await (supabase as any).from("app_config").select("key, value");
  const config = { ...defaults };
  if (data) {
    for (const row of data as any[]) {
      if (row.key in config) {
        (config as any)[row.key] = Number(row.value) || (defaults as any)[row.key];
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
    (cachedConfig as any)[key] = Number(value) || value;
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
