import { useState } from "react";
import { motion } from "framer-motion";
import { EyeOff, Shield, UserX, MapPinOff, MessageSquareOff, BellOff, Cookie } from "lucide-react";
import { usePrivacyMode } from "@/hooks/use-privacy-mode";
import { useToast } from "@/hooks/use-toast";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function PrivacySettings() {
  const { privacyMode, togglePrivacy } = usePrivacyMode();
  const { toast } = useToast();
  const [extras, setExtras] = useState({
    discreet_notif: false,
    private_entry: false,
    hide_activity: false,
    hide_profile: false,
    block_screenshots: false,
    incognito_browsing: false,
    analytics_opt_out: false,
  });

  const toggleExtra = (key: string) => setExtras(s => ({ ...s, [key]: !s[key as keyof typeof extras] }));

  return (
    <div className="space-y-1">
      {/* Privacy mode hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 mb-4"
        style={{ background: privacyMode ? "linear-gradient(145deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.06))" : "linear-gradient(145deg, hsl(var(--muted) / 0.5), hsl(var(--muted) / 0.3))", border: `1px solid ${privacyMode ? "hsl(var(--primary) / 0.2)" : "hsl(var(--border))"}` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <EyeOff size={18} className={privacyMode ? "text-primary" : "text-muted-foreground"} />
            <p className="text-sm font-bold text-foreground">Privacy Mode</p>
          </div>
          <ToggleSwitch enabled={privacyMode} onChange={togglePrivacy} />
        </div>
        <p className="text-xs text-muted-foreground">
          {privacyMode
            ? "🤫 Active — Your name, booking IDs, and personal details are masked on screen. Perfect for shared devices or public viewing."
            : "When enabled, sensitive information like your name and booking details will be hidden from the screen."}
        </p>
        {privacyMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-500 font-semibold">Privacy shield active</span>
          </motion.div>
        )}
      </motion.div>

      <SectionHeader title="Screen Privacy" />
      <SettingRow icon={EyeOff} label="Discreet notifications" desc="Show minimal info in push alerts"
        right={<ToggleSwitch enabled={extras.discreet_notif} onChange={() => toggleExtra("discreet_notif")} />} />
      <SettingRow icon={Shield} label="Block screenshots" desc="Prevent screen captures in the app"
        right={<ToggleSwitch enabled={extras.block_screenshots} onChange={() => { toggleExtra("block_screenshots"); toast({ title: extras.block_screenshots ? "Screenshots allowed" : "Screenshots blocked 🔒" }); }} />} />

      <SectionHeader title="Profile Privacy" />
      <SettingRow icon={UserX} label="Hide profile from search" desc="Others can't find your profile"
        right={<ToggleSwitch enabled={extras.hide_profile} onChange={() => toggleExtra("hide_profile")} />} />
      <SettingRow icon={MessageSquareOff} label="Hide online activity" desc="Don't show when you were last active"
        right={<ToggleSwitch enabled={extras.hide_activity} onChange={() => toggleExtra("hide_activity")} />} />

      <SectionHeader title="Booking Privacy" />
      <SettingRow icon={MapPinOff} label="Private entry instructions" desc="Get discreet arrival directions"
        right={<ToggleSwitch enabled={extras.private_entry} onChange={() => toggleExtra("private_entry")} />} />
      <SettingRow icon={BellOff} label="Incognito browsing" desc="Don't save browsing history locally"
        right={<ToggleSwitch enabled={extras.incognito_browsing} onChange={() => toggleExtra("incognito_browsing")} />} />

      <SectionHeader title="Data Privacy" />
      <SettingRow icon={Cookie} label="Opt out of analytics" desc="Don't send usage analytics data"
        right={<ToggleSwitch enabled={extras.analytics_opt_out} onChange={() => { toggleExtra("analytics_opt_out"); toast({ title: extras.analytics_opt_out ? "Analytics enabled" : "Opted out of analytics" }); }} />} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-xl p-3 mt-4 flex items-start gap-2" style={{ background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}>
        <Shield size={14} className="text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          <span className="text-foreground font-medium">Your privacy matters.</span> We never sell your data or share it with third parties. These controls give you full authority over what's visible and tracked.
        </p>
      </motion.div>
    </div>
  );
}
