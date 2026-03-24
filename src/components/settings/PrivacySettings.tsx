import { useState } from "react";
import { motion } from "framer-motion";
import { EyeOff } from "lucide-react";
import { usePrivacyMode } from "@/hooks/use-privacy-mode";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function PrivacySettings() {
  const { privacyMode, togglePrivacy } = usePrivacyMode();
  const [extras, setExtras] = useState({ discreet_notif: false, private_entry: false, hide_activity: false });

  const items = [
    { key: "privacy_mode", label: "Privacy Mode 🤫", desc: "Hide your name & booking IDs from screen", isPrivacy: true },
    { key: "discreet_notif", label: "Discreet notifications", desc: "Show minimal info in push notifications" },
    { key: "private_entry", label: "Private entry instructions", desc: "Get discreet arrival directions" },
    { key: "hide_activity", label: "Hide online activity", desc: "Don't show when you were last active" },
  ];

  return (
    <div className="space-y-1">
      <SectionHeader title="Privacy Controls" />
      {items.map((item, i) => (
        <SettingRow
          key={item.key}
          label={item.label}
          desc={item.desc}
          delay={i * 0.04}
          right={
            <ToggleSwitch
              enabled={item.isPrivacy ? privacyMode : extras[item.key as keyof typeof extras] || false}
              onChange={() => item.isPrivacy ? togglePrivacy() : setExtras(s => ({ ...s, [item.key]: !s[item.key as keyof typeof extras] }))}
            />
          }
        />
      ))}
      {privacyMode && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl p-3 mt-2" style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
          <p className="text-[11px] text-muted-foreground">
            🤫 <span className="text-foreground font-medium">Privacy Mode is ON.</span> Your name and booking details are masked on-screen. Perfect for shared devices.
          </p>
        </motion.div>
      )}
    </div>
  );
}
