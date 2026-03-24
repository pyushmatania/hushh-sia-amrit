import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Type, Contrast, Vibrate, MonitorSmartphone, Hand } from "lucide-react";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: true,
    hapticFeedback: true,
    boldText: false,
  });

  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const items = [
    { key: "reduceMotion" as const, icon: Hand, label: "Reduce motion", desc: "Minimize animations and transitions" },
    { key: "highContrast" as const, icon: Contrast, label: "High contrast", desc: "Increase color contrast for better visibility" },
    { key: "largeText" as const, icon: Type, label: "Larger text", desc: "Increase font sizes throughout the app" },
    { key: "boldText" as const, icon: Type, label: "Bold text", desc: "Make all text bolder for readability" },
    { key: "screenReader" as const, icon: Eye, label: "Screen reader support", desc: "Optimize for VoiceOver and TalkBack" },
    { key: "hapticFeedback" as const, icon: Vibrate, label: "Haptic feedback", desc: "Vibration feedback on interactions" },
  ];

  return (
    <div className="space-y-1">
      <SectionHeader title="Display" />
      {items.slice(0, 4).map((item, i) => (
        <SettingRow key={item.key} icon={item.icon} label={item.label} desc={item.desc} delay={i * 0.04} right={<ToggleSwitch enabled={settings[item.key]} onChange={() => toggle(item.key)} />} />
      ))}
      <SectionHeader title="Interaction" />
      {items.slice(4).map((item, i) => (
        <SettingRow key={item.key} icon={item.icon} label={item.label} desc={item.desc} delay={(i + 4) * 0.04} right={<ToggleSwitch enabled={settings[item.key]} onChange={() => toggle(item.key)} />} />
      ))}
    </div>
  );
}
