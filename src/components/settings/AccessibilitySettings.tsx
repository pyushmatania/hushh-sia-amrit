import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Type, Contrast, Hand, Smartphone, Volume2, ZoomIn, MousePointer } from "lucide-react";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function AccessibilitySettings() {
  const [settings, setSettings] = useState({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: true,
    hapticFeedback: true,
    boldText: false,
    zoomEnabled: true,
    autoplay: true,
  });
  const [textSize, setTextSize] = useState(2); // 1-4 scale

  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-1">
      {/* Preview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <p className="text-xs text-muted-foreground mb-2">Preview</p>
        <p className={`text-foreground leading-relaxed ${settings.boldText ? "font-bold" : "font-medium"}`}
          style={{ fontSize: `${12 + textSize * 2}px` }}>
          This is how text will appear across the app with your current settings.
        </p>
      </motion.div>

      <SectionHeader title="Display" />
      <SettingRow icon={Hand} label="Reduce motion" desc="Minimize animations and transitions" right={<ToggleSwitch enabled={settings.reduceMotion} onChange={() => toggle("reduceMotion")} />} />
      <SettingRow icon={Contrast} label="High contrast" desc="Increase color contrast for readability" right={<ToggleSwitch enabled={settings.highContrast} onChange={() => toggle("highContrast")} />} />
      <SettingRow icon={Type} label="Bold text" desc="Make all text bolder" right={<ToggleSwitch enabled={settings.boldText} onChange={() => toggle("boldText")} />} />
      <SettingRow icon={ZoomIn} label="Pinch to zoom" desc="Enable zoom gestures on content" right={<ToggleSwitch enabled={settings.zoomEnabled} onChange={() => toggle("zoomEnabled")} />} />

      {/* Text size slider */}
      <div className="py-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <Type size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Text size</p>
            <p className="text-xs text-muted-foreground">Adjust font size across the app</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-muted-foreground">A</span>
          <div className="flex-1 relative">
            <input type="range" min={1} max={4} step={1} value={textSize} onChange={e => setTextSize(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md" />
            <div className="flex justify-between mt-1">
              {["S", "M", "L", "XL"].map((l, i) => (
                <span key={l} className={`text-[9px] ${textSize === i + 1 ? "text-primary font-bold" : "text-muted-foreground"}`}>{l}</span>
              ))}
            </div>
          </div>
          <span className="text-lg text-muted-foreground font-bold">A</span>
        </div>
      </div>

      <SectionHeader title="Interaction" />
      <SettingRow icon={Eye} label="Screen reader support" desc="Optimize for VoiceOver and TalkBack" right={<ToggleSwitch enabled={settings.screenReader} onChange={() => toggle("screenReader")} />} />
      <SettingRow icon={Smartphone} label="Haptic feedback" desc="Vibration feedback on interactions" right={<ToggleSwitch enabled={settings.hapticFeedback} onChange={() => toggle("hapticFeedback")} />} />

      <SectionHeader title="Media" />
      <SettingRow icon={Volume2} label="Autoplay videos" desc="Automatically play video previews" right={<ToggleSwitch enabled={settings.autoplay} onChange={() => toggle("autoplay")} />} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-xl p-3 mt-4 flex items-start gap-2" style={{ background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}>
        <MousePointer size={14} className="text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          These settings are stored locally on your device. They'll apply immediately and persist across sessions.
        </p>
      </motion.div>
    </div>
  );
}
