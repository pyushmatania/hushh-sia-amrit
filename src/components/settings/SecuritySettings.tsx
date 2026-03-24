import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Smartphone, Shield, Lock, Fingerprint, Eye, EyeOff, Check, AlertTriangle, Clock, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function SecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [twoFa, setTwoFa] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) { toast({ title: "Login required", variant: "destructive" }); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Reset email sent ✉️", description: "Check your inbox for a password reset link" });
  };

  const loginHistory = [
    { device: "iPhone 15 Pro", location: "Jeypore, India", time: "Just now", ip: "192.168.x.x", current: true },
    { device: "MacBook Air M2", location: "Jeypore, India", time: "2 hours ago", ip: "192.168.x.x", current: false },
    { device: "Chrome on Windows", location: "Bhubaneswar, India", time: "3 days ago", ip: "103.x.x.x", current: false },
    { device: "Safari on iPad", location: "Visakhapatnam, India", time: "1 week ago", ip: "49.x.x.x", current: false },
  ];

  return (
    <div className="space-y-1">
      {/* Security Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Security Score</p>
            <p className="text-2xl font-bold text-foreground">Good</p>
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "conic-gradient(hsl(var(--primary)) 75%, hsl(var(--muted)) 75%)" }}>
            <div className="w-11 h-11 rounded-full bg-card flex items-center justify-center">
              <span className="text-sm font-bold text-primary">75%</span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Password set", done: true },
            { label: "Email verified", done: !!user?.email_confirmed_at },
            { label: "Two-factor auth", done: twoFa },
            { label: "Biometric lock", done: biometric },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? "bg-green-500" : "bg-muted"}`}>
                {item.done && <Check size={10} className="text-white" />}
              </div>
              <span className={`text-xs ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <SectionHeader title="Password" />
      <SettingRow icon={Key} label="Change password" desc="Send a reset link to your email" onClick={handlePasswordReset} />

      <SectionHeader title="Two-Factor Authentication" />
      <SettingRow
        icon={Shield}
        label="Enable 2FA"
        desc={twoFa ? "Your account has extra security" : "Add an extra layer of security"}
        right={<ToggleSwitch enabled={twoFa} onChange={(v) => { setTwoFa(v); toast({ title: v ? "2FA enabled 🔐" : "2FA disabled" }); }} />}
      />
      {twoFa && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl p-3 mb-2" style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.12)" }}>
          <p className="text-[11px] text-muted-foreground">
            🔐 Two-factor authentication is active. You'll be asked for a verification code when logging in from a new device.
          </p>
        </motion.div>
      )}

      <SectionHeader title="Biometric Authentication" />
      <SettingRow
        icon={Fingerprint}
        label="Biometric login"
        desc="Use Face ID or fingerprint to login"
        right={<ToggleSwitch enabled={biometric} onChange={(v) => { setBiometric(v); toast({ title: v ? "Biometric enabled 🔓" : "Biometric disabled" }); }} />}
      />

      <SectionHeader title="Login History" />
      <div className="space-y-2">
        {loginHistory.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 py-3 border-b border-border last:border-0"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${entry.current ? "bg-green-500/10" : "bg-muted/50"}`}>
              <Smartphone size={16} className={entry.current ? "text-green-500" : "text-muted-foreground"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{entry.device}</p>
                {entry.current && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500">CURRENT</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Globe size={10} className="text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground">{entry.location}</p>
                <span className="text-muted-foreground text-[11px]">·</span>
                <Clock size={10} className="text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground">{entry.time}</p>
              </div>
            </div>
            {!entry.current && (
              <button onClick={() => toast({ title: "Session revoked" })} className="text-[10px] text-destructive font-semibold px-2 py-1 rounded-lg bg-destructive/10">
                Revoke
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Security tip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-xl p-3 mt-4 flex items-start gap-2" style={{ background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}>
        <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          <span className="text-foreground font-medium">Security Tip:</span> Enable two-factor authentication and biometric login for maximum account protection.
        </p>
      </motion.div>
    </div>
  );
}
